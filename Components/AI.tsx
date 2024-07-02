import React, { useState } from 'react';
import { View,Text, Button, Image, Alert,Dimensions,StyleSheet  } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CameraIcon from '../icons/camera.svg';
import Upload from '../icons/upload.svg';
import Download from '../icons/Download.svg';
import CustomHeader from './CustomHeader';
import { blue } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';
import { TouchableOpacity } from 'react-native-gesture-handler';
import axios from 'axios';

interface CustomFile {
  uri: string;
  name: string;
  lastModified: number;
  type: string;
}
const YOUR_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const windowWidth = Dimensions.get('window').width;


const AI: React.FC = () => {
  const [imageUri, setImageUri] = useState<string | null>(null); // Adjusted type to string | null

  const handleCameraPress = () => {
    launchCamera({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && !response.error) {
        console.log(response);
        const fileUri: string = response.assets[0].uri; // Explicitly specify the type as string
        //uploadImage(fileUri);
        sendImage(fileUri);
      }
    });
  };


  const handleLibraryPress = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response: any) => {
      if (!response.didCancel && !response.error) {
        //console.log(uri);
        const uri = response.assets[0].uri ;
        const fileUri: string = response.assets[0].uri; // Explicitly specify the type as string
        sendImage(fileUri);
      }
    });
  };

  const sendImage = async (fileUri:string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: 'photo.jpg', // Or whatever name you want to give to the file
        type: 'image/jpeg', // Adjust the type according to your file
      });

      const response = await fetch('https://clipdrop-api.co/replace-background/v1', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response);
      const blob = await response.blob(); // Convert response to Blob

      const imageURL = URL.createObjectURL(blob);

      setImageUri(imageURL);
      Alert.alert("Your account has no remaining credits, you can buy more in your account page.");

    } catch (error) {
      console.error('Error:', error);

    }
  };


  return (

    <View style={styles.headercontainer}>
    <CustomHeader title="Noise Remover" />
    <View style={styles.container}>
      <View style={[styles.outercontainer]}>

          <Image
            // source={{ uri: imageUri }}
            source={imageUri ? { uri: imageUri } : require('../icons/bgremover.png')}
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

export default AI;
