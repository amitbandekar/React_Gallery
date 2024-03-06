import React from 'react';
import { Modal, View, Image, StyleSheet, Dimensions, TouchableOpacity,Text } from 'react-native';
import { Header } from '@rneui/themed'; 
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface FullImageModalProps {
  uri: string | null;
  onClose: () => void;
}

const FullImageModal: React.FC<FullImageModalProps> = ({ uri, onClose }) => {
  return (
    <Modal visible={!!uri}  onRequestClose={onClose}>
      <Header
        backgroundColor="grey"
        centerComponent={{
          text: "Photos",
          style: { color: "#fff" }
        }}
        leftComponent={{ icon: "menu", color: "#fff" }}
        placement="center"
      />
      <View className="bg-slate-50"style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
        {uri && <Image style={styles.fullImage} source={{ uri: uri }} />}
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').height - 40,
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default FullImageModal;
