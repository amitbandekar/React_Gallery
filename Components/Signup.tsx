import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import CustomHeader from './CustomHeader';


const Signup: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [cnfpassword, setcnfPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const navigation = useNavigation();


  const showAlert = (viewId: string) => Alert.alert('Alert', 'Button pressed ' + viewId);

  const handleSignup = async () => {
    try {
      if (!name) {
        Alert.alert('Error', 'Please enter your Name');
        return;
      }
      if (!email) {
        Alert.alert('Error', 'Please enter your email');
        return;
      }
      if (!password) {
        Alert.alert('Error', 'Please enter your password');
        return;
      }
      if (!cnfpassword) {
        Alert.alert('Error', 'Please enter confirm password');
        return;
      }
      if (cnfpassword!=password) {
        Alert.alert('Error', 'Password Does not Match');
        return;
      }
      // Perform API call here to register the user
      // Example:
      // const response = await fetch('your_api_endpoint', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email,
      //     password,
//             name,
      //     cnfpassword,
      //   }),
      // });
      // const data = await response.json();
      // Handle response accordingly
      // Example:
      // if (data.success) {
      //   Alert.alert('Success', 'Signed up successfully');
      // } else {
      //   Alert.alert('Error', data.message || 'Signup failed');
      // }
      showAlert('signup');
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    
    <View style={styles.headercontainer}>
    <CustomHeader title="Sign Up" />
      <View style={styles.container}>
        
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{ uri: 'https://img.icons8.com/ios-filled/512/circled-envelope.png' }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Name"
            keyboardType="default"
            underlineColorAndroid="transparent"
            onChangeText={(text) => setName(text)}
          />
        </View>
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{ uri: 'https://img.icons8.com/ios-filled/512/circled-envelope.png' }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Email"
            keyboardType="email-address"
            underlineColorAndroid="transparent"
            onChangeText={(text) => setEmail(text)}
          />
        </View>


        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{ uri: 'https://img.icons8.com/ios-glyphs/512/key.png' }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            underlineColorAndroid="transparent"
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Image
              source={{
                uri: passwordVisible
                  ? 'https://img.icons8.com/ios/452/visible.png'
                  : 'https://img.icons8.com/material-outlined/452/invisible.png',
              }}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{ uri: 'https://img.icons8.com/ios-glyphs/512/key.png' }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Conifrm Password"
            secureTextEntry={!passwordVisible}
            underlineColorAndroid="transparent"
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Image
              source={{
                uri: passwordVisible
                  ? 'https://img.icons8.com/ios/452/visible.png'
                  : 'https://img.icons8.com/material-outlined/452/invisible.png',
              }}
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.buttonContainer, styles.signupButton]}
          onPress={handleSignup}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonContainer}
        // onPress={() => navigation.navigate('SignUp')}
        >
          <Text>Login</Text>
        </TouchableOpacity>
      </View>
      </View>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',

  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    color:'black',
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 250,
    borderRadius: 30,
  },
  signupButton: {
    backgroundColor: '#00b5ec',
  },
  signupText: {
    color: 'white',
  },
});

export default Signup;
