import * as faceapi from 'face-api.js';

// We load models from a public CDN to avoid heavy repo sizes
const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';

let isModelsLoaded = false;

export const loadFaceApiModels = async () => {
  if (isModelsLoaded) return;
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    isModelsLoaded = true;
    console.log("Face API models loaded successfully");
  } catch (error) {
    console.error("Failed to load Face API models:", error);
    throw error;
  }
};

export const extractFaceDescriptor = async (videoOrImageElement: HTMLVideoElement | HTMLImageElement) => {
  if (!isModelsLoaded) await loadFaceApiModels();
  
  const detection = await faceapi.detectSingleFace(videoOrImageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error("No face detected in the frame. Please ensure your face is clearly visible.");
  }
  
  return Array.from(detection.descriptor);
};

export const matchFaceDescriptors = (descriptor1: number[], descriptor2: number[]) => {
  const arr1 = new Float32Array(descriptor1);
  const arr2 = new Float32Array(descriptor2);
  const distance = faceapi.euclideanDistance(arr1, arr2);
  // Distance < 0.5 is a good match threshold
  return {
    isMatch: distance < 0.5,
    distance
  };
};
