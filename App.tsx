import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Header } from '@rneui/themed';
import GalleryImageLoader from './Components/Home';
import NoiseRemover from './Components/noiseremover';

const App = () => {
  const [loading, setLoading] = useState(true);
  const Tab = createBottomTabNavigator();

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
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',

  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
