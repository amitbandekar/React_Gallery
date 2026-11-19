import React, {useState, useEffect, useCallback} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import {ImageDTO} from './UseGallery';
import {getHiddenItems, unhideItems, unhideItem} from './vaultService';
import FullImageModal from './FullImageModal';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

interface PrivateVaultModalProps {
  visible: boolean;
  onClose: () => void;
  onItemsUpdated: () => void;
}

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - 16) / 3;

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) {
    return '';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const PrivateVaultModal: React.FC<PrivateVaultModalProps> = ({
  visible,
  onClose,
  onItemsUpdated,
}) => {
  const [items, setItems] = useState<ImageDTO[]>([]);
  const [selectedUris, setSelectedUris] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);

  const loadItems = useCallback(async () => {
    const hidden = await getHiddenItems();
    setItems(hidden);
  }, []);

  useEffect(() => {
    if (visible) {
      loadItems();
      setSelectedUris([]);
      setIsSelectionMode(false);
    }
  }, [visible, loadItems]);

  const handleItemPress = (index: number) => {
    if (isSelectionMode) {
      const uri = items[index].source.uri;
      if (selectedUris.includes(uri)) {
        setSelectedUris(prev => prev.filter(u => u !== uri));
      } else {
        setSelectedUris(prev => [...prev, uri]);
      }
    } else {
      setViewIndex(index);
      setViewerVisible(true);
    }
  };

  const handleItemLongPress = (index: number) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedUris([items[index].source.uri]);
    }
  };

  const handleBatchUnhide = async () => {
    if (selectedUris.length === 0) {
      return;
    }
    Alert.alert(
      'Unhide Items',
      `Restore ${selectedUris.length} item(s) to the main gallery?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Unhide',
          onPress: async () => {
            await unhideItems(selectedUris);
            setSelectedUris([]);
            setIsSelectionMode(false);
            loadItems();
            onItemsUpdated();
            Alert.alert('Restored', 'Items restored to main gallery.');
          },
        },
      ],
    );
  };

  const handleBatchDelete = async () => {
    if (selectedUris.length === 0) {
      return;
    }
    Alert.alert(
      'Permanent Delete',
      `Permanently delete ${selectedUris.length} item(s) from device? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CameraRoll.deletePhotos(selectedUris);
            } catch (err) {
              console.warn('CameraRoll delete error:', err);
            }
            await unhideItems(selectedUris);
            setSelectedUris([]);
            setIsSelectionMode(false);
            loadItems();
            onItemsUpdated();
          },
        },
      ],
    );
  };

  const handleSingleDelete = async (index: number) => {
    const item = items[index];
    if (!item) {
      return;
    }
    Alert.alert(
      'Permanent Delete',
      'Permanently delete this item from device? This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await CameraRoll.deletePhotos([item.source.uri]);
            } catch (err) {
              console.warn('CameraRoll delete error:', err);
            }
            await unhideItem(item.source.uri);
            setViewerVisible(false);
            loadItems();
            onItemsUpdated();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {isSelectionMode ? (
            <TouchableOpacity
              onPress={() => {
                setIsSelectionMode(false);
                setSelectedUris([]);
              }}
              style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>✕ Cancel</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.titleGroup}>
              <Text style={styles.vaultTitle}>🔒 Private Vault</Text>
              <Text style={styles.vaultSubtitle}>
                {items.length}{' '}
                {items.length === 1 ? 'hidden item' : 'hidden items'}
              </Text>
            </View>
          )}

          {isSelectionMode ? (
            <Text style={styles.selectionCount}>
              {selectedUris.length} Selected
            </Text>
          ) : (
            <TouchableOpacity onPress={onClose} style={styles.lockBtn}>
              <Text style={styles.lockBtnText}>🔒 Lock Vault</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛡️</Text>
            <Text style={styles.emptyTitle}>Vault is Empty</Text>
            <Text style={styles.emptySubtitle}>
              You have no hidden photos or videos.{'\n'}
              Hide items from the main gallery or full-screen viewer to secure
              them here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            numColumns={3}
            keyExtractor={item => item.source.uri}
            contentContainerStyle={styles.listContent}
            renderItem={({item, index}) => {
              const isSelected = selectedUris.includes(item.source.uri);
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
                      styles.itemCard,
                      isSelected && styles.itemCardSelected,
                    ]}>
                    <Image
                      source={{uri: item.source.uri}}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />

                    {isSelectionMode ? (
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxActive,
                        ]}>
                        <Text style={styles.checkboxCheck}>
                          {isSelected ? '✓' : ''}
                        </Text>
                      </View>
                    ) : null}

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
          />
        )}

        {/* Batch Bar */}
        {isSelectionMode ? (
          <View style={styles.batchBar}>
            <TouchableOpacity
              style={styles.unhideBtn}
              onPress={handleBatchUnhide}
              disabled={selectedUris.length === 0}>
              <Text style={styles.batchEmoji}>🔓</Text>
              <Text style={styles.batchBtnText}>
                Unhide ({selectedUris.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleBatchDelete}
              disabled={selectedUris.length === 0}>
              <Text style={styles.batchEmoji}>🗑️</Text>
              <Text style={styles.batchBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Full Image Viewer */}
        <FullImageModal
          visible={viewerVisible}
          images={items}
          initialIndex={viewIndex}
          onClose={() => setViewerVisible(false)}
          onDelete={handleSingleDelete}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  titleGroup: {
    flex: 1,
  },
  vaultTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  vaultSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  headerBtn: {
    padding: 6,
  },
  headerBtnText: {
    color: '#cbd5e1',
    fontSize: 15,
    fontWeight: '600',
  },
  selectionCount: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  lockBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 54,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 2,
  },
  itemCard: {
    width: itemSize,
    height: itemSize,
    margin: 2,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
    position: 'relative',
  },
  itemCardSelected: {
    borderWidth: 3,
    borderColor: '#38bdf8',
  },
  itemImage: {
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#38bdf8',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
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
  batchBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  unhideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    gap: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#dc2626',
    gap: 8,
  },
  batchEmoji: {
    fontSize: 16,
  },
  batchBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PrivateVaultModal;
