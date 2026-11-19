import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import CustomHeader from './CustomHeader';
import {API_BASE_URL, REMOTE_API_URL} from './config';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<Record<string, any>>>();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Notice', 'Please enter your email or username.');
      return;
    }
    if (!password) {
      Alert.alert('Notice', 'Please enter your password.');
      return;
    }

    setLoading(true);

    const tryLogin = async (baseUrl: string) => {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          username: email.trim(),
          password,
        }),
      });
      return response.json();
    };

    try {
      let data;
      try {
        data = await tryLogin(API_BASE_URL);
      } catch (e) {
        // Fallback to remote backend
        data = await tryLogin(REMOTE_API_URL);
      }

      if (data && data.success) {
        Alert.alert('Success', data.message || 'Login Successful');
        await EncryptedStorage.setItem(
          'user_session',
          JSON.stringify({
            Id: String(data.Id || ''),
            Name: String(data.Name || email),
            Email: String(data.Email || email),
          }),
        );
        navigation.navigate('HomeScreen', {screen: 'Profile'});
      } else {
        Alert.alert('Login Failed', data?.message || 'Invalid credentials');
      }
    } catch (error) {
      console.warn('Login error:', error);
      Alert.alert(
        'Error',
        'Could not connect to authentication server. Please check your network or ensure backend is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.headercontainer}>
      <CustomHeader title="Sign In" />
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/512/circled-envelope.png',
            }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Email or Username"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
            underlineColorAndroid="transparent"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{uri: 'https://img.icons8.com/ios-glyphs/512/key.png'}}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!passwordVisible}
            underlineColorAndroid="transparent"
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}>
            <Text style={styles.eyeText}>{passwordVisible ? '👁' : '🙈'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.buttonContainer, styles.loginButton]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonContainer, styles.secondaryButton]}
          onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.secondaryText}>
            Don't have an account? Sign up
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.homeLinkText}>← Back to Gallery</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC8DD',
    borderRadius: 30,
    width: 280,
    height: 48,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  inputs: {
    height: 48,
    marginLeft: 10,
    flex: 1,
    color: '#000',
  },
  inputIcon: {
    width: 24,
    height: 24,
  },
  eyeIcon: {
    padding: 6,
  },
  eyeText: {
    fontSize: 18,
  },
  buttonContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    width: 280,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: '#00b5ec',
  },
  loginText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  secondaryText: {
    color: '#272640',
    fontWeight: '600',
  },
  homeLink: {
    marginTop: 10,
    padding: 10,
  },
  homeLinkText: {
    color: '#272640',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Login;
