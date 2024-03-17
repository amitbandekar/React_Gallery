import React, { useState } from 'react';
import { View,Text, Button, Image, Alert,Dimensions,StyleSheet  } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CameraIcon from '../icons/camera.svg';
import Upload from '../icons/upload.svg';
import Download from '../icons/Download.svg';
import CustomHeader from './CustomHeader';
import { blue } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface CustomFile {
  uri: string;
  name: string;
  lastModified: number;
  type: string;
}


const NoiseRemover: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleCameraPress = () => {
    launchCamera({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && !response.error) {
        console.log(response);
        const uri = response.assets[0].uri ;
        const file: CustomFile  = {
          uri: uri,
          type: 'image/jpeg',
          name: response.assets[0].fileName,
          lastModified: Date.now(), // Assuming you want to set the current timestamp
        };
      uploadImage(file);
      }
    });
  };
 

  const handleLibraryPress = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && !response.error) {
        //console.log(uri);
        const uri = response.assets[0].uri ;
        const file: CustomFile  = {
          uri: uri,
          type: 'image/jpeg',
          name: response.assets[0].fileName,
          lastModified: Date.now(), // Assuming you want to set the current timestamp
        };
      uploadImage(file);
      }
    });
  };

  const uploadImage = async (file: CustomFile ) => {
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await fetch('http://192.168.0.104:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log(data);
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to upload image');
    }
  };
  
  const windowWidth = Dimensions.get('window').width;



  return (
    
    <View style={styles.headercontainer}>
    <CustomHeader title="Noise Remover" />
    <View style={styles.container}>
      <View style={[styles.outercontainer]}>
       
          <Image
            // source={{ uri: imageUri }}
            source={require('../icons/bgremover.png')}
            style={{
              width: windowWidth/1.3,
              borderRadius:20 // 70% of the screen width
            }}
            resizeMode="contain"
          />
        
      </View>
      <View style={{ flex: 0.3, justifyContent: 'space-around', flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 20 ,paddingBottom:20}}>
        <CameraIcon height={40} width={40} onPress={handleCameraPress} color={'black'} />
        {/* <View style={{ width: 20 }} /> Gap between icons */}
        <Upload height={40} width={40} onPress={handleLibraryPress} color={'black'} />
        {/* <View style={{ width: 20 }} /> Gap between icons */}
        <Download height={40} width={40} onPress={handleCameraPress} color={'black'} />
      </View>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',

  },
  outercontainer: {
    flex: 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 110,
    backgroundColor:'red'

  }
  ,
  container: {
    flex: 1,
    backgroundColor: '#BDE0FE',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#6fffe9',
    backgroundColor: '#FFC8DD',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 20,
  },
});
export default NoiseRemover;
