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
    
    // Add state to hold available cameras and selected one
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState(null);

    const { employee: employeeList } = useSelector((state) => state.user);
    useEffect(() => {
        const lastUsedCamera = localStorage.getItem('lastUsedCameraId');
        if (lastUsedCamera) {
            setSelectedCameraId(lastUsedCamera);
        }
    }, []);

    useEffect(() => {
        if (selectedCameraId) {
            localStorage.setItem('lastUsedCameraId', selectedCameraId);
        }
    }, [selectedCameraId]);


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
            setAvailableCameras(videoDevices);

            const chosenDevice = videoDevices.find(d => d.deviceId === selectedCameraId) || videoDevices[0];
            setSelectedCameraId(chosenDevice.deviceId);

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: chosenDevice.deviceId ? { exact: chosenDevice.deviceId } : undefined,
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

            const capturedDescriptor = Array.from(result.descriptor);
            setDescriptor(capturedDescriptor); // still set for UI/debug, etc.

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
                    await handleSubmit(capturedDescriptor); // Pass directly
                }
            });
        }
    }, 500);
};

    const deletefaceenroll = async () => {
        const token = localStorage.getItem('emstoken');
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_API_ADDRESS}deletefaceenroll`,
                {
                    employeeId: selectedEmployee._id,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            toast.success(res.data.message, { autoClose: 1200 });

        } catch (error) {
            console.error(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else {
                toast.error('An unexpected error occurred.');
            }
        }

    }

    const handleSubmit = async (capturedDescriptor = descriptor) => {
    if (!selectedEmployee || !capturedDescriptor || capturedDescriptor.length !== 128) {
        return toast.warn('Invalid face data. Please try capturing again.');
    }

    const token = localStorage.getItem('emstoken');
    try {
        const res = await axios.post(
            `${import.meta.env.VITE_API_ADDRESS}enrollFace`,
            {
                employeeId: selectedEmployee._id,
                descriptor: capturedDescriptor,
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
                    console.log(emp)
                    setDescriptor(null);
                    stopCamera();
                }}
                defaultValue=""
            >
                <option value="" disabled>Select Employee</option>
                {employeeList?.map(emp => (
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
                    <p className="text-sm">{selectedEmployee?.userid?.email}</p>

                    {!cameraActive && selectedEmployee?.faceDescriptor && (
                        <button
                            onClick={deletefaceenroll}
                            className="bg-red-500 mr-2 text-white px-4 py-1 rounded mt-4"
                        >
                            Delete Enroll
                        </button>
                    )}
                    {!cameraActive && (
                        <button
                            onClick={startCamera}
                            className="bg-blue-500 text-white px-4 py-1 rounded mt-4"
                        >
                            {selectedEmployee?.faceDescriptor ? ' Re-Enroll' : 'Start Enroll'}
                        </button>
                    )}
                </div>
            )}
            {availableCameras.length > 1 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Choose Camera:</label>
                    <select
                        className="border p-2 w-full"
                        value={selectedCameraId || ''}
                        onChange={(e) => setSelectedCameraId(e.target.value)}
                    >
                        {availableCameras.map((device) => (
                            <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(-4)}`}
                            </option>
                        ))}
                    </select>
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
                        className="rounded-full -scale-x-100 border-2 border-teal-500 border-dashed p-1 my-4"
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
