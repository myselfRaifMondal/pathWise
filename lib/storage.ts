import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Two stores with the same shape.
 *
 * `secure` holds auth tokens. On native that is the Keychain / Keystore via
 * expo-secure-store; SecureStore has no web implementation, so the web build
 * falls back to AsyncStorage (localStorage). That is the same exposure a normal
 * web app has, and it never affects the native builds.
 *
 * `plain` holds non-sensitive preferences such as the theme override.
 */

const isWeb = Platform.OS === 'web';

export const secure = {
  async get(key: string) {
    if (isWeb) return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (isWeb) return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  async remove(key: string) {
    if (isWeb) return AsyncStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  },
};

export const plain = {
  get: (key: string) => AsyncStorage.getItem(key),
  set: (key: string, value: string) => AsyncStorage.setItem(key, value),
  remove: (key: string) => AsyncStorage.removeItem(key),
};
