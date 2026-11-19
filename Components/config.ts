import {Platform} from 'react-native';

export const LOCAL_API_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

export const REMOTE_API_URL = 'https://amitbandekar.pythonanywhere.com';

export const API_BASE_URL = LOCAL_API_URL;
