import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CustomKeyboard } from '../../components/keyboard';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import PrimaryButton from '../../components/PrimaryButton';
import { getUserPin } from '../../utills/storage';
import { RootStackParamList } from '../../types';


// type UnlockRouteProp = RouteProp<{ params: { nextScreen: string } }, 'params'>;
type UnlockRouteProp = RouteProp<RootStackParamList, 'UnlockScreen'>;

const UnlockScreen = () => {
  const [value, setValue] = React.useState('');
  const [pinError, setPinError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const navigation = useNavigation<any>();
  const route = useRoute<UnlockRouteProp>();
  const nextScreen = route.params?.nextScreen || 'Wallet'; 

  const handleKeyPress = (key: string) => {
    if (key === 'X') {
      setValue((prev) => prev.slice(0, -1));
      return;
    }

    setPinError('');
    const newValue = value + key;
    setValue(newValue);

    if (newValue.length === 4) {
      verifyPin(newValue);
    }
  };

  const verifyPin = async (enteredPin: string) => {
    try {
      setLoading(true);
      const storedPin = await getUserPin();

      if (enteredPin === storedPin) {
        navigation.replace(nextScreen);
      } else {
        setPinError('Incorrect PIN. Try again.');
        setValue('');
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setPinError('Something went wrong. Try again.');
      setValue('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.title_text}>
        <Text style={styles.title}>Enter PIN</Text>
        {pinError !== '' && <Text style={styles.errorText}>{pinError}</Text>}
      </View>

      <View style={styles.number}>
        <Text style={styles.display_amount}>{'*'.repeat(value.length)}</Text>
        <CustomKeyboard onKeyPress={handleKeyPress} />
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={loading ? 'Verifying...' : 'Unlock'}
          onPress={() => verifyPin(value)}
          disabled={value.length < 4 || loading}
        />
      </View>
    </View>
  );
};

export default UnlockScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingTop: 60,
    },
    title_text: {
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    errorText: {
      color: 'red',
      fontSize: 14,
      marginTop: 10,
    },
    number: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    display_amount: {
      fontSize: 32,
      fontWeight: '600',
      letterSpacing: 12,
      marginBottom: 30,
      color: '#222',
    },
    buttonContainer: {
      paddingBottom: 40,
      paddingHorizontal: 20,
    },
  });
  