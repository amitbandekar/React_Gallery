import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity, Modal} from 'react-native';
import Gallery from 'react-native-image-gallery';
import {ImageDTO} from './UseGallery';

interface FullImageModalProps {
  visible: boolean;
  images: ImageDTO[];
  initialIndex?: number;
  onClose: () => void;
  onDelete?: (index: number) => void;
}

const FullImageModal: React.FC<FullImageModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
  onDelete,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.btnText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.counterText}>
            {images.length > 0 ? `${currentIndex + 1} / ${images.length}` : ''}
          </Text>
          {onDelete ? (
            <TouchableOpacity
              onPress={() => onDelete(currentIndex)}
              style={styles.headerBtn}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.headerBtn} />
          )}
        </View>

        <Gallery
          style={styles.gallery}
          images={images}
          initialPage={initialIndex}
          onPageSelected={(index: number) => setCurrentIndex(index)}
        />
      </View>
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
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 10,
  },
  headerBtn: {
    padding: 8,
    minWidth: 60,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteText: {
    color: '#ff4d4d',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  counterText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  gallery: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default FullImageModal;
