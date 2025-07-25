let modelsLoaded = false;

export const loadFaceAPI = async () => {
  if (!window.faceapi) {
    await loadScript();
  }

  if (!modelsLoaded) {
    await loadModels();
    modelsLoaded = true;
  }
};

const loadScript = () => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src*="face-api.js"]');
    if (existingScript) return resolve(); // already loaded

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const loadModels = async () => {
  await Promise.all([
    window.faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    window.faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    window.faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  ]);
};
