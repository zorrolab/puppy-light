import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export const getCameraPermission = async () => {
  const { status } = await Camera.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    console.log('Camera permission denied');
    return false;
  }
  return true;
};

export const getMicrophonePermission = async () => {
  const { status } = await Camera.requestMicrophonePermissionsAsync();
  if (status !== 'granted') {
    console.log('Microphone permission denied');
    return false;
  }
  return true;
};

export const getMediaLibraryPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Media Library permission denied');
    return false;
  }
  return true;
};
