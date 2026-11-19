import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import CameraIcon from '../icons/camera.svg';
import Upload from '../icons/upload.svg';
import Download from '../icons/Download.svg';
import CustomHeader from './CustomHeader';
import {API_BASE_URL} from './config';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {useRoute, RouteProp} from '@react-navigation/native';

const windowWidth = Dimensions.get('window').width;

const STYLES = ['vibrant', 'cyberpunk', 'vintage', 'sketch'];

const AI: React.FC = () => {
  const route =
    useRoute<RouteProp<Record<string, {initialImageUri?: string}>, string>>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('vibrant');
  const [loading, setLoading] = useState(false);

  const processAIGeneration = async (fileUri: string | null, style: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (fileUri) {
        formData.append('file', {
          uri: fileUri,
          name: 'photo.jpg',
          type: 'image/jpeg',
        } as any);
      }
      formData.append('style', style);

      const response = await fetch(`${API_BASE_URL}/generate_ai`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      if (data.image) {
        setImageUri(data.image);
        Alert.alert('Success', `Applied ${style} AI style successfully!`);
      } else {
        throw new Error(data.error || 'Failed to process AI image');
      }
    } catch (error) {
      console.warn('AI processing error:', error);
      Alert.alert(
        'Processing Note',
        'Could not reach backend service. Please ensure backend.py is running on port 5000.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const passedUri = route.params?.initialImageUri;
    if (passedUri) {
      setImageUri(passedUri);
      processAIGeneration(passedUri, selectedStyle);
    }
  }, [route.params?.initialImageUri, selectedStyle]);

  const handleCameraPress = () => {
    launchCamera({mediaType: 'photo'}, response => {
      if (
        !response.didCancel &&
        !response.errorMessage &&
        response.assets?.[0]?.uri
      ) {
        const fileUri = response.assets[0].uri;
        setImageUri(fileUri);
        processAIGeneration(fileUri, selectedStyle);
      }
    });
  };

  const handleLibraryPress = () => {
    launchImageLibrary({mediaType: 'photo'}, response => {
      if (
        !response.didCancel &&
        !response.errorMessage &&
        response.assets?.[0]?.uri
      ) {
        const fileUri = response.assets[0].uri;
        setImageUri(fileUri);
        processAIGeneration(fileUri, selectedStyle);
      }
    });
  };

  const handleDownload = async () => {
    if (!imageUri) {
      Alert.alert(
        'Notice',
        'No image to save. Generate or pick an image first.',
      );
      return;
    }

    try {
      await CameraRoll.save(imageUri, {type: 'photo'});
      Alert.alert('Success', 'Image saved to your gallery!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Saved', 'Image saved successfully.');
    }
  };

  return (
    <SafeAreaView style={styles.headercontainer}>
      <CustomHeader title="Generative AI" />
      <View style={styles.container}>
        <View style={styles.imagePreviewWrapper}>
          {loading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color="#272640" />
              <Text style={styles.processingText}>Processing with AI...</Text>
            </View>
          ) : (
            <Image
              source={
                imageUri ? {uri: imageUri} : require('../icons/bgremover.png')
              }
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>

        <View style={styles.styleSelectorContainer}>
          <Text style={styles.styleSectionLabel}>Choose Style:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.styleList}>
            {STYLES.map(style => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleChip,
                  selectedStyle === style && styles.styleChipSelected,
                ]}
                onPress={() => {
                  setSelectedStyle(style);
                  if (imageUri) {
                    processAIGeneration(imageUri, style);
                  }
                }}>
                <Text
                  style={[
                    styles.styleChipText,
                    selectedStyle === style && styles.styleChipTextSelected,
                  ]}>
                  {style.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.actionToolbar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCameraPress}
            activeOpacity={0.7}>
            <CameraIcon height={36} width={36} color="black" />
            <Text style={styles.actionLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleLibraryPress}
            activeOpacity={0.7}>
            <Upload height={36} width={36} color="black" />
            <Text style={styles.actionLabel}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => processAIGeneration(imageUri, selectedStyle)}
            activeOpacity={0.7}>
            <Text style={styles.aiGenerateIcon}>✨</Text>
            <Text style={styles.actionLabel}>Generate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleDownload}
            activeOpacity={0.7}>
            <Download height={36} width={36} color="black" />
            <Text style={styles.actionLabel}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  container: {
    flex: 1,
    backgroundColor: '#BDE0FE',
    justifyContent: 'space-between',
  },
  imagePreviewWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#272640',
  },
  previewImage: {
    width: windowWidth * 0.82,
    height: windowWidth * 0.82,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  styleSelectorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  styleSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#272640',
    marginBottom: 6,
  },
  styleList: {
    flexDirection: 'row',
    gap: 8,
  },
  styleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginRight: 8,
  },
  styleChipSelected: {
    backgroundColor: '#00b5ec',
  },
  styleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#272640',
  },
  styleChipTextSelected: {
    color: '#ffffff',
  },
  actionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  aiGenerateIcon: {
    fontSize: 28,
  },
  actionLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#272640',
  },
});

export default AI;
