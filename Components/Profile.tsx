import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomHeader from './CustomHeader';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation ,NavigationProp, useIsFocused } from '@react-navigation/native'; // Import the necessary functions from React Navigation
import LogOutIcon from '../icons/Logout.svg';


const ProfileDetail = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<Record<string, object>>>();

  interface UserData {
    Name: string;
    Email: string;
    // Define other properties as needed
  }
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = useCallback(async () => {
    const session = await EncryptedStorage.getItem("user_session");
    if (session !== null) {
      const UserData = JSON.parse(session);
      setUserData(UserData);
    } else {
      setUserData(null);
      navigation.navigate({ name: 'SignIn', params: {} });
    }
  }, [navigation]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused, fetchUserData]);

  const Logout = async () => {
    await EncryptedStorage.clear();
    navigation.navigate({ name: 'SignIn', params: {} });
  };


  
  return (
    
    <View style={styles.headercontainer}>
    <CustomHeader title="Profile" />
    <View style={styles.container}>
      <View></View>
      <View style={styles.body}>
        
        <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
            {userData  ? userData.Name.split(' ').map(name => name[0].toUpperCase()).join('') : "RS"}
            </Text>
        </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>
              {userData ? userData.Name : "Rohit Sharma"}
            </Text>
          </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoText}>
              {userData ? userData.Email : "sharmarohit264@email.com"}
            </Text>
        </View>
        <View style={[styles.infoContainer, { marginBottom: 20 }]}>
          <Text style={styles.infoLabel}>Location:</Text>
          <Text style={styles.infoText}>Mumbai</Text>
        </View>
        <LogOutIcon height={40} width={40} onPress={Logout} color={'black'}  />
      </View>
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
    backgroundColor: '#BDE0FE',
  },
  body: {
    marginTop:120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#669BBC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowRadius: 6,
    shadowOpacity: 0.16,
  },
  avatar: {
    fontSize: 72,
    fontWeight: '700',
    color:'#ffbe0b'
  },
  nameContainer: {
    marginTop: 24,
    alignItems: 'center',
    color:'black',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color:'#fb8500',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003049',
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    color:'#003049',
  },
  LogOutIcon: {
    color:'black'
  },
  
});

export default ProfileDetail;
