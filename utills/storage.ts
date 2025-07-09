import AsyncStorage from '@react-native-async-storage/async-storage';

export const USER_PIN_KEY = 'USER_PIN';

export const storeUserPin = async (pin: string) => {
  try {
    await AsyncStorage.setItem(USER_PIN_KEY, pin);
  } catch (error) {
    console.error('Failed to store PIN:', error);
  }
};

export const getUserPin = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_PIN_KEY);
  } catch (error) {
    console.error('Failed to retrieve PIN:', error);
    return null;
  }
};

export const clearUserPin = async () => {
  try {
    await AsyncStorage.removeItem(USER_PIN_KEY);
  } catch (error) {
    console.error('Failed to clear PIN:', error);
  }
};
