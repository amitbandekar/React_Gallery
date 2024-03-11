import React, { useState } from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'; // Import ScrollView from gesture-handler
import {ImageDTO  } from './UseGallery';

interface ImageViewerProps {
  images: ImageDTO[];
  selectedIndex: number | null;
  onClose: () => void;
}

const FullImageModal: React.FC<ImageViewerProps> = ({ images, selectedIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  const handleSwipe = (event: { nativeEvent: { contentOffset: { x: number }; layoutMeasurement: { width: number } } }) => {
    const { nativeEvent } = event;
    const { contentOffset, layoutMeasurement } = nativeEvent;
    const index = Math.floor(contentOffset.x / layoutMeasurement.width);
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleSwipe}
        style={styles.scrollView}
      >
        {images.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: image.node.uri}} style={styles.image} />
          </View>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.prevButton} onPress={handlePrev}>
        <Text style={styles.buttonText}>{'<'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.buttonText}>{'>'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  scrollView: {
    flexDirection: 'row',
  },
  imageContainer: {
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 999,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  prevButton: {
    position: 'absolute',
    top: '50%',
    left: 20,
    zIndex: 999,
  },
  nextButton: {
    position: 'absolute',
    top: '50%',
    right: 20,
    zIndex: 999,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
  },
});

export default FullImageModal;
