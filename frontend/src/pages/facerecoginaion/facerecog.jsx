import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const videoWidth = 720;
const videoHeight = 560;

const FaceEnrollment = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
   
    const [descriptor, setDescriptor] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

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
    }, []);

    const loadModels = async () => {
        await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
        // fetchEnrolled();
    };


    const startCamera = async () => {
        setCameraActive(true);
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
    };

    const stopCamera = () => {
        setCameraActive(false);
        if (videoRef.current?.srcObject) {
            videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
    };

    const captureDescriptor = async () => {
        const result = await window.faceapi
            .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!result) {
            alert('Face not detected. Try again.');
            return;
        }

        setDescriptor(Array.from(result.descriptor));
        alert('Face captured. Click "Submit Enrollment" to save.');
    };

    const handleSubmit = async () => {
        if (!selectedEmployee || !descriptor) return alert('Missing employee or face data');

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
                        // 'Content-Type': 'multipart/form-data'
                    }
                }
            );

            toast.success(res.data.message, { autoClose: 1200 });
            stopCamera();
            setDescriptor(null);
        } catch (error) {
            console.log(error);
            if (error.response) {
                toast.warn(error.response.data.message, { autoClose: 1200 });
            } else {
                console.error('Error:', error.message);
            }
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Face Enrollment</h2>

            <select
                className="border p-2 mb-4 w-full"
                onChange={(e) => {
                    const emp = employeeList.find((emp) => emp._id === e.target.value);
                    setSelectedEmployee(emp);
                    setDescriptor(null);
                    stopCamera();
                }}
                defaultValue=""
            >
                <option value="" disabled>
                    Select Employee
                </option>
                {employeeList.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                        {emp.userid.name} {emp.faceDescriptor !==null ? '✅' : '❌'}
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
                        className="border my-4"
                    />
                    <div ref={canvasRef}></div>

                    <div className="flex gap-4 mt-2">
                        <button
                            onClick={captureDescriptor}
                            className="bg-yellow-500 text-white px-4 py-1 rounded"
                        >
                            Capture Face
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 text-white px-4 py-1 rounded"
                        >
                            Submit Enrollment
                        </button>
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
