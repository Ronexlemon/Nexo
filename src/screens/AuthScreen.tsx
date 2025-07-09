import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUserPin } from '../../utills/storage';
import { useAccount } from '../../hook/useAccount';

const AuthScreen = () => {
    const navigation = useNavigation<any>();
    
  const { account } = useAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const pin = await getUserPin();

      if (account?.publicAddress && pin) {
        // Redirect to UnlockScreen for verification
        navigation.replace('UnlockScreen', {
          nextScreen: 'Details',
        });
      } else {
        // If no wallet is set, redirect to create pin/setup screen
        navigation.replace('pin');
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.text}>Authenticating...</Text>
    </View>
  );
};

export default AuthScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#444',
  },
});
