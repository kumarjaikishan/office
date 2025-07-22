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
    const [mirror, setmirror] = useState(false);

    const { employee } = useSelector((state) => state.user);

    const descriptorsRef = useRef([]);
    const matcherRef = useRef(null);
    const idMapRef = useRef({});
    const modelsLoadedRef = useRef(false);


    useEffect(() => {
        if (cameraActive && selectedDeviceId) {
            stopCamera();      // Stop current stream
            startCamera();     // Start with new device
        }

        let nowcamera = availableCameras.filter(e => e.deviceId == selectedDeviceId)[0]
        let label = nowcamera?.label.toLowerCase();
        if (label?.includes('webcam') || label?.includes('front')) {
            console.log('Front-facing webcam detected:', nowcamera);
            setmirror(true)
        }
    }, [selectedDeviceId]);

    useEffect(() => {
        return () => {
            stopCamera(); // Only run once on unmount
        };
    }, []);

    useEffect(() => {
        const storedDeviceId = localStorage.getItem('selectedCameraId');
        if (storedDeviceId) {
            setSelectedDeviceId(storedDeviceId);
        }
        let nowcamera = availableCameras.filter(e => e.deviceId == storedDeviceId)[0]
        let label = nowcamera?.label.toLowerCase();
        if (label?.includes('webcam') || label?.includes('front')) {
            console.log('Front-facing webcam detected:', nowcamera);
            setmirror(true)
        }
    }, []);


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
            ?.filter(emp => emp.faceDescriptor && emp.faceDescriptor.length === 128)
            .map(emp => {
                const name = emp.userid.name;
                const descriptorArray = new Float32Array(emp.faceDescriptor);
                idMap[name] = emp._id;
                return new window.faceapi.LabeledFaceDescriptors(name, [descriptorArray]);
            });

        descriptorsRef.current = labeledDescriptors;
        idMapRef.current = idMap;

        // 🔐 Don't create matcher if no valid data
        if (labeledDescriptors.length > 0) {
            matcherRef.current = new window.faceapi.FaceMatcher(labeledDescriptors, 0.6);
        } else {
            matcherRef.current = null;
            toast.warn('No face data available for comparison. Please enroll first.');
        }
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
        console.log("call lagane aaya")
        if (detectionLockRef.current || !videoRef.current) return;

        // Set lock immediately to avoid parallel calls
        detectionLockRef.current = true;
        try {

            const tinyOptions = new window.faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5,
            });

            const detection = await window.faceapi
                .detectSingleFace(videoRef.current, tinyOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                detectionLockRef.current = false; // 🟢 Unlock if no face detected
                return;
            }

            const bestMatch = matcherRef.current.findBestMatch(detection?.descriptor);
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
            console.log("calling...")
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

            timeoutRef.current = setTimeout(() => { }, 15000);

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
    const employepic = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp'

    return (
        <div className="p-2 md:p-6">
            <h2 className="text-xl font-bold mb-2">Face Attendance</h2>
            <div className="flex items-center justify-center flex-col p-0">
                <div className="flex w-full gap-4 mb-2">
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
                    <div className="mb-2">
                        <label className="block text-sm font-semibold ">Select Camera:</label>
                        <select
                            value={selectedDeviceId || ''}
                            onChange={(e) => {
                                const deviceId = e.target.value;
                                localStorage.setItem('selectedCameraId', deviceId);
                                setSelectedDeviceId(deviceId);
                            }}

                            className="border rounded px-2 py-1"
                        >
                            {availableCameras?.map((device) => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Camera ${device.deviceId}`}
                                </option>
                            ))}
                        </select>
                        <button onClick={() => setmirror(!mirror)} className="bg-teal-600 ml-2 text-white px-4 py-1 rounded mt-2">
                            Mirror
                        </button>
                    </div>
                )}

                {detectedemp && (
                    <>
                        <div className="flex justify-center flex-col md:flex-row items-center w-full md:w-[450px] md:items-start gap-6 p-2 md:p-4 bg-white shadow-lg rounded-2xl mt-2 mb-2 max-w-full">
                            <img
                                src={detectedemp?.profile || employepic}
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
                        <div className="flex flex-col items-center text-center font-semibold text-gray-700 mb-2">
                            {detectedemp.punchIn && detectedemp.punchOut == '-- : --' ? (<>
                                <p>👋 Good {dayjs().hour() < 12 ? 'Morning' : dayjs().hour() < 17 ? 'Afternoon' : 'Evening'}, {detectedemp.name}! </p><p> You have punched in successfully.</p></>
                            ) :
                                <> <p>✅ Great job today, {detectedemp.name}! </p> <p> You’ve successfully punched out.</p> </>
                            }
                        </div>
                    </>
                )}

                {cameraActive && (
                    <div className="relative w-fit text-center">
                        {/* <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={mirror} onChange={() => setMirror(!mirror)} />
                            Mirror video
                        </label> */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            width={videoWidth}
                            height={videoHeight}
                            className={`rounded-full border-2 border-teal-500 ${mirror ? '-scale-x-100' : ''} border-dashed p-1 my-4 }`}
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
