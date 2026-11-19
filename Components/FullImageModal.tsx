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
  Platform,
  Image,
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
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Synchronize currentIndex immediately whenever initialIndex changes or modal becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setRotation(0);
    }
  }, [initialIndex, visible]);

  const currentImage = images[currentIndex];
  const isVideo = Boolean(
    (currentImage?.playableDuration && currentImage.playableDuration > 0) ||
      currentImage?.type === 'video' ||
      currentImage?.source?.uri?.endsWith('.mp4') ||
      currentImage?.source?.uri?.endsWith('.mov') ||
      currentImage?.source?.uri?.includes('/video/'),
  );

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
    const newStatus = await toggleFavorite(currentImage.source.uri);
    setIsFav(newStatus);
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
    const uri = currentImage.source.uri;
    try {
      if (Platform.OS === 'android') {
        await Linking.sendIntent('android.intent.action.VIEW', [
          {key: 'data', value: uri},
          {key: 'type', value: 'video/*'},
        ]);
      } else {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.warn('sendIntent error, falling back to openURL:', error);
      try {
        await Linking.openURL(uri);
      } catch (openErr) {
        console.warn('Cannot open video directly:', openErr);
      }
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

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRotation(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setRotation(0);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Sleek Modern Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.iconButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.counterWrapper}>
            <Text style={styles.counterText}>
              {images.length > 0
                ? `${currentIndex + 1} / ${images.length}`
                : ''}
            </Text>
            {isVideo ? (
              <View style={styles.videoIndicatorPill}>
                <Text style={styles.videoIndicatorText}>VIDEO</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            {onHide ? (
              <TouchableOpacity
                onPress={handleHideToVault}
                style={styles.iconButton}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.actionEmoji}>🔒</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleToggleFavorite}
              style={styles.iconButton}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.actionEmoji}>{isFav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>

            {!isVideo ? (
              <TouchableOpacity
                onPress={handleRotate}
                style={styles.iconButton}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.actionEmoji}>🔄</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              onPress={handleShare}
              style={styles.iconButton}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.actionEmoji}>📤</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              style={styles.iconButton}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.actionEmoji}>ℹ️</Text>
            </TouchableOpacity>

            {onDelete ? (
              <TouchableOpacity
                onPress={() => onDelete(currentIndex)}
                style={styles.iconButton}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Text style={styles.actionEmoji}>🗑️</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Media Viewing Area */}
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View style={styles.videoCardWrapper}>
              <Image
                source={{uri: currentImage?.source?.uri}}
                style={styles.videoPoster}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.videoPlayOverlay}
                activeOpacity={0.85}
                onPress={handlePlayVideo}>
                <View style={styles.videoPlayCircle}>
                  <Text style={styles.videoPlayTriangle}>▶</Text>
                </View>
                <View style={styles.videoPlayBtn}>
                  <Text style={styles.videoPlayText}>
                    Play Video{' '}
                    {currentImage?.playableDuration
                      ? `(${formatDuration(currentImage.playableDuration)})`
                      : ''}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={[
                styles.galleryWrapper,
                {transform: [{rotate: `${rotation}deg`}]},
              ]}>
              <Gallery
                key={`gallery-${currentImage?.source?.uri || currentIndex}`}
                style={styles.gallery}
                images={images}
                initialPage={currentIndex}
                onPageSelected={(index: number) => {
                  setCurrentIndex(index);
                  setRotation(0);
                }}
              />
            </View>
          )}

          {/* Quick Left/Right Overlay Arrows for Instant Switching */}
          {images.length > 1 && currentIndex > 0 ? (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowLeft]}
              onPress={handlePrevious}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Text style={styles.navArrowText}>‹</Text>
            </TouchableOpacity>
          ) : null}

          {images.length > 1 && currentIndex < images.length - 1 ? (
            <TouchableOpacity
              style={[styles.navArrow, styles.navArrowRight]}
              onPress={handleNext}
              hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}>
              <Text style={styles.navArrowText}>›</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Info Details Modal */}
        <Modal
          visible={showInfo}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInfo(false)}>
          <View style={styles.infoModalOverlay}>
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardTitle}>
                  {isVideo ? 'Video Information' : 'Photo Information'}
                </Text>
                <TouchableOpacity onPress={() => setShowInfo(false)}>
                  <Text style={styles.infoCardClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.infoScroll}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Filename</Text>
                  <Text style={styles.infoVal}>
                    {currentImage?.filename || 'Media item'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Date Taken</Text>
                  <Text style={styles.infoVal}>
                    {formatDate(currentImage?.timestamp)}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>File Size</Text>
                  <Text style={styles.infoVal}>
                    {formatFileSize(currentImage?.fileSize)}
                  </Text>
                </View>

                {currentImage?.width && currentImage?.height ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoField}>Resolution</Text>
                    <Text style={styles.infoVal}>
                      {currentImage.width} × {currentImage.height} px
                    </Text>
                  </View>
                ) : null}

                {currentImage?.playableDuration ? (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoField}>Duration</Text>
                    <Text style={styles.infoVal}>
                      {formatDuration(currentImage.playableDuration)} (
                      {Math.round(currentImage.playableDuration)}s)
                    </Text>
                  </View>
                ) : null}

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Format</Text>
                  <Text style={styles.infoVal}>
                    {isVideo ? 'Video (Media)' : currentImage?.type || 'Image'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoField}>Location</Text>
                  <Text
                    style={[styles.infoVal, styles.uriText]}
                    numberOfLines={2}>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(11, 15, 25, 0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    zIndex: 10,
  },
  counterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  videoIndicatorPill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoIndicatorText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  closeBtnText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  actionEmoji: {
    fontSize: 16,
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  galleryWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gallery: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoCardWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoPoster: {
    width: '100%',
    height: '100%',
  },
  videoPlayOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  videoPlayCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(2, 132, 199, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  videoPlayTriangle: {
    color: '#ffffff',
    fontSize: 32,
    marginLeft: 4,
  },
  videoPlayBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  videoPlayText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  navArrow: {
    position: 'absolute',
    top: '48%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 5,
  },
  navArrowLeft: {
    left: 12,
  },
  navArrowRight: {
    right: 12,
  },
  navArrowText: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '65%',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  infoCardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  infoCardClose: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '600',
    padding: 4,
  },
  infoScroll: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e293b',
  },
  infoField: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    width: '32%',
  },
  infoVal: {
    color: '#f1f5f9',
    fontSize: 14,
    fontWeight: '600',
    width: '65%',
    textAlign: 'right',
  },
  uriText: {
    fontSize: 11,
    color: '#64748b',
  },
});

export default FullImageModal;
