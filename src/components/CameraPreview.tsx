import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  style?: any;
  onFlip?: () => void;
  onTakePicture?: (photo: any) => void;
  isFrontCamera: boolean;
}

const CameraPreview: React.FC<Props> = ({ style, onFlip, onTakePicture, isFrontCamera }) => {
  const cameraRef = useRef<CameraView>(null);

  const handleTakePicture = async () => {
    if (cameraRef.current && onTakePicture) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          exif: false,
        });
        onTakePicture(photo);
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  return (
    <View style={[styles.container, style]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={isFrontCamera ? 'front' : 'back'}
        ratio="1:1"
      />
      <TouchableOpacity
        style={styles.captureArea}
        onPress={handleTakePicture}
      />
      {onFlip && (
        <TouchableOpacity
          style={styles.flipButton}
          onPress={onFlip}
        >
          <Ionicons name="camera-reverse" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  captureArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  flipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraPreview; 