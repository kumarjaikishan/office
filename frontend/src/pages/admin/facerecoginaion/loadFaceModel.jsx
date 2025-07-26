// faceService.js (shared file)
let modelsLoaded = false;

export async function loadFaceModels() {
  if (!modelsLoaded) {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    modelsLoaded = true;
  }
}
