import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { Header } from '@rneui/themed';
import { useGallery, ImageDTO } from './UseGallery';
// import FullImageModal from './Components/FullImageModal';
// import openImageModal from './Components/FullImageModal';




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

const GalleryImageLoader: React.FC = () => {
  // const [photos, setPhotos] = useState<Photo[]>([]);
  const { photos, loadNextPagePictures, isLoading, isLoadingNextPage, isReloading, hasNextPage } = useGallery({
    pageSize: 20, // Adjust the page size as needed
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);


  useEffect(() => {
    const loadImages = async () => {
      if (!(await hasAndroidPermission())) {
        return;
      }

      // loadNextPagePictures(); // Call the function to load the initial set of images
    };

    loadImages();
  }, []);


  // if (isLoading || isReloading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="small" />
  //     </View>
  //   );
  // }

  const openImageModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeImageModal = () => {
    setSelectedIndex(null);
  };


  return (

<View style={{ backgroundColor: "#303131" }}>
      {/* <Header
        backgroundColor="grey"
        centerComponent={{
          text: "Photos",
          style: { color: "#fff" }
        }}
        leftComponent={{ icon: "menu", color: "#fff" }}
        placement="center"
      /> */}

      <View style={{ width: '100%', alignItems: 'center' }}>

        <FlatList
          data={photos}
          numColumns={2}
          keyExtractor={(item: ImageDTO, index: number) => item.node.id + index}
          onEndReached={loadNextPagePictures}
          onEndReachedThreshold={0.1}
          renderItem={({ item, index }) => {
            return (
              <View style={styles.dvimg}>
                <Image style={styles.img}
                  key={index}
                  source={{ uri: item.node.uri }}
                />
              </View>
            )
          }} />
        {/* <FullImageModal onClose={closeImage} /> */}
        {/* <FullImageModal images={photos?} selectedIndex={selectedIndex} onClose={closeImageModal} /> */}

      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  dvimg: {
    width: Dimensions.get('window').width / 2 - 20,
    height: 200,
    borderRadius: 2,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 0.9
  },
  img: {
    height: '95%',
    width: '95%'
  }, scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

});

export default GalleryImageLoader;