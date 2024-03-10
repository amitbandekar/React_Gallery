import React, { useState } from 'react';
import { View, Button, Image, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const NoiseRemover: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleCameraPress = () => {
    launchCamera({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && !response.error) {
        const uri = response.uri;
        setImageUri(uri);
        uploadImage(uri);
      }
    });
  };

  const handleLibraryPress = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && !response.error) {
        const uri = response.uri;
        setImageUri(uri);
        uploadImage(uri);
      }
    });
  };

  const uploadImage = async (uri: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      type: 'image/jpeg', // Change the type if needed
      name: 'image.jpg', // Change the name if needed
    });

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = await response.json();
      console.log(data);
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  return (
    <View>
      <Button title="Open Camera" onPress={handleCameraPress} />
      <Button title="Choose from Library" onPress={handleLibraryPress} />
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
    </View>
  );
};

export default NoiseRemover;
