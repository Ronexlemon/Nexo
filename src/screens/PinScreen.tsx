import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomKeyboard } from '../../components/keyboard';
import { useNavigation } from '@react-navigation/native';
import PrimaryButton from '../../components/PrimaryButton';
import { useAccount } from '../../hook/useAccount';
import { useWallet } from '../../hook/useWallet';
import { storeUserPin } from '../../utills/storage';

const PinScreen = () => {
  const [step, setStep] = React.useState<'enter' | 'confirm'>('enter');
  const [firstPin, setFirstPin] = React.useState('');
  const [value, setValue] = React.useState('');
  const [pinError, setPinError] = React.useState('');
  const [isPinConfirmed, setIsPinConfirmed] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const navigation = useNavigation<any>();
  const { create, setAccountPin, setAccountMnemonic } = useAccount();
  const { createWallet } = useWallet();

  const createAccount = async () => {
    try {
      setLoading(true);

      const { mnemonic, account } = createWallet(); // get values directly
      const address = account?.address;

      if (mnemonic && address) {
        // Save to global state
        create({
          mnemonic,
          pin: firstPin,
          publicAddress: address,
          name: 'lemon',
        });

        setAccountPin(firstPin);
        setAccountMnemonic(mnemonic);
        await storeUserPin(firstPin);

        navigation.navigate('Details');
      } else {
        setPinError('Failed to create wallet. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setPinError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'X') {
      setValue((prev) => prev.slice(0, -1));
      return;
    }

    setPinError('');
    setIsPinConfirmed(false); // Reset confirmation if new input starts
    const newValue = value + key;
    setValue(newValue);

    if (newValue.length === 4) {
      if (step === 'enter') {
        setFirstPin(newValue);
        setValue('');
        setStep('confirm');
      } else {
        if (newValue === firstPin) {
          setIsPinConfirmed(true);
        } else {
          setPinError('PINs do not match. Please try again.');
          setValue('');
          setStep('enter');
          setFirstPin('');
        }
      }
    }
  };

  const handleNext = async () => {
    if (isPinConfirmed && !loading) {
      await createAccount();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.title_text}>
        <Text style={styles.title}>
          {step === 'enter' ? 'Enter PIN' : 'Confirm PIN'}
        </Text>
        {pinError !== '' && <Text style={styles.errorText}>{pinError}</Text>}
      </View>

      <View style={styles.number}>
        <Text style={styles.display_amount}>{'*'.repeat(value.length)}</Text>
        <CustomKeyboard onKeyPress={handleKeyPress} />
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          title={loading ? 'Creating...' : 'Next'}
          onPress={handleNext}
          disabled={!isPinConfirmed || loading}
        />
      </View>
    </View>
  );
};

export default PinScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title_text: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 14,
  },
  number: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  display_amount: {
    fontSize: 28,
    marginBottom: 20,
    letterSpacing: 10,
  },
  buttonContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
});
