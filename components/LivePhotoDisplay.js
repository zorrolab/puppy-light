import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Video } from 'expo-av';

const { width: screenWidth } = Dimensions.get('window');
const DEFAULT_ASPECT_RATIO = 16 / 9;
const DEFAULT_HEIGHT = screenWidth / DEFAULT_ASPECT_RATIO;

const LivePhotoDisplay = ({ photoUri, videoUri, style }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const videoRef = useRef(null);

  const handleLongPress = async () => {
    setIsPlayingVideo(true);
    if (videoRef.current) {
      try {
        await videoRef.current.replayAsync();
      } catch (error) {
        console.error("Error replaying video:", error);
        setIsPlayingVideo(false); // Reset state if replay fails
      }
    }
  };

  const handlePressOut = async () => {
    setIsPlayingVideo(false);
    if (videoRef.current) {
      try {
        await videoRef.current.stopAsync();
      } catch (error) {
        console.error("Error stopping video:", error);
      }
    }
  };

  const onPlaybackStatusUpdate = (playbackStatus) => {
    if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
      setIsPlayingVideo(false);
    }
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      style={[styles.container, style]}
      activeOpacity={0.9} // Keep opacity high to see the image underneath
    >
      <Image source={{ uri: photoUri }} style={styles.media} resizeMode="cover" />
      {isPlayingVideo && videoUri && (
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={StyleSheet.absoluteFill}
          shouldPlay={true}
          isLooping={false}
          resizeMode={Video.RESIZE_MODE_COVER}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onError={(error) => console.error('Video playback error:', error)}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: DEFAULT_HEIGHT,
    backgroundColor: '#000', // Background color for the container
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ensure video doesn't spill out if aspect ratios differ slightly
  },
  media: {
    width: '100%',
    height: '100%',
  },
});

export default LivePhotoDisplay;
