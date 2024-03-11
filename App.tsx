import React, { Component, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createStackNavigator} from '@react-navigation/stack';
import { Header } from '@rneui/themed';
import GalleryImageLoader from './Components/Home';
import NoiseRemover from './Components/noiseremover';
import Login from './Components/SignIn';
import Signup from './Components/Signup';
import ForgotPassword from './Components/ForgotPassword';

const App = () => {
  const [loading, setLoading] = useState(true);
  const Tab = createBottomTabNavigator();
  const Stack = createStackNavigator();

  // Simulate loading delay
  setTimeout(() => {
    setLoading(false);
  }, 2000); // Adjust the delay time as needed

  return (
    <View style={styles.container}>
      <Header
        backgroundColor="grey"
        centerComponent={{
          text: "Photos",
          style: { color: "#fff" }
        }}
        placement="center"
      />
      <NavigationContainer>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
          </View>
        ) : (
          <Tab.Navigator>
            <Tab.Screen 
            name="Home" 
            component={GalleryImageLoader} 
            options={{ headerShown: false }} />
            <Tab.Screen 
            name="Magic" 
            component={NoiseRemover} 
            options={{ headerShown: false }} />
            <Tab.Screen 
            name="SignIn" 
            component={Login} 
            options={{ headerShown: false }} />
            <Tab.Screen 
            name="SignUp" 
            component={Signup} 
            options={{ headerShown: false }} />
          </Tab.Navigator>
          
        )}
        <Stack.Navigator>
      <Stack.Screen name='Signup' options={{headerShown:false}} component={Signup}/>
      <Stack.Screen name='SignIn' options={{headerShown:false}} component={Login}/>
      <Stack.Screen name='ForgotPassword' options={{headerShown:false}} component={ForgotPassword}/>
      </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
