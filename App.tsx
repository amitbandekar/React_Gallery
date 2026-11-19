import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import GalleryImageLoader from './Components/Home';
import NoiseRemover from './Components/noiseremover';
import BgRemover from './Components/Bgremover';
import Login from './Components/SignIn';
import Signup from './Components/Signup';
import ProfileDetail from './Components/Profile';
import HomeIcon from './icons/Home.svg';
import ProfileIcon from './icons/profile.svg';
import FireIcon from './icons/fire.svg';
import BgRemoverIcon from './icons/bgremovericon.svg';
import AIIcon from './icons/generativeAi.svg';
import AI from './Components/AI';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const renderHomeIcon = () => <HomeIcon width={20} height={20} color="black" />;
const renderMagicIcon = () => <FireIcon width={20} height={20} color="black" />;
const renderBgIcon = () => (
  <BgRemoverIcon width={20} height={20} color="black" />
);
const renderAIIcon = () => <AIIcon width={20} height={20} color="black" />;
const renderProfileIcon = () => (
  <ProfileIcon width={20} height={20} color="black" />
);

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#272640',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={GalleryImageLoader}
        options={{
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tab.Screen
        name="Magic"
        component={NoiseRemover}
        options={{
          tabBarLabel: 'Magic',
          headerShown: false,
          tabBarIcon: renderMagicIcon,
        }}
      />
      <Tab.Screen
        name="BgRemover"
        component={BgRemover}
        options={{
          tabBarLabel: 'BgRemover',
          headerShown: false,
          tabBarIcon: renderBgIcon,
        }}
      />
      <Tab.Screen
        name="Generative AI"
        component={AI}
        options={{
          tabBarLabel: 'AI',
          headerShown: false,
          tabBarIcon: renderAIIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileDetail}
        options={{
          tabBarLabel: 'Profile',
          headerShown: false,
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
}

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen
            name="HomeScreen"
            options={{headerShown: false}}
            component={TabNavigator}
          />
          <Stack.Screen
            name="Signup"
            options={{headerShown: false}}
            component={Signup}
          />
          <Stack.Screen
            name="SignIn"
            options={{headerShown: false}}
            component={Login}
          />
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
