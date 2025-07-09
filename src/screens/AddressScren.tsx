import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAccount } from '../../hook/useAccount';
import PrimaryButton from '../../components/PrimaryButton';

const AddressScreen = () => {
    const [isPressed,setIsPressed] = React.useState<boolean>(false)
  const { account } = useAccount();
  const address = account.publicAddress || '';

    const copyAddress = () => {
        if (isPressed) return
      setIsPressed(true)
    Clipboard.setString(address);
       
        setTimeout(() => {
            setIsPressed(false)
            
        }, 3000)
        
      
  };

  return (
    <View style={styles.container}>
    <View style={styles.qrContainer}>
      <Text style={styles.title}>Wallet Address</Text>
      <QRCode value={address} size={250} />
      <Text style={styles.address}>{address.slice(0,10)}...{address.slice(-5)}</Text>
      <TouchableOpacity style={styles.copyButton} onPress={copyAddress}>
        <Text style={styles.copyText}>Copy Address</Text>
      </TouchableOpacity>
    </View>
  
    {isPressed && (
  <View style={styles.toast}>
    <Text style={styles.toastText}>✔️ Copied to clipboard</Text>
  </View>
)}
  </View>
  
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 60,
      backgroundColor: '#fff',
    },
    qrContainer: {
      alignItems: 'center',
     
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 20,
    },
    address: {
      fontSize: 14,
      color: '#333',
      textAlign: 'center',
      marginTop: 16,
    },
    copyButton: {
      marginTop: 12,
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 8,
      width: '50%',
      alignItems: 'center',
    },
    copyText: {
      color: '#fff',
      fontWeight: '600',
    },
    popup_button: {
      backgroundColor: 'green',
    },
    toast: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#4BB543',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
      },
      toastText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
      },
      
  });
  