import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, Button } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';

async function hasAndroidPermission() {
  const getCheckPermissionPromise = () => {
    if (Platform.Version >= '33') {
      return Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO),
      ]).then(
        ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
          hasReadMediaImagesPermission && hasReadMediaVideoPermission,
      );
    } else {
      return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }
  const getRequestPermissionPromise = () => {
    if (Platform.Version >= '33') {
      return PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]).then(
        (statuses) =>
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
          statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED,
      );
    } else {
      return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
        (status) => status === PermissionsAndroid.RESULTS.GRANTED,
      );
    }
  };

  return await getRequestPermissionPromise();
}

const GalleryImageLoader = () => {
  const [photos, setPhotos] = useState([]);

  const _handleButtonPress = () => {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
    })
      .then((r) => {
        setPhotos(r.edges);
      })
      .catch((err) => {
        // Handle error loading images
        console.error('Error loading images:', err);
      });
  };

  useEffect(() => {
    const loadImages = async () => {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return;
      }
      // Add your logic to load images here
      _handleButtonPress();
    };

    loadImages();
  }, []);

  return (
    <View>
      <Button title="Load Images" onPress={_handleButtonPress} />
      <ScrollView>
        {photos.map((p, i) => {
          return (
            <Image
              key={i}
              style={{
                width: 300,
                height: 100,
              }}
              source={{ uri: p.node.image.uri }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

export default GalleryImageLoader;
