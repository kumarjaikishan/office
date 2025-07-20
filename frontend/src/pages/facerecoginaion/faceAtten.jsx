import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

const videoWidth = 350;
const videoHeight = 350;

const FaceAttendance = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const timeoutRef = useRef(null);
    const detectionLockRef = useRef(false);
    const detectionIntervalRef = useRef(null);
    const modeRef = useRef(null);

    const [mode, setMode] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [detectedemp, setDetectedEmp] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);

    const { employee } = useSelector((state) => state.user);

    const descriptorsRef = useRef([]);
    const matcherRef = useRef(null);
    const idMapRef = useRef({});
    const modelsLoadedRef = useRef(false);

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
        if (modelsLoadedRef.current) return;

        await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);

        modelsLoadedRef.current = true;
        loadDescriptors();
    };

    const loadDescriptors = () => {
        const idMap = {};
        const labeledDescriptors = employee
            ?.filter(emp => emp.faceDescriptor)
            .map(emp => {
                const name = emp.userid.name;
                const descriptorArray = new Float32Array(emp.faceDescriptor);
                idMap[name] = emp._id;
                return new window.faceapi.LabeledFaceDescriptors(name, [descriptorArray]);
            });

        descriptorsRef.current = labeledDescriptors;
        matcherRef.current = new window.faceapi.FaceMatcher(labeledDescriptors, 0.6);
        idMapRef.current = idMap;
    };

    const startCamera = async () => {
        setCameraActive(true);
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            setAvailableCameras(videoDevices);

            const deviceIdToUse = selectedDeviceId || videoDevices[0]?.deviceId;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: deviceIdToUse ? { exact: deviceIdToUse } : undefined,
                    width: videoWidth,
                    height: videoHeight,
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    startDetectionLoop();
                };
            }
        } catch (error) {
            console.error('Camera access error:', error);
            toast.error('Unable to access the camera. Check permissions.');
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }

        const videoElement = videoRef.current;
        if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject;
            stream.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }

        detectionLockRef.current = false;
        setCameraActive(false);
    };

    const startDetectionLoop = () => {
        detectionIntervalRef.current = setInterval(() => {
            recognizeAndPunch();
        }, 600);
    };

    const recognizeAndPunch = async () => {
        try {
            if (detectionLockRef.current || !videoRef.current) return;

            const tinyOptions = new window.faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5,
            });

            const detection = await window.faceapi
                .detectSingleFace(videoRef.current, tinyOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) return;

            const bestMatch = matcherRef.current.findBestMatch(detection.descriptor);
            if (bestMatch.label === 'unknown') {
                toast.error('Face not recognized');
                stopCamera();
                return;
            }

            detectionLockRef.current = true;

            const matchedEmployeeId = idMapRef.current[bestMatch.label];
            if (!matchedEmployeeId) {
                toast.error('Matched name not linked to an employee ID');
                stopCamera();
                return;
            }

            const empdetail = employee.find((val) => val._id === matchedEmployeeId);

            const canvasContainer = canvasRef.current;
            if (canvasContainer) {
                while (canvasContainer.firstChild) {
                    canvasContainer.removeChild(canvasContainer.firstChild);
                }

                const drawCanvas = window.faceapi.createCanvasFromMedia(videoRef.current);
                canvasContainer.appendChild(drawCanvas);

                const displaySize = { width: videoWidth, height: videoHeight };
                window.faceapi.matchDimensions(drawCanvas, displaySize);
                const resized = window.faceapi.resizeResults(detection, displaySize);
                window.faceapi.draw.drawDetections(drawCanvas, resized);
            }

            const token = localStorage.getItem('emstoken');
            const endpoint =
                modeRef.current === 'punch-in'
                    ? `${import.meta.env.VITE_API_ADDRESS}facecheckin`
                    : `${import.meta.env.VITE_API_ADDRESS}facecheckout`;

            const res = await axios.post(
                endpoint,
                { employeeId: matchedEmployeeId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setDetectedEmp({
                name: empdetail?.userid.name,
                profile: empdetail?.profileimage,
                designation: empdetail.designation,
                department: empdetail.department.department,
                punchIn: res.data.attendance.punchIn ? dayjs(res.data.attendance.punchIn).format('hh:mm A') : '-- : --',
                punchOut: res.data.attendance.punchOut ? dayjs(res.data.attendance.punchOut).format('hh:mm A') : '-- : --',
                workinghour: res.data.attendance.workingMinutes ?? '-- : --',
            });

            toast.success(res.data.message || `Successfully punched ${modeRef.current === 'punch-in' ? 'in' : 'out'}`);
            stopCamera();

            timeoutRef.current = setTimeout(() => {}, 15000);

        } catch (err) {
            console.error('Recognition error:', err);
            toast.warn(err.response?.data?.message || 'Error during recognition');
            stopCamera();
        }
    };

    const handleMode = (selectedMode) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        setDetectedEmp(null);
        setMode(selectedMode);
        modeRef.current = selectedMode;
        startCamera();
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Face Attendance</h2>
            <div className="flex items-center justify-center flex-col p-4">
                <div className="flex w-full gap-4 mb-4">
                    <button
                        onClick={() => handleMode('punch-in')}
                        className="bg-blue-500 w-xl text-white px-4 py-2 rounded"
                    >
                        Punch In
                    </button>
                    <button
                        onClick={() => handleMode('punch-out')}
                        className="bg-red-500 w-xl text-white px-4 py-2 rounded"
                    >
                        Punch Out
                    </button>
                </div>

                {availableCameras.length > 1 && (
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-1">Select Camera:</label>
                        <select
                            value={selectedDeviceId || ''}
                            onChange={(e) => setSelectedDeviceId(e.target.value)}
                            className="border rounded px-2 py-1"
                        >
                            {availableCameras.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId}`}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {detectedemp && (
                    <>
                        <div className="flex justify-center flex-col md:flex-row items-center w-[450px] md:items-start gap-6 p-4 bg-white shadow-lg rounded-2xl mt-6 max-w-full">
                            <img
                                src={detectedemp?.profile}
                                alt="Profile"
                                className="w-38 h-38 rounded-full object-cover border-2 border-teal-500 border-dashed p-1"
                            />
                            <div className="flex flex-col justify-center gap-2 text-sm w-full">
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Name</span><span>{detectedemp.name}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Designation</span><span>{detectedemp.designation}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Department</span><span>{detectedemp.department}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Punch In</span><span>{detectedemp.punchIn}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Punch Out</span><span>{detectedemp.punchOut}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Working Hour</span><span>{detectedemp.workinghour}</span></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center text-center text-lg font-semibold text-gray-700 mb-2">
                            {detectedemp.punchIn && !detectedemp.punchOut ? (
                                <p>👋 Good {dayjs().hour() < 12 ? 'Morning' : dayjs().hour() < 17 ? 'Afternoon' : 'Evening'}, {detectedemp.name}! You have punched in successfully.</p>
                            ) : detectedemp.punchOut ? (
                                <p>✅ Great job today, {detectedemp.name}! You’ve successfully punched out.</p>
                            ) : null}
                        </div>
                    </>
                )}

                {cameraActive && (
                    <div className="relative w-fit text-center">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            width={videoWidth}
                            height={videoHeight}
                            className="rounded-full border-2 border-teal-500 border-dashed p-1 my-4"
                        />
                        <div ref={canvasRef} className="absolute top-0 left-0" />
                        <button className="bg-teal-600 mr-2 text-white px-4 py-1 rounded mt-2">
                            Scanning ...
                        </button>
                        <button
                            onClick={stopCamera}
                            className="bg-gray-600 text-white px-4 py-1 rounded mt-2"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceAttendance;
