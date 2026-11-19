import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import GalleryImageLoader from './Components/Home';

const Stack = createStackNavigator();
const windowWidth = Dimensions.get('window').width;

const SplashScreen = () => (
  <View style={styles.splashContainer}>
    <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
    <View style={styles.splashContent}>
      <View style={styles.splashIconWrapper}>
        <Image
          source={require('./icons/app_icon_1024.png')}
          style={styles.splashIcon}
          resizeMode="cover"
        />
      </View>
      <Text style={styles.splashTitle}>Gallery</Text>
      <Text style={styles.splashSubtitle}>Photos & Videos</Text>

      <View style={styles.splashBadges}>
        <Text style={styles.splashBadge}>📸 Photos</Text>
        <Text style={styles.splashBadge}>🎬 Videos</Text>
        <Text style={styles.splashBadge}>📁 Albums</Text>
        <Text style={styles.splashBadge}>🔒 Vault</Text>
      </View>

      <View style={styles.splashLoaderWrapper}>
        <ActivityIndicator size="small" color="#38bdf8" />
        <Text style={styles.splashLoadingText}>Opening Gallery...</Text>
      </View>
    </View>
  </View>
);

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Gallery"
            options={{headerShown: false}}
            component={GalleryImageLoader}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#090d16',
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
    backgroundColor: '#131b2e',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
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
