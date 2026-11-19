import EncryptedStorage from 'react-native-encrypted-storage';

const FAVORITES_KEY = 'gallery_user_favorites';

export const getFavorites = async (): Promise<string[]> => {
  try {
    const raw = await EncryptedStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to load favorites:', error);
    return [];
  }
};

export const toggleFavorite = async (uri: string): Promise<boolean> => {
  try {
    const current = await getFavorites();
    const exists = current.includes(uri);
    let updated: string[];
    if (exists) {
      updated = current.filter(item => item !== uri);
    } else {
      updated = [...current, uri];
    }
    await EncryptedStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return !exists;
  } catch (error) {
    console.warn('Failed to toggle favorite:', error);
    return false;
  }
};

export const isFavorite = async (uri: string): Promise<boolean> => {
  try {
    const current = await getFavorites();
    return current.includes(uri);
  } catch {
    return false;
  }
};
