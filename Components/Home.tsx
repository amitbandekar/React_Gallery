import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
import { PermissionsAndroid, Platform } from 'react-native';
import { Header } from '@rneui/themed';
import { useGallery, ImageDTO } from './UseGallery';
import CustomHeader from './CustomHeader';
import DelIcon from '../icons/deleteicon.svg';
import FullImageModal from './FullImageModal';
import Gallery from 'react-native-image-gallery';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
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


  useEffect(() => {
    const loadImages = async () => {
      if (!(await hasAndroidPermission())) {
        return;
      }

      // loadNextPagePictures(); // Call the function to load the initial set of images
    };

    loadImages();
  }, []);


  interface RemoteImage {
    source: { uri: string };
  }
  
  let remoteImages: RemoteImage[] = [];
  const [modalVisible, setModalVisible] = useState(false);
  let [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const openImageModal = (index: number) => {
       //setSelectedIndex();
       if (photos && photos.length > 0) {

        console.log(remoteImages);
        setSelectedImageIndex(index);
        setModalVisible(true);

       }
  };
  
  const closeImageModal = () => {
    setSelectedImageIndex(0);
    setModalVisible(false);

  };
  const deleteimage = (id:number) => {
    if (photos && photos.length > 0) {
    var uri = photos[id].source.uri
    CameraRoll.deletePhotos([uri]);
    }
  };


  return (
<SafeAreaView style={styles.headercontainer}>
    <CustomHeader title="Photos" />
<View style={{ backgroundColor: "#BDE0FE" }}>
      <View style={{ width: '100%', alignItems: 'center' }}>

        <FlatList
          data={photos}
          numColumns={2}
          onEndReached={loadNextPagePictures}
          onEndReachedThreshold={0.1}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity onPress={() => openImageModal(index)}>
                <View style={styles.dvimg}>
                <Image style={styles.img}
                  key={index}
                  source={{ uri: item.source.uri }}
                />
              </View>
              </TouchableOpacity>
            )
          }} />
        <Modal visible={modalVisible} onRequestClose={closeImageModal}>
            <Gallery
              style={{ flex: 1, backgroundColor: 'black' }}
              images={photos}
              initialPage={selectedImageIndex}
            />
            <DelIcon height={40} width={40} onPress={() => deleteimage(selectedImageIndex)} color={'black'} />

      </Modal>
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
  dvimg: {
    width: Dimensions.get('window').width / 2 - 5,
    height: 200,
    borderRadius: 2,
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 0.9
  },
  img: {
    height: '99%',
    width: '99%'
  },
   scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

});

export default GalleryImageLoader;