import React, { Component, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import GalleryImageLoader from './Components/Home';
import NoiseRemover from './Components/noiseremover';
import BgRemover from './Components/Bgremover';
import Login from './Components/SignIn';
import Signup from './Components/Signup';
import ProfileDetail from './Components/Profile';
import CustomHeader from './Components/CustomHeader';
import Home from './icons/Home.svg';
import Profile from './icons/profile.svg';
import Fire from './icons/fire.svg';
import BgRemoverIcon from './icons/bgremovericon.svg';
import AI from './icons/generativeAi.svg';
//import { BeakerIcon } from '@heroicons/react/outline'



const App = () => {
  const [loading, setLoading] = useState(true);
  const Stack = createStackNavigator();

  // Simulate loading delay
  setTimeout(() => {
    setLoading(false);
  }, 2000); // Adjust the delay time as needed

  return (
    <View style={styles.container}>
      <NavigationContainer>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
          </View>
        ) : (
          <Stack.Navigator>
            <Stack.Screen name="HomeScreen" options={{ headerShown: false }} component={TabNavigator} />

            <Stack.Screen name='Signup' options={{ headerShown: false }} component={Signup} />
            <Stack.Screen name='SignIn' options={{ headerShown: false }} component={Login} />
          </Stack.Navigator>
        )}

      </NavigationContainer>

    </View>
  );

};

export function TabNavigator() {
  const Tab = createBottomTabNavigator();
  return (

    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={GalleryImageLoader}
        options={{
          tabBarLabel: '',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Home width={20} height={30} color={'black'} />
          ),
        }} />
      <Tab.Screen
        name="Magic"
        component={NoiseRemover}
        options={{
          tabBarLabel: '',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Fire width={20} height={30} color={'black'} />
          ),
        }} />
      {/* <Tab.Screen
              name="Bgremover"
              component={BgRemover}
              options={{
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <Fire width={20} height={30} color={'black'} />
                  ),
              }} /> */}
      <Tab.Screen
        name="BgRemover"
        component={BgRemover}
        options={{
          tabBarLabel: '',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <BgRemoverIcon width={20} height={30} color={'black'} />
          ),
        }} />
      <Tab.Screen
        name="Generative AI"
        component={AI}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <AI width={20} height={30} color={'black'} />
          ),
        }} />
      <Tab.Screen
        name="Profile"
        component={ProfileDetail}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ({ color, size }) => (
            <Profile width={20} height={30} color={'black'} />
          ),
        }} />
    </Tab.Navigator>
  )
}

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
