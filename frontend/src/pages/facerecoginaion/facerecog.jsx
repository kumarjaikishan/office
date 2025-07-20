import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import swal from 'sweetalert';

const videoWidth = 350;
const videoHeight = 350;

const FaceEnrollment = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const detectionIntervalRef = useRef(null);

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [descriptor, setDescriptor] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [detecting, setDetecting] = useState(false);

    const { employee: employeeList } = useSelector((state) => state.user);

    useEffect(() => {
        const loadFaceAPI = async () => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
            script.async = true;
            script.onload = () => loadModels();
            document.body.appendChild(script);
        };
        loadFaceAPI();

        return () => {
            stopCamera(); // Cleanup on unmount
        };
    }, []);

    const loadModels = async () => {
        await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
    };

    const startCamera = async () => {
        setCameraActive(true);
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            const defaultCamera = videoDevices[0];

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: defaultCamera.deviceId ? { exact: defaultCamera.deviceId } : undefined,
                    width: videoWidth,
                    height: videoHeight,
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            captureDescriptor();
        } catch (error) {
            console.error('Camera access error:', error);
            toast.error('Unable to access the camera. Please check permissions.');
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        setCameraActive(false);
        setDetecting(false);

        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
            videoRef.current.srcObject = null;
        }

        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
    };

    const captureDescriptor = () => {
        if (!videoRef.current) return;

        setDetecting(true);

        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }

        detectionIntervalRef.current = setInterval(async () => {
            const result = await window.faceapi
                .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (result) {
                clearInterval(detectionIntervalRef.current);
                detectionIntervalRef.current = null;
                setDescriptor(Array.from(result.descriptor));
                setDetecting(false);
                stopCamera();
                swal({
                    title: 'Face Captured Successfully',
                    text: 'Proceed to Face Enrollment?',
                    icon: 'success',
                    buttons: {
                        cancel: {
                            text: 'Cancel',
                            value: false,
                            visible: true,
                            className: 'bg-gray-300 text-black px-4 py-1 rounded',
                            closeModal: true,
                        },
                        confirm: {
                            text: 'Proceed Now',
                            value: true,
                            visible: true,
                            className: 'bg-teal-500 text-white px-4 py-1 rounded',
                            closeModal: true,
                        }
                    },
                    dangerMode: false,
                }).then(async (okay) => {
                    if (okay) {
                        handleSubmit();
                    }
                });
                // toast.success('Face captured. Click "Submit Enrollment" to save.');
            }
        }, 500);
    };

    const handleSubmit = async () => {
        if (!selectedEmployee || !descriptor) {
            return toast.warn('Missing employee or face data');
        }

        const token = localStorage.getItem('emstoken');
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_ADDRESS}enrollFace`,
                {
                    employeeId: selectedEmployee._id,
                    descriptor,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            toast.success(res.data.message, { autoClose: 1200 });
            stopCamera();
            setDescriptor(null);
        } catch (error) {
            console.error(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else {
                toast.error('An unexpected error occurred.');
            }
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Face Enrollment</h2>

            <select
                className="border p-2 mb-4 w-full"
                onChange={(e) => {
                    const emp = employeeList.find(emp => emp._id === e.target.value);
                    setSelectedEmployee(emp);
                    setDescriptor(null);
                    stopCamera();
                }}
                defaultValue=""
            >
                <option value="" disabled>Select Employee</option>
                {employeeList.map(emp => (
                    <option key={emp._id} value={emp._id}>
                        {emp.userid.name} {emp.faceDescriptor !== null ? '✅' : '❌'}
                    </option>
                ))}
            </select>

            {selectedEmployee && (
                <div className="mb-4">
                    <img
                        src={selectedEmployee.profileimage}
                        alt="Profile"
                        className="w-24 h-24 object-cover rounded-full mb-2"
                    />
                    <p className="text-sm">{selectedEmployee.userid.email}</p>

                    {!cameraActive && (
                        <button
                            onClick={startCamera}
                            className="bg-blue-500 text-white px-4 py-1 rounded mt-4"
                        >
                            Start Enroll
                        </button>
                    )}
                </div>
            )}

            {cameraActive && (
                <div>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        width={videoWidth}
                        height={videoHeight}
                        className="rounded-full border-2 border-teal-500 border-dashed p-1 my-4"
                    />
                    <div ref={canvasRef}></div>

                    <div className="flex gap-4 mt-2 items-center">
                        <button
                            onClick={captureDescriptor}
                            className="bg-yellow-500 text-white px-4 py-1 rounded"
                            disabled={detecting}
                        >
                            {detecting ? 'Detecting...' : 'Capture Face'}
                        </button>
                        {/* <button
                            onClick={handleSubmit}
                            className="bg-green-500 text-white px-4 py-1 rounded"
                            disabled={!descriptor}
                        >
                            Submit Enrollment
                        </button> */}
                        <button
                            onClick={stopCamera}
                            className="bg-red-500 text-white px-4 py-1 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaceEnrollment;
