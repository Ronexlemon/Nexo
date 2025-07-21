import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAccount } from '../hook/useAccount';
import { useDispatch } from 'react-redux';
import { fetchERC20TokenDetails } from '../lib/TokenDetails';
import { addToken } from '../store/tokenSlice';


interface TokenAddModalProps {
  visible: boolean;
  onClose: () => void;
}

const TokenAddModal: React.FC<TokenAddModalProps> = ({ visible, onClose }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const { account } = useAccount();
  const dispatch = useDispatch();

  const handleFetchToken = async () => {
    setLoading(true);
    setTokenData(null);

    try {
      const details = await fetchERC20TokenDetails(
        tokenAddress as `0x${string}`,
        account.publicAddress as `0x${string}`
      );
      setTokenData(details);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to fetch token details.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = () => {
    if (tokenData) {
      dispatch(addToken(tokenData));
      onClose();
      setTokenAddress('');
      setTokenData(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Token</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter ERC-20 Token Address"
            value={tokenAddress}
            onChangeText={setTokenAddress}
          />

          <TouchableOpacity style={styles.button} onPress={handleFetchToken} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Fetch Token</Text>}
          </TouchableOpacity>

          {tokenData && (
            <View style={styles.tokenDetails}>
              <Text>Name: {tokenData.name}</Text>
              <Text>Symbol: {tokenData.symbol}</Text>
              <Text>Decimals: {tokenData.decimals}</Text>
              <Text>Balance: {tokenData.balance}</Text>

              <TouchableOpacity style={[styles.button, { marginTop: 10 }]} onPress={handleAddToken}>
                <Text style={styles.buttonText}>Add to Wallet</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={{ color: '#007bff', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export { TokenAddModal };

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  tokenDetails: {
    marginTop: 15,
  },
  closeButton: {
    marginTop: 15,
    alignItems: 'center',
  },
});
