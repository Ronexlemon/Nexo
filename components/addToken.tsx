import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchERC20TokenDetails } from '../lib/TokenDetails';

interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  balance: string; // Balance could be a string for large numbers
  address: string; // Add address to tokenData for clarity
}

interface userAccount{
    address:`0x${string}`
}

interface AddTokenProps {
  onSubmit: (token: TokenData) => void;
    
  userAddress?:userAccount  // Use Partial for optional initial values
}

const AddToken: React.FC<AddTokenProps> = ({ onSubmit,userAddress }) => {
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    

  
  

  
  const fetchTokenDetails = async () => {
    if (!tokenAddress.trim() || !userAddress?.address) {
      setError("Please enter a token address.");
      setTokenData(null);
      return;
    }

    setLoading(true);
    setError(null);
    setTokenData(null); 

    try {
      
      console.log(`Attempting to fetch details for address: ${userAddress?.address}`);

      const details = await fetchERC20TokenDetails(
              tokenAddress.toLocaleLowerCase() as `0x${string}`,
              userAddress?.address as `0x${string}`
            );

      

      

      if (details) {
        setTokenData(details);
      } else {
        setError("No token found for this address. Please try a different one.");
      }
      // -------------------------------------------------------------------

    } catch (err: any) {
      console.error("Error fetching token details:", err);
      setError(`Failed to fetch token details: ${err.message || 'Unknown error'}`);
      setTokenData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = () => {
    if (tokenData) {
        onSubmit(tokenData); 
        setTokenData(null)
        setError(null);
        
    } else {
      
      Alert.alert("No Token Data", "Please fetch token details before adding to wallet.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputSection}>
        <TextInput
          style={styles.tokenInputText}
          placeholder="Enter token address (e.g., 0x...)"
          placeholderTextColor="#888"
          value={tokenAddress}
          onChangeText={setTokenAddress}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="search"
          onSubmitEditing={fetchTokenDetails} 
        />
        <TouchableOpacity
          style={[
            styles.fetchButton,
            
            (loading || !tokenAddress.trim() || !!tokenData) && styles.fetchButtonDisabled
          ]}
          onPress={fetchTokenDetails}
          disabled={loading || !tokenAddress.trim() || !!tokenData}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.fetchButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && tokenData && (
        <View style={styles.tokenDetailsSection}>
          <Text style={styles.detailHeader}>Token Details:</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>{tokenData.name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Symbol:</Text>
            <Text style={styles.detailValue}>{tokenData.symbol}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Decimals:</Text>
            <Text style={styles.detailValue}>{tokenData.decimals}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Balance:</Text>
            <Text style={styles.detailValue}>{tokenData.balance}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address:</Text>
            <Text style={styles.detailValue}>{tokenData.address}</Text>
          </View>

          <TouchableOpacity style={styles.addButton} onPress={handleAddToken}>
            <Text style={styles.addButtonText}>Add to Wallet</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && !tokenData && tokenAddress.trim() && (
        <View style={styles.messageContainer}>
          <Text style={styles.infoText}>Enter an address and tap "Fetch Details".</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8', 
    borderRadius: 10,
  },
  inputSection: {
    flexDirection: 'column',
    alignItems: 'center',
      marginBottom: 20,
    gap:4
  },
  tokenInputText: {
    flex: 1,
      height: 50,
    width:"100%",
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 0,
    color: '#333',
  },
  fetchButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width:"100%",
  },
  fetchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffe0b2', 
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f', 
    fontSize: 14,
    textAlign: 'center',
  },
  infoText: {
    color: '#555',
    fontSize: 14,
    textAlign: 'center',
  },
  tokenDetailsSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    maxWidth: '70%', 
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: '#28a745', 
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    },
    fetchButtonDisabled: {
        backgroundColor: '#a0a0a0', 
      },
});

export { AddToken };
