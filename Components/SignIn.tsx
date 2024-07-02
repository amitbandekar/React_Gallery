import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Button,
  Modal,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import CustomHeader from './CustomHeader';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigation = useNavigation<NavigationProp<Record<string, object>>>();
  const showAlert = (viewId: string) => Alert.alert('Alert', 'Button pressed ' + viewId);
  const [modalVisible, setModalVisible] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');

  useEffect(() => {
    if (modalVisible) {
      const timer = setTimeout(() => {
        setModalVisible(false);
      }, 1500); // Hide modal after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [modalVisible]);

  const handleLogin = async () => {
    if (!email) {
      Alert.alert('Please Enter email.');
      return;
    }else if (!password) {
      Alert.alert('Please Enter password.');
      return;
    }
     else {
      try {
        const response = await fetch('https://amitbandekar.pythonanywhere.com/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password,
          }),
        });

        const data = await response.json();
        
        console.log(data)
        console.log(data.success)
        if (data.success) {
          // Display alert for successful login
          Alert.alert("Login Successful", String(data.message));
          await EncryptedStorage.setItem(
            "user_session",
            JSON.stringify({
                Id : String(data.Id),
                Name : String(data.Name),
                Email : String(data.Email),
            })
        );
        const session = await EncryptedStorage.getItem("user_session");
        navigation.navigate({ name: 'Profile', params: {} });

        console.log(session);
        } else {
          // Display alert for failed login
          Alert.alert("Login Failed", String(data.message));
        }
      } catch (error) {
        console.log('Login error:', error);
        Alert.alert('Error', 'Login failed. Please try again.');
      }
    }

  };

  return (


    <View style={styles.headercontainer}>
      <CustomHeader title="Sign In" />
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{ uri: 'https://img.icons8.com/ios-filled/512/circled-envelope.png' }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Email"
            keyboardType="email-address"
            placeholderTextColor="black"
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
            placeholderTextColor="black"
            secureTextEntry={true}
            underlineColorAndroid="transparent"
            onChangeText={(text) => setPassword(text)}
          />
        </View>

        <TouchableOpacity
          style={[styles.buttonContainer, styles.loginButton]}
          onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => navigation.navigate({ name: 'Signup', params: {} })}
          >
          <Text>Sign up</Text>
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
  loginButton: {
    backgroundColor: '#00b5ec',
  },
  loginText: {
    color: 'white',
  },
});


export default Login;
