import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      {/* <Text style={styles.header}>Wallet Settings</Text> */}

      {/* Wallet Address Link */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AddressScreen')}>
        <View style={styles.iconWrap}>
          <Icon name="wallet-outline" size={20} color="#007bff" />
        </View>
        <Text style={styles.label}>Wallet Address</Text>
        <Icon name="chevron-forward-outline" size={18} color="gray" />
      </TouchableOpacity>

      {/* Recovery Phrase Link */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('UnlockScreen', { nextScreen: 'RecoveryPhraseScreen' })}>
        <View style={styles.iconWrap}>
          <Icon name="key-outline" size={20} color="#007bff" />
        </View>
        <Text style={styles.label}>Recovery Phrase</Text>
        <Icon name="chevron-forward-outline" size={18} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e7f0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
