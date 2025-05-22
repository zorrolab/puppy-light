import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import CameraScreen from './screens/CameraScreen';
import GalleryScreen from './screens/GalleryScreen';
import LivePhotoDisplay from './components/LivePhotoDisplay';
import { StatusBar } from 'expo-status-bar';

const { width: screenWidth } = Dimensions.get('window');

export default function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'camera', 'gallery'
  const [capturedMedia, setCapturedMedia] = useState(null); // { photoUri, videoUri }

  const handleMediaCaptured = (media) => {
    setCapturedMedia(media);
    setCurrentView('main'); // Return to main view to display captured media
  };

  const renderMainView = () => (
    <View style={styles.container}>
      <Text style={styles.title}>DoggeLight App</Text>
      <View style={styles.buttonContainer}>
        <Button title="Open Camera" onPress={() => setCurrentView('camera')} />
        <View style={styles.buttonSpacer} />
        <Button title="Open Gallery" onPress={() => setCurrentView('gallery')} />
      </View>
      {capturedMedia && (
        <View style={styles.livePhotoContainer}>
          <Text style={styles.subtitle}>Last Captured Media:</Text>
          <LivePhotoDisplay
            photoUri={capturedMedia.photoUri}
            videoUri={capturedMedia.videoUri}
            style={styles.livePhotoDisplay} // Apply specific style for App.js layout
          />
          <Button title="Clear Captured Media" onPress={() => setCapturedMedia(null)} />
        </View>
      )}
    </View>
  );

  if (currentView === 'camera') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <CameraScreen onMediaCaptured={handleMediaCaptured} />
        <View style={styles.backButtonOverlay}>
          <Button title="Back to Main" onPress={() => setCurrentView('main')} />
        </View>
      </SafeAreaView>
    );
  }

  if (currentView === 'gallery') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Button title="Back to Main" onPress={() => setCurrentView('main')} />
        </View>
        <GalleryScreen />
      </SafeAreaView>
    );
  }

  // currentView === 'main'
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="auto" />
      {renderMainView()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0', // A light background for the safe area
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items to the top
    paddingTop: 50, // Add some padding at the top
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  buttonSpacer: {
    width: 20, // Adds space between buttons
  },
  livePhotoContainer: {
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  livePhotoDisplay: {
    width: screenWidth * 0.9, // 90% of screen width
    height: (screenWidth * 0.9) / (16 / 9), // Maintain 16:9 aspect ratio
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden', // Ensures border radius is applied to content
  },
  header: {
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e7e7',
    alignItems: 'flex-start', // Align button to the left
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 40, // Adjusted for typical status bar height with SafeAreaView
    left: 15,
    zIndex: 10, // Ensure it's above the camera view
    backgroundColor: 'rgba(0,0,0,0.3)', // Semi-transparent background for button
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 8,
  }
});
