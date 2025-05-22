import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Button,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { getMediaLibraryPermission } from '../utils/permissions';
import LivePhotoDisplay from '../components/LivePhotoDisplay'; // Import for future use

const { width } = Dimensions.get('window');
const numColumns = 3;
const itemSize = width / numColumns;

const GalleryScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [mediaAssets, setMediaAssets] = useState([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [loadMediaError, setLoadMediaError] = useState(null);

  const requestPermission = async () => {
    setLoadMediaError(null); // Clear error on permission request
    const permissionGranted = await getMediaLibraryPermission();
    setHasPermission(permissionGranted);
    if (!permissionGranted) {
      console.log('Media Library permission denied by user.');
    }
  };

  const loadMediaAssets = async () => {
    if (!hasPermission) return;
    setIsLoadingMedia(true);
    setLoadMediaError(null); // Clear previous errors
    try {
      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
        sortBy: [MediaLibrary.SortBy.creationTime],
        first: 100, // Limit the number of assets fetched
      });
      setMediaAssets(assets.assets);
      console.log(`Loaded ${assets.assets.length} media assets.`);
      if (assets.assets.length === 0 && !loadMediaError) { // Only set if no other error occurred
        setLoadMediaError('No media found in your library.');
      }
    } catch (error) {
      console.error('Failed to load media assets:', error);
      setLoadMediaError('Failed to load media. Please try again.');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (hasPermission === true) {
      loadMediaAssets();
    }
  }, [hasPermission]);

  const handleItemPress = (item) => {
    console.log('Selected Asset URI:', item.uri);
    console.log('Selected Asset MediaType:', item.mediaType);
    // For future implementation: setSelectedAsset(item);
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleItemPress(item)}>
      <Image source={{ uri: item.uri }} style={styles.thumbnail} />
      {item.mediaType === MediaLibrary.MediaType.video && (
        <View style={styles.videoIndicator}>
          <Text style={styles.videoIndicatorText}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.messageText}>Requesting permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.messageText}>Media Library permission denied.</Text>
        <Text style={styles.messageText}>Enable it in settings to view gallery.</Text>
        <TouchableOpacity style={styles.buttonStyle} onPress={requestPermission}>
          <Text style={styles.buttonTextStyle}>Retry Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoadingMedia && mediaAssets.length === 0) { // Show loading only if no assets are displayed yet
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.messageText}>Loading media...</Text>
      </View>
    );
  }

  if (loadMediaError && mediaAssets.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.messageText}>{loadMediaError}</Text>
        <TouchableOpacity style={styles.buttonStyle} onPress={loadMediaAssets}>
          <Text style={styles.buttonTextStyle}>
            {loadMediaError === 'No media found in your library.' ? 'Reload Media' : 'Try Again'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // This condition is a fallback or for when assets are cleared, etc.
  // The primary "no media" or "error" states are handled by loadMediaError check above.
  if (mediaAssets.length === 0 && !isLoadingMedia) {
    return (
      <View style={styles.centered}>
        <Text style={styles.messageText}>{loadMediaError || 'No media found. Pull to refresh or try reloading.'}</Text>
        <TouchableOpacity style={styles.buttonStyle} onPress={loadMediaAssets}>
          <Text style={styles.buttonTextStyle}>Reload Media</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={mediaAssets}
      renderItem={renderGridItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.listContainer}
      onRefresh={loadMediaAssets}
      refreshing={isLoadingMedia}
    />
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0', // Light background for message screens
  },
  messageText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonStyle: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonTextStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
     paddingBottom: 20, // Ensure space at the bottom
  },
  itemContainer: {
    width: itemSize,
    height: itemSize,
    padding: 1, // Small padding for spacing between items
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ccc', // Placeholder color
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  videoIndicatorText: {
    color: 'white',
    fontSize: 10,
  },
});

export default GalleryScreen;
