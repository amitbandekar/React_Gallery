import EncryptedStorage from 'react-native-encrypted-storage';
import {ImageDTO} from './UseGallery';

const VAULT_PASS_KEY = 'gallery_vault_pass_hash';
const VAULT_ITEMS_KEY = 'gallery_vault_hidden_items';

// Simple hashing function for PIN/password storage
const hashString = (input: string): string => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) % 1000000007;
  }
  return `vault_${hash}_${input.length}`;
};

export const isPasswordSet = async (): Promise<boolean> => {
  try {
    const stored = await EncryptedStorage.getItem(VAULT_PASS_KEY);
    return Boolean(stored && stored.length > 0);
  } catch (error) {
    console.warn('Failed to check vault password:', error);
    return false;
  }
};

export const setVaultPassword = async (password: string): Promise<boolean> => {
  try {
    if (!password || password.trim().length === 0) {
      return false;
    }
    const hashed = hashString(password.trim());
    await EncryptedStorage.setItem(VAULT_PASS_KEY, hashed);
    return true;
  } catch (error) {
    console.error('Failed to set vault password:', error);
    return false;
  }
};

export const verifyVaultPassword = async (
  password: string,
): Promise<boolean> => {
  try {
    const stored = await EncryptedStorage.getItem(VAULT_PASS_KEY);
    if (!stored) {
      return false;
    }
    return stored === hashString(password.trim());
  } catch (error) {
    console.error('Failed to verify vault password:', error);
    return false;
  }
};

export const getHiddenItems = async (): Promise<ImageDTO[]> => {
  try {
    const raw = await EncryptedStorage.getItem(VAULT_ITEMS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Failed to get hidden items:', error);
    return [];
  }
};

export const getHiddenUris = async (): Promise<string[]> => {
  const items = await getHiddenItems();
  return items.map(i => i.source.uri);
};

export const hideItems = async (items: ImageDTO[]): Promise<boolean> => {
  try {
    const current = await getHiddenItems();
    const currentUris = new Set(current.map(i => i.source.uri));
    const newItems = items.filter(i => !currentUris.has(i.source.uri));
    const updated = [...current, ...newItems];
    await EncryptedStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to hide items:', error);
    return false;
  }
};

export const hideItem = async (item: ImageDTO): Promise<boolean> => {
  return hideItems([item]);
};

export const unhideItems = async (uris: string[]): Promise<boolean> => {
  try {
    const current = await getHiddenItems();
    const uriSet = new Set(uris);
    const updated = current.filter(i => !uriSet.has(i.source.uri));
    await EncryptedStorage.setItem(VAULT_ITEMS_KEY, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to unhide items:', error);
    return false;
  }
};

export const unhideItem = async (uri: string): Promise<boolean> => {
  return unhideItems([uri]);
};
