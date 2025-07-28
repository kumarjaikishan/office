import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { loadFaceAPI } from './loadModel';

const videoSize = { width: 350, height: 350 };
const scriptSrc = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';

const FaceAttendance = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const timeoutRef = useRef(null);
    const detectionLockRef = useRef(false);
    const detectionIntervalRef = useRef(null);
    const modeRef = useRef(null);

    const [mode, setMode] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [detectedEmp, setDetectedEmp] = useState(null);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [mirror, setMirror] = useState(false);

    const { employee } = useSelector((state) => state.user);

    const descriptorsRef = useRef([]);
    const matcherRef = useRef(null);
    const idMapRef = useRef({});
    const modelsLoadedRef = useRef(false);

    const isWebcam = (label) => label?.includes('webcam') || label?.includes('front');

    useEffect(() => {
        const storedDeviceId = localStorage.getItem('selectedCameraId');
        const storedMirror = localStorage.getItem('mirror');
        if (storedDeviceId) setSelectedDeviceId(storedDeviceId);
        if (storedMirror !== null) setMirror(storedMirror === 'true');
    }, []);

    useEffect(() => {
        if (!selectedDeviceId || !availableCameras.length) return;
        const label = availableCameras.find(e => e.deviceId === selectedDeviceId)?.label.toLowerCase();
        const shouldMirror = isWebcam(label);
        setMirror(shouldMirror);
        localStorage.setItem('mirror', shouldMirror);
    }, [selectedDeviceId, availableCameras]);


    useEffect(() => {
        const init = async () => {
            try {
                await loadFaceAPI(); // load script + models
                loadDescriptors();   // only after models are loaded
            } catch (err) {
                toast.error("Failed to load face-api models.");
                console.error(err);
            }
        };

        init();

        return () => stopCamera(); // cleanup
    }, []);

    const loadDescriptors = () => {
        const idMap = {};
        const labeledDescriptors = employee
            ?.filter(emp => emp.faceDescriptor?.length === 128)
            .map(emp => {
                idMap[emp.userid.name] = emp._id;
                return new window.faceapi.LabeledFaceDescriptors(emp.userid.name, [new Float32Array(emp.faceDescriptor)]);
            });

        descriptorsRef.current = labeledDescriptors;
        idMapRef.current = idMap;

        matcherRef.current = labeledDescriptors.length ? new window.faceapi.FaceMatcher(labeledDescriptors, 0.6) : null;
        if (!matcherRef.current) toast.warn('No face data available for comparison. Please enroll first.');
    };

    const checkCameraPermission = async () => {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            return result.state !== 'denied';
        } catch {
            return true;
        }
    };

    const startCamera = async () => {
        setCameraActive(true);
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            setAvailableCameras(videoDevices);

            const deviceIdToUse = selectedDeviceId || videoDevices[0]?.deviceId;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: deviceIdToUse ? { exact: deviceIdToUse } : undefined,
                    ...videoSize
                },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => startDetectionLoop();
            }
        } catch (error) {
            toast.error('Unable to access the camera. Check permissions.');
            setCameraActive(false);
        }
    };

    const stopCamera = () => {
        clearInterval(detectionIntervalRef.current);
        const stream = videoRef.current?.srcObject;
        stream?.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraActive(false);
        detectionLockRef.current = false;
    };

    const startDetectionLoop = () => {
        detectionIntervalRef.current = setInterval(() => recognizeAndPunch(), 600);
    };

    const speak = (text) => {
        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Optional: Set language
        utterance.rate = 1;       // Optional: Speed (0.1 to 10)
        utterance.pitch = 1;      // Optional: Pitch (0 to 2)

        window.speechSynthesis.speak(utterance);
    };

    const recognizeAndPunch = async () => {
        if (detectionLockRef.current || !videoRef.current) return;
        detectionLockRef.current = true;

        try {
            const detection = await window.faceapi
                .detectSingleFace(
                    videoRef.current,
                    new window.faceapi.TinyFaceDetectorOptions({
                        inputSize: 320,         // Try 224 or 320 or 416 for better accuracy, but slower
                        scoreThreshold: 0.7     // Lower = More sensitive, detects more faces, even unclear ones., higher = Stricter, detects only confident faces, but may miss blurry or angled ones.
                    })
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                detectionLockRef.current = false;
                return; // No face detected — wait for next interval
            }

            if (!matcherRef.current) {
                toast.warn('Matcher not initialized. Try again later.');
                detectionLockRef.current = false;
                return;
            }

            const bestMatch = matcherRef.current.findBestMatch(detection.descriptor);
            if (bestMatch.label === 'unknown') {
                toast.error('Face not recognized');
                detectionLockRef.current = false;
                return;
            }
            // console.log(bestMatch)
            const matchedId = idMapRef.current[bestMatch.label];
            const empDetail = employee.find(e => e._id === matchedId);

            if (!matchedId || !empDetail) {
                toast.error('Employee not found');
                detectionLockRef.current = false;
                return;
            }

            // Draw detection box
            const drawCanvas = window.faceapi.createCanvasFromMedia(videoRef.current);
            const displaySize = { width: videoSize.width, height: videoSize.height };
            const resized = window.faceapi.resizeResults(detection, displaySize);

            if (canvasRef.current) {
                canvasRef.current.innerHTML = '';
                canvasRef.current.appendChild(drawCanvas);
                window.faceapi.matchDimensions(drawCanvas, displaySize);
                window.faceapi.draw.drawDetections(drawCanvas, resized);
            }

            const token = localStorage.getItem('emstoken');
            const endpoint = `${import.meta.env.VITE_API_ADDRESS}${modeRef.current === 'punch-in' ? 'facecheckin' : 'facecheckout'
                }`;

            const res = await axios.post(
                endpoint,
                { employeeId: matchedId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { punchIn, punchOut, workingMinutes } = res.data.attendance;

            let formatted = null;
            if (workingMinutes) {
                const hours = Math.floor(workingMinutes / 60);
                const minutes = workingMinutes % 60;
                formatted = `${hours}h ${minutes}m`;
            }

            setDetectedEmp({
                name: empDetail.userid.name,
                profile: empDetail.profileimage,
                designation: empDetail.designation,
                department: empDetail.department.department,
                punchIn: punchIn ? dayjs(punchIn).format('hh:mm A') : '-- : --',
                punchOut: punchOut ? dayjs(punchOut).format('hh:mm A') : '-- : --',
                workinghour: formatted ?? '-- : --',
            });

            // console.log(res);
            if (res.status === 206) {
                speak(`you have already ${modeRef.current}`)
                toast.warn(res.data.message || `Successfully punched ${modeRef.current}`, { autoClose: 2100 });
            } else {
                 speak(`Thank You for ${modeRef.current}`)
                toast.success(res.data.message || `Successfully punched ${modeRef.current}`);
            }

            stopCamera(); // ✅ stop only on success
        } catch (err) {
            console.error(err);
            toast.warn(err?.response?.data?.message || 'Error during recognition');
            stopCamera(); // ✅ stop on error
        } finally {
            detectionLockRef.current = false; // Always release lock
        }
    };


    const handleMode = async (selectedMode) => {
        clearTimeout(timeoutRef.current);
        setDetectedEmp(null);
        setMode(selectedMode);
        modeRef.current = selectedMode;

        if (await checkCameraPermission()) startCamera();
        else toast.warn('Camera permission is required for face recognition.');
    };

    const employepic = 'https://res.cloudinary.com/dusxlxlvm/image/upload/v1753113610/ems/assets/employee_fi3g5p.webp';

    return (
        <div className="p-2 md:p-6">
            <h2 className="text-xl font-bold mb-2">Face Attendance</h2>
            <div className="flex items-center justify-center flex-col p-0">
                <div className="flex w-full gap-4 mb-2">
                    <button onClick={() => handleMode('punch-in')} className="bg-blue-500 w-xl text-white px-4 py-2 rounded">Punch In</button>
                    <button onClick={() => handleMode('punch-out')} className="bg-red-500 w-xl text-white px-4 py-2 rounded">Punch Out</button>
                </div>

                {availableCameras.length > 0 && (
                    <div className="mb-2">
                        <label className="block text-sm font-semibold">Select Camera:</label>
                        <select
                            value={selectedDeviceId || ''}
                            onChange={(e) => {
                                localStorage.setItem('selectedCameraId', e.target.value);
                                setSelectedDeviceId(e.target.value);
                            }}
                            className="border rounded px-2 py-1"
                        >
                            {availableCameras.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId}`}</option>
                            ))}
                        </select>
                        <button onClick={() => setMirror(!mirror)} className="bg-teal-600 ml-2 text-white px-4 py-1 rounded mt-2">Mirror</button>
                    </div>
                )}

                {detectedEmp && (
                    <>
                        <div className="flex flex-col md:flex-row items-center bg-white shadow-lg rounded-2xl p-4 w-full md:w-[450px] gap-6">
                            <img src={detectedEmp.profile || employepic} alt="Profile" className="w-38 h-38 rounded-full object-cover border-2 border-teal-500 border-dashed p-1" />
                            <div className="text-sm w-full space-y-1">
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Name</span><span>{detectedEmp.name}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Designation</span><span>{detectedEmp.designation}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Department</span><span>{detectedEmp.department}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Punch In</span><span>{detectedEmp.punchIn}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Punch Out</span><span>{detectedEmp.punchOut}</span></div>
                                <div className="flex justify-between"><span className="font-semibold text-gray-600">Working Hour</span><span>{detectedEmp.workinghour}</span></div>
                            </div>
                        </div>
                        <div className="text-center font-semibold text-gray-700 mb-2">
                            {detectedEmp.punchIn && detectedEmp.punchOut === '-- : --' ? ( <div className='text-[14px]'>
                                <p>👋 Good {dayjs().hour() < 12 ? 'Morning' : dayjs().hour() < 17 ? 'Afternoon' : 'Evening'}, {detectedEmp.name}!</p>  <p> You have punched in successfully.</p>
                           </div> ) : (
                                <p>✅ Great job today, {detectedEmp.name}! You’ve successfully punched out.</p>
                            )}
                        </div>
                    </>
                )}

                {cameraActive && (
                    <div className="relative text-center">
                        <video ref={videoRef} autoPlay muted {...videoSize} className={`rounded-full border-2 border-teal-500 border-dashed p-1 my-4 ${mirror ? '-scale-x-100' : ''}`} />
                        <div ref={canvasRef} className="absolute top-0 left-0" />
                        <div className="flex gap-2 justify-center">
                            <button className="bg-teal-600 text-white px-4 py-1 rounded mt-2">Scanning ...</button>
                            <button onClick={stopCamera} className="bg-gray-600 text-white px-4 py-1 rounded mt-2">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaceAttendance;
