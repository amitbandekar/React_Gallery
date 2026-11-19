import React, {useState, useEffect, useCallback, useMemo, useRef} from 'react';
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
  PanResponder,
} from 'react-native';
import {useGallery, ImageDTO} from './UseGallery';
import CustomHeader from './CustomHeader';
import FullImageModal from './FullImageModal';
import VaultPasswordModal from './VaultPasswordModal';
import PrivateVaultModal from './PrivateVaultModal';
import {
  isPasswordSet,
  getHiddenUris,
  hideItem,
  hideItems,
} from './vaultService';
import {CameraRoll, AssetType} from '@react-native-camera-roll/camera-roll';
import {launchCamera} from 'react-native-image-picker';
import {getFavorites} from './favoritesService';

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
  // Filter & Layout States
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [assetType, setAssetType] = useState<AssetType>('All');
  const [columns, setColumns] = useState<number>(3);
  const [sortDescending, setSortDescending] = useState<boolean>(true);
  const [favoriteUris, setFavoriteUris] = useState<string[]>([]);
  const [hiddenUris, setHiddenUris] = useState<string[]>([]);

  // Selection Mode States
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedUris, setSelectedUris] = useState<string[]>([]);

  // Modal Viewers
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  // Private Vault States
  const [vaultPasswordVisible, setVaultPasswordVisible] = useState(false);
  const [vaultPasswordMode, setVaultPasswordMode] = useState<'set' | 'unlock'>(
    'unlock',
  );
  const [privateVaultVisible, setPrivateVaultVisible] = useState(false);

  // References for pending hide actions before password was set
  const pendingHideItem = useRef<ImageDTO | null>(null);
  const pendingBatchHide = useRef<string[] | null>(null);

  const {
    photos,
    albums,
    loadNextPagePictures,
    refreshGallery,
    isLoading,
    isLoadingNextPage,
    isReloading,
    hasNextPage,
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

  const loadHiddenList = useCallback(async () => {
    const hidden = await getHiddenUris();
    setHiddenUris(hidden);
  }, []);

  const initGallery = useCallback(async () => {
    const permitted = await hasAndroidPermission();
    if (permitted) {
      loadNextPagePictures();
      loadFavoritesList();
      loadHiddenList();
    }
  }, [loadFavoritesList, loadHiddenList, loadNextPagePictures]);

  useEffect(() => {
    initGallery();
  }, [initGallery]);

  // Two-finger pinch gesture detection to open Private Vault
  const initialPinchDist = useRef<number>(0);
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponderCapture: evt =>
          evt.nativeEvent.touches.length >= 2,
        onMoveShouldSetPanResponderCapture: evt =>
          evt.nativeEvent.touches.length >= 2,
        onPanResponderGrant: evt => {
          if (evt.nativeEvent.touches.length >= 2) {
            const [t1, t2] = evt.nativeEvent.touches;
            initialPinchDist.current = Math.hypot(
              t1.pageX - t2.pageX,
              t1.pageY - t2.pageY,
            );
          }
        },
        onPanResponderMove: evt => {
          if (
            evt.nativeEvent.touches.length >= 2 &&
            initialPinchDist.current > 0
          ) {
            const [t1, t2] = evt.nativeEvent.touches;
            const dist = Math.hypot(t1.pageX - t2.pageX, t1.pageY - t2.pageY);
            // Trigger vault on distinct pinch gesture (>70px change)
            if (Math.abs(dist - initialPinchDist.current) > 70) {
              initialPinchDist.current = 0;
              handleTriggerVault();
            }
          }
        },
        onPanResponderRelease: () => {
          initialPinchDist.current = 0;
        },
      }),
    [],
  );

  const handleTriggerVault = async () => {
    const hasPass = await isPasswordSet();
    if (!hasPass) {
      setVaultPasswordMode('set');
    } else {
      setVaultPasswordMode('unlock');
    }
    setVaultPasswordVisible(true);
  };

  const handleVaultPasswordSuccess = async () => {
    setVaultPasswordVisible(false);

    // If there was a pending single hide
    if (pendingHideItem.current) {
      await hideItem(pendingHideItem.current);
      pendingHideItem.current = null;
      setModalVisible(false);
      loadHiddenList();
      Alert.alert('Hidden', 'Item moved to Private Vault.');
      return;
    }

    // If there was a pending batch hide
    if (pendingBatchHide.current) {
      const itemsToHide = displayedPhotos.filter(p =>
        pendingBatchHide.current?.includes(p.source.uri),
      );
      await hideItems(itemsToHide);
      pendingBatchHide.current = null;
      exitSelectionMode();
      loadHiddenList();
      Alert.alert('Hidden', 'Selected items moved to Private Vault.');
      return;
    }

    // Otherwise, open the vault!
    setPrivateVaultVisible(true);
  };

  // Filter out hidden items & apply favorites/sorting
  const displayedPhotos = useMemo(() => {
    let result = photos.filter(p => !hiddenUris.includes(p.source.uri));
    if (selectedAlbum === 'Favorites') {
      result = result.filter(p => favoriteUris.includes(p.source.uri));
    }
    if (!sortDescending) {
      result = [...result].sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeA - timeB;
      });
    }
    return result;
  }, [favoriteUris, hiddenUris, photos, selectedAlbum, sortDescending]);

  const itemWidth = (windowWidth - (columns + 1) * 2) / columns;

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

  const handleBatchHide = async () => {
    if (selectedUris.length === 0) {
      return;
    }
    const hasPass = await isPasswordSet();
    if (!hasPass) {
      pendingBatchHide.current = selectedUris;
      setVaultPasswordMode('set');
      setVaultPasswordVisible(true);
      return;
    }

    Alert.alert(
      'Hide Items',
      `Move ${selectedUris.length} item(s) to the Private Vault? They will be hidden from the gallery.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Hide',
          onPress: async () => {
            const itemsToHide = displayedPhotos.filter(p =>
              selectedUris.includes(p.source.uri),
            );
            await hideItems(itemsToHide);
            exitSelectionMode();
            loadHiddenList();
            Alert.alert(
              'Hidden',
              `${selectedUris.length} item(s) moved to Private Vault.`,
            );
          },
        },
      ],
    );
  };

  const handleSingleHide = async (photo: ImageDTO) => {
    const hasPass = await isPasswordSet();
    if (!hasPass) {
      pendingHideItem.current = photo;
      setVaultPasswordMode('set');
      setVaultPasswordVisible(true);
      return;
    }

    Alert.alert(
      'Hide Item',
      'Move this item to Private Vault? It will be hidden from the main gallery.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Hide',
          onPress: async () => {
            await hideItem(photo);
            setModalVisible(false);
            loadHiddenList();
            Alert.alert('Hidden', 'Item moved to Private Vault.');
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
        message: `Sharing ${selectedUris.length} items from Gallery`,
        url: selectedUris[0],
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

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
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
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
            Alert.alert('Error', 'Failed to delete item.');
          }
        },
      },
    ]);
  };

  const toggleColumns = () => {
    setColumns(prev => (prev === 2 ? 3 : prev === 3 ? 4 : 2));
  };

  return (
    <SafeAreaView style={styles.headercontainer} {...panResponder.panHandlers}>
      {/* Top Header */}
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
        <CustomHeader
          title="Gallery"
          subtitle={`${displayedPhotos.length} ${
            displayedPhotos.length === 1 ? 'item' : 'items'
          }`}
          onSecretVaultGesture={handleTriggerVault}
          rightComponent={
            <View style={styles.headerControls}>
              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={() => setSortDescending(!sortDescending)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.headerIconText}>
                  {sortDescending ? '↓ New' : '↑ Old'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.headerIconBtn}
                onPress={toggleColumns}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.headerIconText}>{columns} col</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.selectToggleBtn}
                onPress={() => setIsSelectionMode(true)}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.selectToggleText}>Select</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Modern Filter Chips Bar */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedAlbum === 'All' &&
                assetType === 'All' &&
                styles.filterChipActive,
            ]}
            onPress={() => {
              setSelectedAlbum('All');
              setAssetType('All');
            }}>
            <Text
              style={[
                styles.filterChipText,
                selectedAlbum === 'All' &&
                  assetType === 'All' &&
                  styles.filterChipTextActive,
              ]}>
              All Media
            </Text>
          </TouchableOpacity>

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
              📸 Photos
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

          {/* Dynamic Device Albums */}
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
                📁 {alb.title} ({alb.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Gallery Grid with Lazy Loading */}
      <View style={styles.body}>
        {isLoading && displayedPhotos.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loadingText}>Loading library...</Text>
          </View>
        ) : displayedPhotos.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyEmoji}>🖼️</Text>
            <Text style={styles.emptyTitle}>No Media Found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedAlbum === 'Favorites'
                ? 'Heart your favorite photos to see them here.'
                : 'No photos or videos match this filter.'}
            </Text>
          </View>
        ) : (
          <FlatList
            key={`grid-${columns}`}
            data={displayedPhotos}
            numColumns={columns}
            keyExtractor={(item, index) => item.source.uri || `photo-${index}`}
            refreshControl={
              <RefreshControl
                refreshing={isReloading}
                onRefresh={refreshGallery}
                tintColor="#38bdf8"
                colors={['#38bdf8']}
              />
            }
            onEndReached={() => {
              if (hasNextPage && !isLoadingNextPage) {
                loadNextPagePictures();
              }
            }}
            onEndReachedThreshold={0.4}
            initialNumToRender={24}
            maxToRenderPerBatch={18}
            windowSize={7}
            removeClippedSubviews={Platform.OS === 'android'}
            renderItem={({item, index}) => {
              const isSelected = selectedUris.includes(item.source.uri);
              const isFav = favoriteUris.includes(item.source.uri);
              const isVideo = Boolean(
                (item.playableDuration && item.playableDuration > 0) ||
                  item.type === 'video' ||
                  item.source?.uri?.endsWith('.mp4') ||
                  item.source?.uri?.endsWith('.mov') ||
                  item.source?.uri?.includes('/video/'),
              );

              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleItemPress(index)}
                  onLongPress={() => handleItemLongPress(index)}
                  style={[
                    styles.gridItem,
                    {width: itemWidth, height: itemWidth},
                    isSelected && styles.gridItemSelected,
                  ]}>
                  <Image
                    source={{uri: item.source.uri}}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />

                  {/* Video Duration Badge */}
                  {isVideo ? (
                    <View style={styles.videoBadge}>
                      <Text style={styles.videoBadgeText}>
                        ▶ {formatDuration(item.playableDuration)}
                      </Text>
                    </View>
                  ) : null}

                  {/* Favorite Heart Indicator */}
                  {isFav ? (
                    <View style={styles.favIndicator}>
                      <Text style={styles.favIndicatorText}>❤️</Text>
                    </View>
                  ) : null}

                  {/* Selection Mode Checkbox Badge */}
                  {isSelectionMode ? (
                    <View
                      style={[
                        styles.selectionBadge,
                        isSelected && styles.selectionBadgeActive,
                      ]}>
                      {isSelected ? (
                        <Text style={styles.selectionCheckmark}>✓</Text>
                      ) : null}
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              isLoadingNextPage ? (
                <View style={styles.footerLoader}>
                  <ActivityIndicator size="small" color="#38bdf8" />
                </View>
              ) : null
            }
          />
        )}

        {/* Floating Quick Camera Button */}
        {!isSelectionMode ? (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleQuickCamera}
            activeOpacity={0.85}>
            <Text style={styles.fabIcon}>📷</Text>
          </TouchableOpacity>
        ) : null}

        {/* Selection Actions Bottom Bar */}
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
              style={[styles.batchBtn, styles.batchHideBtn]}
              onPress={handleBatchHide}
              disabled={selectedUris.length === 0}>
              <Text style={styles.batchBtnEmoji}>🔒</Text>
              <Text style={styles.batchBtnText}>Hide</Text>
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

        {/* Full Screen Image & Video Viewer */}
        <FullImageModal
          visible={modalVisible}
          images={displayedPhotos}
          initialIndex={selectedImageIndex}
          onClose={() => {
            setModalVisible(false);
            loadFavoritesList();
          }}
          onDelete={handleDeleteSingle}
          onHide={handleSingleHide}
        />

        {/* Secret Vault Password Passcode Modal */}
        <VaultPasswordModal
          visible={vaultPasswordVisible}
          mode={vaultPasswordMode}
          onSuccess={handleVaultPasswordSuccess}
          onClose={() => {
            setVaultPasswordVisible(false);
            pendingHideItem.current = null;
            pendingBatchHide.current = null;
          }}
        />

        {/* Hidden Private Vault View */}
        <PrivateVaultModal
          visible={privateVaultVisible}
          onClose={() => setPrivateVaultVisible(false)}
          onItemsUpdated={() => {
            loadHiddenList();
            refreshGallery();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  selectionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  selectAllText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '700',
  },
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerIconText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  selectToggleBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectToggleText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  filtersWrapper: {
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#131b2e',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  filterChipActive: {
    backgroundColor: '#0369a1',
    borderColor: '#38bdf8',
  },
  filterChipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  body: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyEmoji: {
    fontSize: 54,
    marginBottom: 12,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  gridItem: {
    margin: 1,
    backgroundColor: '#1e293b',
    overflow: 'hidden',
    position: 'relative',
  },
  gridItemSelected: {
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  favIndicator: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  favIndicatorText: {
    fontSize: 10,
  },
  selectionBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionBadgeActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  selectionCheckmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0284c7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0284c7',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 15,
  },
  fabIcon: {
    fontSize: 26,
  },
  batchBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
  },
  batchBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  batchHideBtn: {},
  batchDeleteBtn: {},
  batchBtnEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  batchBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  batchDeleteText: {
    color: '#ef4444',
  },
});

export default GalleryImageLoader;
