import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const SettingsScreen = ({ navigation }: any) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [testInput, setTestInput] = useState('');

  const handleLoad = () => {
    console.log('Loading test data:', testInput);
    setModalVisible(false); 
    navigation.navigate("MoveScreen", { dappUrl: testInput }); 
  };

  return (
    <View style={styles.container}>
      {/* Wallet Address Link */}
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AddressScreen')}>
        <View style={styles.iconWrap}>
          <Icon name="address-card" size={20} color="#007bff" />
        </View>
        <Text style={styles.label}>Wallet Address</Text>
        <Icon name="chevron-right" size={18} color="gray" />
      </TouchableOpacity>

      {/* Recovery Phrase Link */}
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('UnlockScreen', { nextScreen: 'RecoveryPhraseScreen' })}
      >
        <View style={styles.iconWrap}>
          <Icon name="key" size={20} color="#007bff" />
        </View>
        <Text style={styles.label}>Recovery Phrase</Text>
        <Icon name="chevron-right" size={18} color="gray" />
      </TouchableOpacity>

      {/* Load Test */}
      <TouchableOpacity style={styles.item} onPress={() => setModalVisible(true)}>
        <View style={styles.iconWrap}>
          <Icon name="flask" size={20} color="#28a745" />
        </View>
        <Text style={styles.label}>Load Test</Text>
        {/* <Icon name="chevron-forward-outline" size={18} color="gray" /> */}
      </TouchableOpacity>

      {/* Modal for Load Test */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Test Link</Text>
            <TextInput
              value={testInput}
              onChangeText={setTestInput}
              style={styles.input}
              placeholder="Type something..."
            />
            <Button title="Load" onPress={handleLoad} />
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Text style={{ color: '#007bff', marginTop: 10 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderRadius: 6,
  },
  closeBtn: {
    alignItems: 'center',
    marginTop: 10,
  },

});
