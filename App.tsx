import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
} from 'react-native';
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

const windowWidth = Dimensions.get('window').width;

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <View style={styles.splashContent}>
      <View style={styles.splashIconWrapper}>
        <Image
          source={require('./icons/app_icon_1024.png')}
          style={styles.splashIcon}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.splashTitle}>Gallery</Text>
      <Text style={styles.splashSubtitle}>Smart Photo & Video Studio</Text>

      <View style={styles.splashBadges}>
        <Text style={styles.splashBadge}>✨ Generative AI</Text>
        <Text style={styles.splashBadge}>🪄 Magic Denoise</Text>
        <Text style={styles.splashBadge}>🔒 Private Vault</Text>
      </View>

      <View style={styles.splashLoaderWrapper}>
        <ActivityIndicator size="small" color="#38bdf8" />
        <Text style={styles.splashLoadingText}>Starting Studio...</Text>
      </View>
    </View>
  </View>
);

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
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
  splashContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  splashIconWrapper: {
    width: windowWidth * 0.32,
    height: windowWidth * 0.32,
    maxWidth: 130,
    maxHeight: 130,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#38bdf8',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 20,
  },
  splashIcon: {
    width: '100%',
    height: '100%',
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 6,
  },
  splashSubtitle: {
    fontSize: 15,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 24,
  },
  splashBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 36,
  },
  splashBadge: {
    fontSize: 12,
    color: '#cbd5e1',
    backgroundColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  splashLoaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  splashLoadingText: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
  },
});

export default App;
