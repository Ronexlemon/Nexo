import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAccount } from '../../hook/useAccount';

const RecoveryPhraseScreen = () => {
    const [isPressed,setIsPressed] = React.useState<boolean>(false)
  const { account } = useAccount();
  const phrase = account.mnemonic || '';

  const copyPhrase = () => {
          if (isPressed) return
        setIsPressed(true)
      Clipboard.setString(phrase);
         
          setTimeout(() => {
              setIsPressed(false)
              
          }, 3000)
          
        
    };

  return (
      <View style={styles.container}>
          <View>
          <Text style={styles.title}>Recovery Phrase</Text>
      <Text style={styles.mnemonic}>{phrase}</Text>
      <TouchableOpacity style={styles.copyButton} onPress={copyPhrase}>
        <Text style={styles.copyText}>Copy Phrase</Text>
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

export default RecoveryPhraseScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  mnemonic: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, marginBottom: 20 },
  copyButton: { alignSelf: 'center', backgroundColor: '#007bff', padding: 10, borderRadius: 8 },
    copyText: { color: '#fff', fontWeight: '600' },
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
