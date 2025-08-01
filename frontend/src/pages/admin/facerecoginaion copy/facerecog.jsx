import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import swal from 'sweetalert';
import { loadFaceAPI } from './loadModel';

const videoDimensions = { width: 350, height: 350 };

const FaceEnrollment = () => {
  const videoRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [descriptor, setDescriptor] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [mirror, setMirror] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(localStorage.getItem('lastUsedCameraId') || null);

  const { employee: employeeList } = useSelector((state) => state.user);

  useEffect(() => {
    const init = async () => {
      try {
        await loadFaceAPI();
      } catch (err) {
        console.error('Failed to load face-api.js or models', err);
        toast.error('Face recognition models failed to load');
      }
    };
    init();
    return stopCamera;
  }, []);

  useEffect(() => {
    if (selectedCameraId) {
      localStorage.setItem('lastUsedCameraId', selectedCameraId);
    }
  }, [selectedCameraId]);

  useEffect(() => {
    if (!selectedCameraId || !cameraActive) return;
    const label = availableCameras.find(e => e.deviceId === selectedCameraId)?.label.toLowerCase();
    setMirror(label?.includes('webcam') || label?.includes('front'));
  }, [selectedCameraId, availableCameras]);

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
          deviceId: { exact: chosenDevice.deviceId },
          width: videoDimensions.width,
          height: videoDimensions.height,
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadeddata = () => {
          captureDescriptor();
        };
      }
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
  if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);

  detectionIntervalRef.current = setInterval(async () => {
    try {
      const result = await window.faceapi
        .detectSingleFace(
          videoRef.current,
          new window.faceapi.TinyFaceDetectorOptions({
            inputSize: 416,
            scoreThreshold: 0.6,
          })
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (result) {
        let detectionScore = result.detection?.score || 0;

        if (detectionScore < 0.85) {
          console.warn(`Low face detection confidence: ${detectionScore}`);
          // toast.warn(`Face not clear enough. Please adjust lighting or position. (Score: ${detectionScore.toFixed(2)})`);
          return; // skip poor captures
        }

        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;

        const capturedDescriptor = Array.from(result.descriptor);
        setDescriptor(capturedDescriptor);
        setDetecting(false);
        stopCamera();

        swal({
          title: `Face Captured Successfully`,
          text: `Score : ${detectionScore.toFixed(2) * 10}, Proceed to Face Enrollment?`,
          icon: 'success',
          buttons: {
            cancel: {
              text: 'Cancel',
              value: false,
              className: 'bg-gray-300 text-black px-4 py-1 rounded',
            },
            confirm: {
              text: 'Proceed Now',
              value: true,
              className: 'bg-teal-500 text-white px-4 py-1 rounded',
            },
          },
        }).then(async (okay) => {
          if (okay) await handleSubmit(capturedDescriptor);
        });
      }
    } catch (err) {
      console.error('Face detection error:', err);
    }
  }, 500);
};


  const deleteFaceEnroll = async () => {
    const token = localStorage.getItem('emstoken');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_ADDRESS}deletefaceenroll`,
        { employeeId: selectedEmployee._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message, { autoClose: 1200 });
    } catch (error) {
      console.error(error);
      toast.warn(error?.response?.data?.message || 'Unexpected error occurred.', { autoClose: 1200 });
    }
  };

  const handleSubmit = async (capturedDescriptor = descriptor) => {
    if (!selectedEmployee || !capturedDescriptor || capturedDescriptor.length !== 128) {
      return toast.warn('Invalid face data. Please try capturing again.');
    }

    const token = localStorage.getItem('emstoken');
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_ADDRESS}enrollFace`,
        { employeeId: selectedEmployee._id, descriptor: capturedDescriptor },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message, { autoClose: 1200 });
      stopCamera();
      setDescriptor(null);
    } catch (error) {
      console.error(error);
      toast.warn(error?.response?.data?.message || 'Unexpected error occurred.', { autoClose: 1200 });
    }
  };

  return (
    <div className="p-2 md:p-6">
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
        {employeeList?.map(emp => (
          <option key={emp._id} value={emp._id}>
            {emp.userid.name} {emp.faceDescriptor ? '✅' : '❌'}
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
              onClick={deleteFaceEnroll}
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
            className="border p-2"
            value={selectedCameraId || ''}
            onChange={(e) => setSelectedCameraId(e.target.value)}
          >
            {availableCameras.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(-4)}`}
              </option>
            ))}
          </select>
          <button onClick={() => setMirror(!mirror)} className="bg-teal-600 ml-2 text-white px-4 py-1 rounded mt-2">
            Mirror
          </button>
        </div>
      )}

      {cameraActive && (
        <div>
          <video
            ref={videoRef}
            autoPlay
            muted
            width={videoDimensions.width}
            height={videoDimensions.height}
            className={`rounded-full border-2 border-teal-500 ${mirror ? '-scale-x-100' : ''} border-dashed p-1 my-4`}
          />

          <div className="flex gap-4 mt-2 items-center">
            <button
              onClick={captureDescriptor}
              className="bg-yellow-500 text-white px-4 py-1 rounded"
              disabled={detecting}
            >
              {detecting ? 'Detecting...' : 'Capture Face'}
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
