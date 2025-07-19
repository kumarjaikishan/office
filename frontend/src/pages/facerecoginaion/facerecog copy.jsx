import React, { useRef, useEffect, useState, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';

const videoWidth = 720;
const videoHeight = 560;

const FaceAuth = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [nameInput, setNameInput] = useState('');
    const [descriptors, setDescriptors] = useState([]);
    const [employeelist,setemployeelist]=useState(null);
    
    const {employee } = useSelector(e => e.user);
    useEffect(()=>{
console.log(employee)
    },[employee])

    // Lazy load face-api
    const loadModels = async () => {
        await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            window.faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
    };

    const loadStoredFaces = () => {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('face_'));
        return keys.map(key => {
            const name = key.replace('face_', '');
            const descriptor = new Float32Array(JSON.parse(localStorage.getItem(key)));
            return new window.faceapi.LabeledFaceDescriptors(name, [descriptor]);
        });
    };

    const startVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
    };

    useEffect(() => {
        const init = async () => {
            await loadModels();
            setDescriptors(loadStoredFaces());
            await startVideo();
        };
        init();
    }, []);

    const registerFace = async () => {
        if (!nameInput.trim()) return alert('Please enter a name.');

        const detection = await window.faceapi
            .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return alert('No face detected. Try again.');

        localStorage.setItem(
            'face_' + nameInput,
            JSON.stringify(Array.from(detection.descriptor))
        );
        setDescriptors(loadStoredFaces());
        alert('Face registered as: ' + nameInput);
    };

    const recognizeFace = async () => {
        if (descriptors.length === 0) return alert('No registered faces found.');

        const matcher = new window.faceapi.FaceMatcher(descriptors, 0.6);
        const detection = await window.faceapi
            .detectSingleFace(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (!detection) return alert('No face detected.');

        const bestMatch = matcher.findBestMatch(detection.descriptor);
        alert('Result: ' + bestMatch.toString());
    };

    const handlePlay = () => {
        const canvas = window.faceapi.createCanvasFromMedia(videoRef.current);
        canvasRef.current.innerHTML = '';
        canvasRef.current.appendChild(canvas);
        const displaySize = { width: videoWidth, height: videoHeight };
        window.faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await window.faceapi
                .detectAllFaces(videoRef.current, new window.faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();

            const resized = window.faceapi.resizeResults(detections, displaySize);
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
            window.faceapi.draw.drawDetections(canvas, resized);
        }, 200);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <video
                ref={videoRef}
                width={videoWidth}
                height={videoHeight}
                autoPlay
                muted
                onPlay={handlePlay}
                className="border-2 border-black"
            />
            <div ref={canvasRef} className="absolute top-0" />
            <div className="controls mt-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Enter name to register"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    className="border px-2 py-1"
                />
                <button onClick={registerFace} className="bg-blue-500 text-white px-4 py-1 rounded">
                    Register Face
                </button>
                <button onClick={recognizeFace} className="bg-green-500 text-white px-4 py-1 rounded">
                    Recognize Face
                </button>
            </div>
        </div>
    );
};

const LazyFaceAuth = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const loadScript = async () => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
            script.async = true;
            script.onload = () => setLoaded(true);
            document.body.appendChild(script);
        };
        loadScript();
    }, []);

    return (
        <Suspense fallback={<div className="text-center mt-10">Loading face recognition...</div>}>
            {loaded ? <FaceAuth /> : <div className="text-center mt-10">Loading models...</div>}
        </Suspense>
    );
};

export default LazyFaceAuth;
