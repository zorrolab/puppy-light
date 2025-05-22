import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Alert, Image, Animated, StatusBar, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import * as MediaLibrary from 'expo-media-library';
import * as Brightness from 'expo-brightness';
import Toast from 'react-native-toast-message';
import { adjustSaturation } from '../utils/colorUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const CAMERA_PREVIEW_SIZE = width * 0.8; // 相机预览窗口大小

interface PresetColor {
  name: string;
  color: string;
}

const presetColors: PresetColor[] = [
  { name: '樱粉肌', color: '#FFB6C1' },  // 粉色
  { name: '柔雾紫', color: '#9932CC' },  // 紫色
  { name: '冷瓷白', color: '#87EFEF' },  // 浅蓝色
  { name: '纯皙光', color: '#FFFFFF' },  // 纯白色
  { name: '暖柠黄', color: '#FFE700' },  // 亮黄色
  { name: '清透蓝', color: '#4169E1' },  // 蓝色
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  const [selectedColor, setSelectedColor] = useState(presetColors[0]);
  const [saturation, setSaturation] = useState(1);
  const [brightness, setBrightness] = useState(1);
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isControlsExpanded, setIsControlsExpanded] = useState(true);
  const controlsAnimation = useRef(new Animated.Value(1)).current;

  // 计算应用饱和度后的颜色
  const adjustedColor = useMemo(() => {
    return adjustSaturation(selectedColor.color, saturation);
  }, [selectedColor.color, saturation]);

  const handleCameraPress = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('需要相机权限', '请在设置中允许访问相机');
        return;
      }
    }
    if (!mediaPermission?.granted) {
      const result = await requestMediaPermission();
      if (!result.granted) {
        Alert.alert('需要相册权限', '请在设置中允许访问相册');
        return;
      }
    }
    setShowCamera(!showCamera);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 1,
        exif: false,
      });
      if (photo?.uri) {
        // setLastPhoto(photo.uri);
        await MediaLibrary.saveToLibraryAsync(photo.uri);
        // Alert.alert('保存成功', '照片已保存到相册');
        Toast.show({
          type: 'success',
          text1: '保存成功',
          text2: '照片已保存到相册',
        });
      }
    } catch (error) {
      console.error('Failed to take picture:', error);
      // Alert.alert('拍照失败', '无法保存照片');
      Toast.show({
        type: 'error',
        text1: '拍照失败',
        text2: '无法保存照片',
      });
    }
  };

  const handleBrightnessChange = async (value: number) => {
    try {
      await Brightness.setSystemBrightnessAsync(value);
    } catch (error) {
      console.error('Failed to set brightness:', error);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === 'granted') {
        Brightness.setSystemBrightnessAsync(1);
      }
    })();
  }, []);

  const toggleControls = () => {
    const toValue = isControlsExpanded ? 0 : 1;
    Animated.spring(controlsAnimation, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
    setIsControlsExpanded(!isControlsExpanded);
  };

  return (
    <SafeAreaView 
      style={styles.safeArea} 
      edges={['right', 'left']}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => toggleControls()}
        >
          <View style={[styles.light, { backgroundColor: adjustedColor, opacity: brightness }]} />
        </TouchableOpacity>
        
        {showCamera && permission?.granted && (
          <View style={styles.cameraContainer}>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              mirror={true}
            >
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePicture}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </CameraView>
          </View>
        )}

        {/* lastPhoto && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />
          </View>
        ) */}

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleCameraPress}
        >
          <Ionicons 
            name={showCamera ? "close" : "camera"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
        
        <Animated.View
          style={[
            styles.controlsWrapper,
            {
              transform: [{
                translateY: controlsAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0]
                })
              }]
            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => !isControlsExpanded && toggleControls()}
            style={styles.controlsTouchable}
          >
            <BlurView intensity={90} tint="dark" style={styles.controls}>
              <View style={styles.handleBar} />
              <View style={styles.presetButtons}>
                {presetColors.map((preset, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.presetButton,
                      { backgroundColor: preset.color },
                      selectedColor.name === preset.name && styles.selectedPreset
                    ]}
                    onPress={() => setSelectedColor(preset)}
                  >
                    <Text style={styles.presetText}>{preset.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>饱和度</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={saturation}
                  onValueChange={setSaturation}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FFFFFF"
                  tapToSeek={true}
                />
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>屏幕亮度</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0.1}
                  maximumValue={1}
                  value={brightness}
                  onValueChange={handleBrightnessChange}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FFFFFF"
                  tapToSeek={true}
                />
              </View>

              {/* <TouchableOpacity
                style={styles.menuButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <Ionicons name="menu" size={24} color="black" />
              </TouchableOpacity> */}
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  light: {
    position: 'absolute',
    width: width,
    height: height,
    top: 0,
    left: 0,
  },
  cameraContainer: {
    position: 'absolute',
    top: (height - CAMERA_PREVIEW_SIZE) / 10,
    left: (width - CAMERA_PREVIEW_SIZE) / 2,
    width: CAMERA_PREVIEW_SIZE,
    height: CAMERA_PREVIEW_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#fff',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
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
  captureButton: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    top: Platform.OS === 'ios' ? 10 : 15, // iOS 和 Android 的不同顶部间距
  },
  controlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsTouchable: {
    width: '100%',
  },
  controls: {
    padding: 20,
    paddingBottom: 40,
    borderRadius: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  presetButton: {
    width: (width - 80) / 3,  // 每行3个按钮，左右各20padding，按钮之间10间距
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPreset: {
    borderWidth: 2,
    borderColor: '#000',
  },
  presetText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 15,
  },
  sliderLabel: {
    color: '#000',
    fontSize: 14,
    marginBottom: 5,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  menuButton: {
    position: 'absolute',
    bottom: 15,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 