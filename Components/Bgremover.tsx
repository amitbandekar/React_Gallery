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
const windowWidth = Dimensions.get('window').width;


const NoiseRemover: React.FC = () => {
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
    // try {
    //   const data = new FormData();
    //   const respo = await fetch(fileUri);
    //   const imageBuffer = await respo.arrayBuffer();
    //   data.append('file', imageBuffer);
    //   const response = await axios.request({
    //     method: 'POST',
    //     url: 'https://ai-remove-image-background.p.rapidapi.com/',
    //     headers: {
    //       'X-RapidAPI-Key': '975ae4bc26msh15f5a8eb67bbe6fp1814d1jsn233b906f81da',
    //       'X-RapidAPI-Host': 'ai-remove-image-background.p.rapidapi.com',
    //       'Content-Type': 'multipart/form-data',
    //       Accept: 'application/octet-stream',
    //       responseType: 'arraybuffer', // This ensures the response is treated as binary data
    //     },
    //     data: data
    //   });
    //   console.log(response);
    //   // Convert the binary data to base64
    //   const base64Data = Buffer.from(response.data, 'binary').toString('base64');
    //   setImageUri('data:image/jpeg;base64,' + Buffer.from(base64Data).toString('base64'));
    // } catch (error) {
    //   console.error(error);
    //   Alert.alert('Error', 'Failed to process image.');
    // }
    Alert.alert("Your account has no remaining credits.")
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

export default NoiseRemover;
