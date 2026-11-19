import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import CustomHeader from './CustomHeader';
import EncryptedStorage from 'react-native-encrypted-storage';
import {
  useNavigation,
  NavigationProp,
  useIsFocused,
} from '@react-navigation/native';
import LogOutIcon from '../icons/Logout.svg';

interface UserData {
  Id?: string;
  Name: string;
  Email: string;
}

const ProfileDetail: React.FC = () => {
  const isFocused = useIsFocused();
  const navigation = useNavigation<NavigationProp<Record<string, any>>>();
  const [userData, setUserData] = useState<UserData | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const session = await EncryptedStorage.getItem('user_session');
      if (session) {
        const parsed: UserData = JSON.parse(session);
        setUserData(parsed);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.warn('Error reading session:', error);
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    if (isFocused) {
      fetchUserData();
    }
  }, [isFocused, fetchUserData]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await EncryptedStorage.clear();
            setUserData(null);
            navigation.navigate('SignIn');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const getInitials = (name?: string) => {
    if (!name) {
      return '?';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.headercontainer}>
      <CustomHeader title="Profile" />
      <View style={styles.container}>
        {userData ? (
          <View style={styles.body}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{getInitials(userData.Name)}</Text>
            </View>

            <View style={styles.nameContainer}>
              <Text style={styles.name}>{userData.Name}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoText}>{userData.Email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoBadge}>Active</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}>
              <LogOutIcon height={24} width={24} color="white" />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestBody}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>👤</Text>
            </View>
            <Text style={styles.guestTitle}>Welcome to Gallery App</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to sync your preferences and access personalized features.
            </Text>

            <TouchableOpacity
              style={styles.signInBtn}
              onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signUpBtn}
              onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signUpBtnText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        )}
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
    backgroundColor: '#BDE0FE',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#669BBC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
    shadowOpacity: 0.16,
    elevation: 4,
  },
  avatar: {
    fontSize: 48,
    fontWeight: '700',
    color: '#ffbe0b',
  },
  nameContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003049',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    marginBottom: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#003049',
    width: 70,
  },
  infoText: {
    fontSize: 16,
    color: '#003049',
    flex: 1,
  },
  infoBadge: {
    fontSize: 14,
    color: '#2a9d8f',
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e63946',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guestBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  guestAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestAvatarText: {
    fontSize: 48,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#003049',
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#457b9d',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  signInBtn: {
    backgroundColor: '#00b5ec',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    width: 220,
    alignItems: 'center',
    marginBottom: 12,
  },
  signInBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    width: 220,
    alignItems: 'center',
  },
  signUpBtnText: {
    color: '#272640',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileDetail;
