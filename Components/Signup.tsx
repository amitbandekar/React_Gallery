import React, {useState} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
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
  ScrollView,
} from 'react-native';
import CustomHeader from './CustomHeader';
import {API_BASE_URL, REMOTE_API_URL} from './config';

const Signup: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [cnfpassword, setCnfPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [passwordcnfVisible, setPasswordcnfVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<Record<string, any>>>();

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert('Notice', 'Please enter your Name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Notice', 'Please enter your email');
      return;
    }
    if (!password) {
      Alert.alert('Notice', 'Please enter your password');
      return;
    }
    if (!cnfpassword) {
      Alert.alert('Notice', 'Please confirm your password');
      return;
    }
    if (cnfpassword !== password) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    const tryRegister = async (baseUrl: string) => {
      const response = await fetch(`${baseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      return response.json();
    };

    try {
      let data;
      try {
        data = await tryRegister(API_BASE_URL);
      } catch (e) {
        data = await tryRegister(REMOTE_API_URL);
      }

      if (data && data.success) {
        Alert.alert('Success', 'Account created successfully! Please log in.');
        navigation.navigate('SignIn');
      } else {
        Alert.alert('Registration Failed', data?.message || 'Signup failed');
      }
    } catch (error) {
      console.warn('Signup error:', error);
      Alert.alert(
        'Error',
        'Could not connect to registration server. Please check your network.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.headercontainer}>
      <CustomHeader title="Sign Up" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/512/user-male-circle.png',
            }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Full Name"
            placeholderTextColor="#666"
            underlineColorAndroid="transparent"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{
              uri: 'https://img.icons8.com/ios-filled/512/circled-envelope.png',
            }}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Email Address"
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

        <View style={styles.inputContainer}>
          <Image
            style={styles.inputIcon}
            source={{uri: 'https://img.icons8.com/ios-glyphs/512/key.png'}}
          />
          <TextInput
            style={styles.inputs}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            secureTextEntry={!passwordcnfVisible}
            underlineColorAndroid="transparent"
            value={cnfpassword}
            onChangeText={setCnfPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordcnfVisible(!passwordcnfVisible)}>
            <Text style={styles.eyeText}>
              {passwordcnfVisible ? '👁' : '🙈'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.buttonContainer, styles.signupButton]}
          onPress={handleSignup}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.signupText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonContainer, styles.secondaryButton]}
          onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.secondaryText}>
            Already have an account? Sign in
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeLink}
          onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.homeLinkText}>← Back to Gallery</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headercontainer: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  scrollContainer: {
    flexGrow: 1,
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
    marginBottom: 16,
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
  signupButton: {
    backgroundColor: '#00b5ec',
  },
  signupText: {
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

export default Signup;
