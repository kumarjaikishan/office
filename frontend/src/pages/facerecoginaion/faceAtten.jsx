import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const videoWidth = 720;
const videoHeight = 560;

const FaceAttendance = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [mode, setMode] = useState(null); // punch-in or punch-out
    const [descriptors, setDescriptors] = useState([]);
    const [cameraActive, setCameraActive] = useState(false);
    const { employee } = useSelector((state) => state.user);

    useEffect(() => {
        const loadScript = async () => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
            script.async = true;
            script.onload = () => loadModels();
            document.body.appendChild(script);
        };
        loadScript();
    }, []);


    const loadModels = async () => {
        await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        loadStoredDescriptors();
    };
    const [idMap, setIdMap] = useState({});

    // const loadStoredDescriptors = () => {
    //     const all = employee?.filter(emp => emp.faceDescriptor)
    //         .map(emp => {
    //             const name = emp.userid.name; // or emp.employeeNumber or unique identifier
    //             const descriptorArray = new Float32Array(emp.faceDescriptor);
    //             return new window.faceapi.LabeledFaceDescriptors(name, [descriptorArray]);
    //         });

    //     setDescriptors(all);
    // };

    const loadStoredDescriptors = () => {
        const idMapTemp = {};

        const all = employee?.filter(emp => emp.faceDescriptor)
            .map(emp => {
                const name = emp.userid.name; // used as the label
                const descriptorArray = new Float32Array(emp.faceDescriptor);
                idMapTemp[name] = emp._id; // map name to employeeId
                return new window.faceapi.LabeledFaceDescriptors(name, [descriptorArray]);
            });

        setDescriptors(all);
        setIdMap(idMapTemp); // store map
    };

    const startCamera = async () => {
        setCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        setCameraActive(false);
    };

    const recognizeAndPunch = async () => {
        const detection = await window.faceapi
            .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) {
            toast.warn('No face detected. Try again.');
            return;
        }

        const matcher = new window.faceapi.FaceMatcher(descriptors, 0.6);
        const bestMatch = matcher.findBestMatch(detection.descriptor);

        if (bestMatch.label === 'unknown') {
            toast.error('Face not recognized');
            return;
        }

        const matchedEmployeeId = idMap[bestMatch.label]; // get ID from label
        if (!matchedEmployeeId) {
            toast.error('Employee ID not found for matched label');
            return;
        }

        // Show bounding box
        const canvas = canvasRef.current;
        canvas.innerHTML = '';
        const drawCanvas = window.faceapi.createCanvasFromMedia(videoRef.current);
        canvas.appendChild(drawCanvas);
        const displaySize = { width: videoWidth, height: videoHeight };
        window.faceapi.matchDimensions(drawCanvas, displaySize);
        const resized = window.faceapi.resizeResults(detection, displaySize);
        window.faceapi.draw.drawDetections(drawCanvas, resized);

        // ✅ API CALL
        const token = localStorage.getItem('emstoken');
        const address = mode == 'punch-in' ? `${import.meta.env.VITE_API_ADDRESS}facecheckin` :`${import.meta.env.VITE_API_ADDRESS}facecheckout`
        // return toast.success(`face found ${bestMatch.label} and emp id ${matchedEmployeeId}`)
        try {
            const res = await axios.post(
                address,
                {
                    employeeId: matchedEmployeeId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success(res.data.message || `Successfully Punched In`);
            stopCamera();
        } catch (error) {
            console.log(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    const handleMode = (selectedMode) => {
        setMode(selectedMode);
        startCamera();
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Face Attendance</h2>
            <div className="flex gap-4 mb-4">
                <button
                    onClick={() => handleMode('punch-in')}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Punch In
                </button>
                <button
                    onClick={() => handleMode('punch-out')}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Punch Out
                </button>
            </div>

            {cameraActive && (
                <div className="relative w-fit">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        width={videoWidth}
                        height={videoHeight}
                        className="border mb-4"
                        onPlay={() => setTimeout(recognizeAndPunch, 1500)}
                    />
                    <div ref={canvasRef} className="absolute top-0 left-0" />
                    <button
                        onClick={stopCamera}
                        className="bg-gray-500 text-white px-4 py-1 rounded"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default FaceAttendance;
