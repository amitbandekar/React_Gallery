import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Dimensions, FlatList } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { Header } from '@rneui/themed'; 

interface Photo {
  node: {
    image: {
      uri?: string;
    };
  };
}
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
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
        return;
      }
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

    loadImages();
  }, []);

  return (
    <View style={{flex:1}}>
      <Header
        backgroundColor="grey"
        centerComponent={{
          text: "Photos",
          style: { color: "#fff" }
        }}
        leftComponent={{ icon: "menu", color: "#fff" }}
        placement="center"
      />
      <View style={{width:'100%',alignItems:'center'}}>
        
        <FlatList
        data={photos}
        numColumns={2}
        renderItem={({item,index})=>{
          return( 
          <View style={styles.dvimg}>
            <Image style={styles.img}
            key={index}
            source={{ uri: item.node.image.uri }}
          />
          </View>
          )
        }}/>
        
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  dvimg: {
    width: Dimensions.get('window').width / 2 -20,
    height:200,
    borderRadius:2,
    backgroundColor:'#E4D9FF',
    margin:2,
    justifyContent:'center',
    alignItems:'center'
  },
  img:{
    height:'95%',
    width:'95%'
  }
  
});

export default GalleryImageLoader;