import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Text,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {useGallery} from './UseGallery';
import CustomHeader from './CustomHeader';
import FullImageModal from './FullImageModal';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

async function hasAndroidPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }

  const version =
    typeof Platform.Version === 'string'
      ? parseInt(Platform.Version, 10)
      : Platform.Version;

  if (version >= 33) {
    const hasImages = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
    );
    const hasVideo = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    );
    if (hasImages && hasVideo) {
      return true;
    }
    const statuses = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
    ]);
    return (
      statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  }
}

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - 12) / 2;

const GalleryImageLoader: React.FC = () => {
  const {
    photos,
    loadNextPagePictures,
    getUnloadedPictures,
    isLoading,
    isLoadingNextPage,
  } = useGallery({
    pageSize: 20,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const initGallery = useCallback(async () => {
    const permitted = await hasAndroidPermission();
    if (permitted) {
      loadNextPagePictures();
    }
  }, [loadNextPagePictures]);

  useEffect(() => {
    initGallery();
  }, [initGallery]);

  const openImageModal = (index: number) => {
    if (photos && photos.length > index) {
      setSelectedImageIndex(index);
      setModalVisible(true);
    }
  };

  const closeImageModal = () => {
    setModalVisible(false);
  };

  const deleteImage = (index: number) => {
    if (!photos || photos.length === 0 || !photos[index]) {
      return;
    }
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const uri = photos[index].source.uri;
            await CameraRoll.deletePhotos([uri]);
            setModalVisible(false);
            getUnloadedPictures();
          } catch (error) {
            console.error('Failed to delete photo:', error);
            Alert.alert('Error', 'Failed to delete photo.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.headercontainer}>
      <CustomHeader title="Photos" />
      <View style={styles.body}>
        {isLoading && photos.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#272640" />
            <Text style={styles.loadingText}>Loading photos...</Text>
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No photos found in gallery.</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadNextPagePictures}>
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={photos}
            numColumns={2}
            keyExtractor={(item, index) => item.source.uri || String(index)}
            onEndReached={loadNextPagePictures}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            renderItem={({item, index}) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => openImageModal(index)}>
                <View style={styles.dvimg}>
                  <Image
                    style={styles.img}
                    source={{uri: item.source.uri}}
                    resizeMode="cover"
                  />
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              isLoadingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#272640" />
                </View>
              ) : null
            }
          />
        )}

        <FullImageModal
          visible={modalVisible}
          images={photos}
          initialIndex={selectedImageIndex}
          onClose={closeImageModal}
          onDelete={deleteImage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  body: {
    flex: 1,
    backgroundColor: '#BDE0FE',
  },
  listContent: {
    padding: 3,
  },
  dvimg: {
    width: itemSize,
    height: itemSize,
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#a2d2ff',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#272640',
  },
  emptyText: {
    fontSize: 16,
    color: '#272640',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#00b5ec',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: 15,
    alignItems: 'center',
  },
});

export default GalleryImageLoader;
