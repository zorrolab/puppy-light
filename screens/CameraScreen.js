import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import { getCameraPermission, getMicrophonePermission } from '../utils/permissions';
import { MaterialIcons } from '@expo/vector-icons';

const CameraScreen = (props) => {
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const cameraRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await getCameraPermission();
      setHasCameraPermission(cameraStatus);
      const microphoneStatus = await getMicrophonePermission();
      setHasMicrophonePermission(microphoneStatus);
    })();
  }, []);

  const handleCapture = async () => {
    if (isCapturing || !cameraRef.current) {
      return;
    }

    setIsCapturing(true);
    setCaptureError(null); // Clear previous errors
    console.log('Starting capture...');

    try {
      // Take Picture
      const photo = await cameraRef.current.takePictureAsync();
      console.log('Photo URI:', photo.uri);

      // Record Video
      console.log('Starting video recording...');
      const videoPromise = cameraRef.current.recordAsync();

      // Simulate a delay for recording
      await new Promise(resolve => setTimeout(resolve, 3000));

      console.log('Stopping video recording...');
      cameraRef.current.stopRecording();
      const video = await videoPromise; // This promise resolves after stopRecording is called
      console.log('Video URI:', video.uri);

      if (props.onMediaCaptured) {
        props.onMediaCaptured({ photoUri: photo.uri, videoUri: video.uri });
      }

    } catch (error) {
      console.error('Error during capture:', error);
      setCaptureError('Failed to capture media. Please try again.');
    } finally {
      setIsCapturing(false);
      console.log('Capture finished.');
    }
  };

  if (hasCameraPermission === null || hasMicrophonePermission === null) {
    return (
      <View style={styles.messageContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.messageText}>Requesting permissions...</Text>
      </View>
    );
  }

  if (hasCameraPermission === false || hasMicrophonePermission === false) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Camera or Microphone permission denied.</Text>
        <Text style={styles.messageText}>Please enable them in settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.cameraPreview}
        type={Camera.Constants.Type.back}
        ref={cameraRef}
      />
      {captureError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{captureError}</Text>
        </View>
      )}
      <View style={styles.captureButtonContainer}>
        <TouchableOpacity
          style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={isCapturing}
        >
          {isCapturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <MaterialIcons name="camera" size={50} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraPreview: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
  errorOverlay: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  captureButtonDisabled: {
    backgroundColor: 'grey',
  },
});

export default CameraScreen;
