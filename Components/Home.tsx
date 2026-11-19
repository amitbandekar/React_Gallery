import React, {useState, useEffect, useCallback, useMemo} from 'react';
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
  RefreshControl,
  ScrollView,
  Share,
} from 'react-native';
import {useGallery} from './UseGallery';
import CustomHeader from './CustomHeader';
import FullImageModal from './FullImageModal';
import {CameraRoll, AssetType} from '@react-native-camera-roll/camera-roll';
import {launchCamera} from 'react-native-image-picker';
import {getFavorites} from './favoritesService';
import {useNavigation, NavigationProp} from '@react-navigation/native';

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

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) {
    return '';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const GalleryImageLoader: React.FC = () => {
  const navigation = useNavigation<NavigationProp<Record<string, any>>>();

  // Filter & Layout States
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [assetType, setAssetType] = useState<AssetType>('All');
  const [columns, setColumns] = useState<number>(3);
  const [sortDescending, setSortDescending] = useState<boolean>(true);
  const [favoriteUris, setFavoriteUris] = useState<string[]>([]);

  // Selection Mode States
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedUris, setSelectedUris] = useState<string[]>([]);

  // Modal Viewer
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const {
    photos,
    albums,
    loadNextPagePictures,
    refreshGallery,
    isLoading,
    isLoadingNextPage,
    isReloading,
  } = useGallery({
    pageSize: 30,
    groupName:
      selectedAlbum === 'All' || selectedAlbum === 'Favorites'
        ? undefined
        : selectedAlbum,
    assetType,
  });

  const loadFavoritesList = useCallback(async () => {
    const favs = await getFavorites();
    setFavoriteUris(favs);
  }, []);

  const initGallery = useCallback(async () => {
    const permitted = await hasAndroidPermission();
    if (permitted) {
      loadNextPagePictures();
      loadFavoritesList();
    }
  }, [loadFavoritesList, loadNextPagePictures]);

  useEffect(() => {
    initGallery();
  }, [initGallery]);

  // Filter by Favorites if selected
  const displayedPhotos = useMemo(() => {
    let result = [...photos];
    if (selectedAlbum === 'Favorites') {
      result = result.filter(p => favoriteUris.includes(p.source.uri));
    }
    result.sort((a, b) => {
      const timeA = a.timestamp || 0;
      const timeB = b.timestamp || 0;
      return sortDescending ? timeB - timeA : timeA - timeB;
    });
    return result;
  }, [favoriteUris, photos, selectedAlbum, sortDescending]);

  const itemWidth = (windowWidth - (columns + 1) * 4) / columns;

  // Single Item Click
  const handleItemPress = (index: number) => {
    if (isSelectionMode) {
      const photo = displayedPhotos[index];
      if (!photo) {
        return;
      }
      const uri = photo.source.uri;
      if (selectedUris.includes(uri)) {
        setSelectedUris(prev => prev.filter(item => item !== uri));
      } else {
        setSelectedUris(prev => [...prev, uri]);
      }
    } else {
      setSelectedImageIndex(index);
      setModalVisible(true);
    }
  };

  // Long Press to Enter Selection Mode
  const handleItemLongPress = (index: number) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      const photo = displayedPhotos[index];
      if (photo) {
        setSelectedUris([photo.source.uri]);
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedUris.length === displayedPhotos.length) {
      setSelectedUris([]);
    } else {
      setSelectedUris(displayedPhotos.map(p => p.source.uri));
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedUris([]);
  };

  const handleBatchDelete = () => {
    if (selectedUris.length === 0) {
      return;
    }
    Alert.alert(
      'Delete Selected',
      `Are you sure you want to delete ${selectedUris.length} item(s)?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CameraRoll.deletePhotos(selectedUris);
              exitSelectionMode();
              refreshGallery();
              loadFavoritesList();
            } catch (error) {
              console.error('Batch delete error:', error);
              Alert.alert('Error', 'Failed to delete some items.');
            }
          },
        },
      ],
    );
  };

  const handleBatchShare = async () => {
    if (selectedUris.length === 0) {
      return;
    }
    try {
      await Share.share({
        message: `Sharing ${selectedUris.length} photos`,
        url: selectedUris[0],
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  // Quick Camera Launch (FAB)
  const handleQuickCamera = () => {
    launchCamera({mediaType: 'photo', saveToPhotos: true}, response => {
      if (!response.didCancel && !response.errorMessage) {
        refreshGallery();
      }
    });
  };

  const handleDeleteSingle = (index: number) => {
    const photo = displayedPhotos[index];
    if (!photo) {
      return;
    }
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await CameraRoll.deletePhotos([photo.source.uri]);
            setModalVisible(false);
            refreshGallery();
            loadFavoritesList();
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('Error', 'Failed to delete photo.');
          }
        },
      },
    ]);
  };

  const handleNavigateToTool = (
    tool: 'Magic' | 'BgRemover' | 'Generative AI',
    imageUri: string,
  ) => {
    navigation.navigate(tool, {initialImageUri: imageUri});
  };

  const toggleColumns = () => {
    setColumns(prev => (prev === 2 ? 3 : prev === 3 ? 4 : 2));
  };

  return (
    <SafeAreaView style={styles.headercontainer}>
      {/* Dynamic Header */}
      {isSelectionMode ? (
        <View style={styles.selectionHeader}>
          <TouchableOpacity
            onPress={exitSelectionMode}
            style={styles.headerBtn}>
            <Text style={styles.cancelText}>✕ Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.selectionTitle}>
            {selectedUris.length} Selected
          </Text>
          <TouchableOpacity onPress={handleSelectAll} style={styles.headerBtn}>
            <Text style={styles.selectAllText}>
              {selectedUris.length === displayedPhotos.length
                ? 'Deselect'
                : 'Select All'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <CustomHeader title="Photos" />
          {/* Controls Bar: Sort & Columns */}
          <View style={styles.subHeaderBar}>
            <Text style={styles.itemCountText}>
              {displayedPhotos.length}{' '}
              {displayedPhotos.length === 1 ? 'item' : 'items'}
            </Text>
            <View style={styles.subHeaderControls}>
              <TouchableOpacity
                style={styles.controlPill}
                onPress={() => setSortDescending(!sortDescending)}>
                <Text style={styles.controlPillText}>
                  {sortDescending ? '🕒 Newest' : '🕒 Oldest'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.controlPill}
                onPress={toggleColumns}>
                <Text style={styles.controlPillText}>{columns} cols</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Album & Category Filter Scroll */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedAlbum === 'All' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedAlbum('All')}>
            <Text
              style={[
                styles.filterChipText,
                selectedAlbum === 'All' && styles.filterChipTextActive,
              ]}>
              📁 All Media
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedAlbum === 'Favorites' && styles.filterChipActive,
            ]}
            onPress={() => {
              setSelectedAlbum('Favorites');
              loadFavoritesList();
            }}>
            <Text
              style={[
                styles.filterChipText,
                selectedAlbum === 'Favorites' && styles.filterChipTextActive,
              ]}>
              ❤️ Favorites ({favoriteUris.length})
            </Text>
          </TouchableOpacity>

          {/* Media Type Quick Filters */}
          <TouchableOpacity
            style={[
              styles.filterChip,
              assetType === 'Photos' && styles.filterChipActive,
            ]}
            onPress={() =>
              setAssetType(assetType === 'Photos' ? 'All' : 'Photos')
            }>
            <Text
              style={[
                styles.filterChipText,
                assetType === 'Photos' && styles.filterChipTextActive,
              ]}>
              📷 Photos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              assetType === 'Videos' && styles.filterChipActive,
            ]}
            onPress={() =>
              setAssetType(assetType === 'Videos' ? 'All' : 'Videos')
            }>
            <Text
              style={[
                styles.filterChipText,
                assetType === 'Videos' && styles.filterChipTextActive,
              ]}>
              🎥 Videos
            </Text>
          </TouchableOpacity>

          {/* Device Albums */}
          {albums.map(alb => (
            <TouchableOpacity
              key={alb.title}
              style={[
                styles.filterChip,
                selectedAlbum === alb.title && styles.filterChipActive,
              ]}
              onPress={() => setSelectedAlbum(alb.title)}>
              <Text
                style={[
                  styles.filterChipText,
                  selectedAlbum === alb.title && styles.filterChipTextActive,
                ]}>
                {alb.title} ({alb.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Gallery Grid */}
      <View style={styles.body}>
        {isLoading && displayedPhotos.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#272640" />
            <Text style={styles.loadingText}>Loading library...</Text>
          </View>
        ) : displayedPhotos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyText}>No media found in this album.</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={refreshGallery}>
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            key={columns}
            data={displayedPhotos}
            numColumns={columns}
            keyExtractor={(item, index) => item.source.uri || String(index)}
            onEndReached={loadNextPagePictures}
            onEndReachedThreshold={0.5}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isReloading}
                onRefresh={refreshGallery}
                tintColor="#272640"
              />
            }
            renderItem={({item, index}) => {
              const isSelected = selectedUris.includes(item.source.uri);
              const isFav = favoriteUris.includes(item.source.uri);
              const isVideo = Boolean(
                item.playableDuration && item.playableDuration > 0,
              );

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleItemPress(index)}
                  onLongPress={() => handleItemLongPress(index)}>
                  <View
                    style={[
                      styles.dvimg,
                      {width: itemWidth, height: itemWidth},
                      isSelected && styles.selectedItemBorder,
                    ]}>
                    <Image
                      style={styles.img}
                      source={{uri: item.source.uri}}
                      resizeMode="cover"
                    />

                    {/* Selection Indicator Checkbox */}
                    {isSelectionMode ? (
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxActive,
                        ]}>
                        <Text style={styles.checkboxText}>
                          {isSelected ? '✓' : ''}
                        </Text>
                      </View>
                    ) : null}

                    {/* Favorite Heart Badge */}
                    {!isSelectionMode && isFav ? (
                      <View style={styles.favBadge}>
                        <Text style={styles.favBadgeText}>❤️</Text>
                      </View>
                    ) : null}

                    {/* Video Duration Badge */}
                    {isVideo ? (
                      <View style={styles.videoBadge}>
                        <Text style={styles.videoBadgeText}>
                          ▶ {formatDuration(item.playableDuration)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              isLoadingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#272640" />
                </View>
              ) : null
            }
          />
        )}

        {/* Floating Camera Action Button (FAB) */}
        {!isSelectionMode ? (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleQuickCamera}
            activeOpacity={0.85}>
            <Text style={styles.fabIcon}>📷</Text>
          </TouchableOpacity>
        ) : null}

        {/* Batch Operations Bottom Bar */}
        {isSelectionMode ? (
          <View style={styles.batchBar}>
            <TouchableOpacity
              style={styles.batchBtn}
              onPress={handleBatchShare}
              disabled={selectedUris.length === 0}>
              <Text style={styles.batchBtnEmoji}>📤</Text>
              <Text style={styles.batchBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.batchBtn, styles.batchDeleteBtn]}
              onPress={handleBatchDelete}
              disabled={selectedUris.length === 0}>
              <Text style={styles.batchBtnEmoji}>🗑️</Text>
              <Text style={[styles.batchBtnText, styles.batchDeleteText]}>
                Delete ({selectedUris.length})
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Full Screen Image Modal */}
        <FullImageModal
          visible={modalVisible}
          images={displayedPhotos}
          initialIndex={selectedImageIndex}
          onClose={() => {
            setModalVisible(false);
            loadFavoritesList();
          }}
          onDelete={handleDeleteSingle}
          onNavigateToTool={handleNavigateToTool}
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
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#272640',
  },
  headerBtn: {
    padding: 6,
  },
  cancelText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  selectionTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  selectAllText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '600',
  },
  subHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  subHeaderControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  controlPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  filtersWrapper: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  body: {
    flex: 1,
    backgroundColor: '#BDE0FE',
  },
  listContent: {
    padding: 2,
  },
  dvimg: {
    margin: 2,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#a2d2ff',
    position: 'relative',
  },
  selectedItemBorder: {
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  checkbox: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563eb',
    borderColor: '#ffffff',
  },
  checkboxText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  favBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  favBadgeText: {
    fontSize: 11,
  },
  videoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#272640',
    marginBottom: 14,
    fontWeight: '500',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#272640',
  },
  retryButton: {
    backgroundColor: '#00b5ec',
    paddingHorizontal: 22,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100,
  },
  fabIcon: {
    fontSize: 26,
  },
  batchBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#334155',
    gap: 6,
  },
  batchBtnEmoji: {
    fontSize: 16,
  },
  batchBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  batchDeleteBtn: {
    backgroundColor: '#dc2626',
  },
  batchDeleteText: {
    color: '#ffffff',
  },
});

export default GalleryImageLoader;
