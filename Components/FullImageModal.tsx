import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Share,
  ScrollView,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import Gallery from 'react-native-image-gallery';
import {ImageDTO} from './UseGallery';
import {isFavorite, toggleFavorite} from './favoritesService';

interface FullImageModalProps {
  visible: boolean;
  images: ImageDTO[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (index: number) => void;
  onHide?: (image: ImageDTO) => void;
  onNavigateToTool?: (
    tool: 'Magic' | 'BgRemover' | 'Generative AI',
    imageUri: string,
  ) => void;
}

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) {
    return 'Unknown';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (timestamp?: number): string => {
  if (!timestamp) {
    return 'Unknown';
  }
  const date = new Date(timestamp > 1e11 ? timestamp : timestamp * 1000);
  return date.toLocaleString();
};

const formatDuration = (seconds?: number): string => {
  if (!seconds || seconds <= 0) {
    return '';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const FullImageModal: React.FC<FullImageModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onDelete,
  onHide,
  onNavigateToTool,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [rotation, setRotation] = useState(0);

  const currentImage = images[currentIndex];
  const isVideo = Boolean(
    (currentImage?.playableDuration && currentImage.playableDuration > 0) ||
      currentImage?.type === 'video' ||
      currentImage?.source?.uri?.endsWith('.mp4') ||
      currentImage?.source?.uri?.endsWith('.mov'),
  );

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setRotation(0);
  }, [initialIndex]);

  useEffect(() => {
    let active = true;
    if (currentImage?.source?.uri) {
      isFavorite(currentImage.source.uri).then(fav => {
        if (active) {
          setIsFav(fav);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [currentImage]);

  const handleToggleFavorite = async () => {
    if (!currentImage?.source?.uri) {
      return;
    }
    const updated = await toggleFavorite(currentImage.source.uri);
    setIsFav(updated);
  };

  const handleShare = async () => {
    if (!currentImage?.source?.uri) {
      return;
    }
    try {
      await Share.share({
        title: currentImage.filename || (isVideo ? 'Video' : 'Photo'),
        url: currentImage.source.uri,
        message: `Sharing ${isVideo ? 'video' : 'photo'}: ${
          currentImage.source.uri
        }`,
      });
    } catch (error) {
      console.warn('Share error:', error);
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handlePlayVideo = async () => {
    if (!currentImage?.source?.uri) {
      return;
    }
    try {
      const supported = await Linking.canOpenURL(currentImage.source.uri);
      if (supported) {
        await Linking.openURL(currentImage.source.uri);
      } else {
        Alert.alert(
          'Video Playback',
          `Cannot open video directly from ${currentImage.source.uri}. Native player required.`,
        );
      }
    } catch (error) {
      console.warn('Video open error:', error);
      Alert.alert('Video Playback', 'Opening video with system player...');
    }
  };

  const handleHideToVault = () => {
    if (!currentImage) {
      return;
    }
    if (onHide) {
      onHide(currentImage);
    }
  };

  const handleToolPress = (tool: 'Magic' | 'BgRemover' | 'Generative AI') => {
    if (!currentImage?.source?.uri) {
      return;
    }
    onClose();
    if (onNavigateToTool) {
      onNavigateToTool(tool, currentImage.source.uri);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <Text style={styles.headerBtnText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.counterText}>
            {images.length > 0 ? `${currentIndex + 1} / ${images.length}` : ''}
          </Text>

          <View style={styles.headerActions}>
            {onHide ? (
              <TouchableOpacity
                onPress={handleHideToVault}
                style={styles.iconButton}>
                <Text style={styles.actionEmoji}>🔒</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.iconButton}>
              <Text style={styles.actionEmoji}>{isFav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>

            {!isVideo ? (
              <TouchableOpacity
                onPress={handleRotate}
                style={styles.iconButton}>
                <Text style={styles.actionEmoji}>🔄</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
              <Text style={styles.actionEmoji}>📤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              style={styles.iconButton}>
              <Text style={styles.actionEmoji}>ℹ️</Text>
            </TouchableOpacity>

            {onDelete ? (
              <TouchableOpacity
                onPress={() => onDelete(currentIndex)}
                style={styles.iconButton}>
                <Text style={styles.actionEmoji}>🗑️</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Gallery Area */}
        <View
          style={[
            styles.galleryContainer,
            {transform: [{rotate: `${rotation}deg`}]},
          ]}>
          <Gallery
            style={styles.gallery}
            images={images}
            initialPage={initialIndex}
            onPageSelected={(index: number) => {
              setCurrentIndex(index);
              setRotation(0);
            }}
          />

          {/* Floating Video Play Button Overlay */}
          {isVideo ? (
            <TouchableOpacity
              style={styles.videoPlayOverlay}
              activeOpacity={0.8}
              onPress={handlePlayVideo}>
              <View style={styles.videoPlayBtn}>
                <Text style={styles.videoPlayTriangle}>▶</Text>
              </View>
              <Text style={styles.videoPlayLabel}>
                Play Video{' '}
                {currentImage?.playableDuration
                  ? `(${formatDuration(currentImage.playableDuration)})`
                  : ''}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Bottom Quick Tools Toolbar (only for photos) */}
        {!isVideo && onNavigateToTool ? (
          <View style={styles.bottomToolbar}>
            <Text style={styles.toolsTitle}>Quick Enhance Tools:</Text>
            <View style={styles.toolButtonsRow}>
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => handleToolPress('Magic')}>
                <Text style={styles.toolIcon}>🪄</Text>
                <Text style={styles.toolLabel}>Denoise</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => handleToolPress('BgRemover')}>
                <Text style={styles.toolIcon}>✂️</Text>
                <Text style={styles.toolLabel}>Remove BG</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => handleToolPress('Generative AI')}>
                <Text style={styles.toolIcon}>✨</Text>
                <Text style={styles.toolLabel}>AI Stylize</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Info Details Sheet Modal */}
        <Modal
          visible={showInfo}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInfo(false)}>
          <View style={styles.infoModalOverlay}>
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardTitle}>
                  {isVideo ? 'Video Details' : 'Photo Details'}
                </Text>
                <TouchableOpacity onPress={() => setShowInfo(false)}>
                  <Text style={styles.infoCardClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.infoScroll}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Filename:</Text>
                  <Text style={styles.infoVal}>
                    {currentImage?.filename || 'Unnamed media'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Date Taken:</Text>
                  <Text style={styles.infoVal}>
                    {formatDate(currentImage?.timestamp)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>File Size:</Text>
                  <Text style={styles.infoVal}>
                    {formatFileSize(currentImage?.fileSize)}
                  </Text>
                </View>

                {currentImage?.width && currentImage?.height ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoField}>Dimensions:</Text>
                    <Text style={styles.infoVal}>
                      {currentImage.width} × {currentImage.height} px
                    </Text>
                  </View>
                ) : null}

                {currentImage?.playableDuration ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoField}>Duration:</Text>
                    <Text style={styles.infoVal}>
                      {formatDuration(currentImage.playableDuration)} (
                      {Math.round(currentImage.playableDuration)}s)
                    </Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Type:</Text>
                  <Text style={styles.infoVal}>
                    {isVideo ? 'Video (Media)' : currentImage?.type || 'Image'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Path / URI:</Text>
                  <Text
                    style={[styles.infoVal, styles.uriText]}
                    numberOfLines={3}>
                    {currentImage?.source?.uri}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    zIndex: 10,
  },
  headerBtnText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  counterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 2,
  },
  actionEmoji: {
    fontSize: 18,
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  gallery: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoPlayOverlay: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#38bdf8',
    gap: 10,
  },
  videoPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayTriangle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  videoPlayLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  bottomToolbar: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  toolsTitle: {
    color: '#aaaaaa',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  toolButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
  },
  toolIcon: {
    fontSize: 16,
  },
  toolLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  infoCard: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 10,
  },
  infoCardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCardClose: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },
  infoScroll: {
    maxHeight: 300,
  },
  infoRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  infoField: {
    width: 100,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoVal: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  uriText: {
    fontSize: 11,
    color: '#60a5fa',
  },
});

export default FullImageModal;
