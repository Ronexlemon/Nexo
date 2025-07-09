import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { useAccount } from '../../hook/useAccount';
import Icon from 'react-native-vector-icons/Ionicons';
import PrimaryButton from '../../components/PrimaryButton';
import { useWallet } from '../../hook/useWallet';
import { formatEther } from 'viem';

const tokens = Array(10).fill({
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADACAMAAAB/Pny7AAAAaVBMVEX///+MjIwzMzMUFBQ4ODgZGRmVlZUAAACJiYktLS0wMDAJCQn6+vr19fUmJiaEhISqqqru7u7g4ODT09Pa2tq5ubkgICDHx8ecnJx+fn6/v79VVVVtbW1BQUGzs7NmZmZKSkpeXl52dna6OOOJAAAHUklEQVR4nO2da7eyLBCGt3jg4FnzWKb1/3/kq5WkAtZutxbwvNzfa3HFMAwzA/38GBkZGRkZGRkZGRkZGRkZGRkZGRkZGemgIJU9gi+qsmSP4HvKPLuVPYavqfDgNZQ9iC8ptzybJLJH8R2FNfJcfPw3fECBLM8FURzIHsgXdPBuMLj7B3xAeEbWBANwo7+h5d4M0511N7Q0GVluMCA6ZbJH8zcF1cRyhyG41nuzSa0nDMCR1lMTJLH1hAFlr/PU5Ld5oTAEn2WP6HOl9RoGRIO+hlbdjewJA2xP9pg+VdpYWxgAc9mj+lBJzMJEvZ4754GyLGCAW8ge1yeiq38Ng48a+oCgtSweDCCefoaWeYgPg4dK9th+q+CMBDMDoka3OKBasqxhgFvLHt3vtFz9DEx01GuzqSxLDENIrZMPyNYTs4EZ3bNGU5M+934uDHBP+uQDcgvtwxCgTT4g3BgZCzOeBXSZmmpjZBwY4GtyFljt/SIYQrTICQYJw8KBGc8COhhaxhgZFwa4OoRozOoXwGCgfojWciaGCwNKJHusr5RyUAQwJFI8DlhH/vswACseB1Q8FBEMAUrXBlOOWxbDANwfZI94Ry0XRQhDsKeuRzuwe/8uDMCdsptNeOa55T0Y4CpbG8w9AYsYhjiKngVCwerfgwGRmu45qIQsOzDAVtIHcCL/d2Cwo6APCLbn/jdhQHlRb2oOjZhlFwZA5eoCIRIb2ag9GByp5gN2Vr+Fmt7HREwTKZYPSMWrH10vg+O7ZSTEwZ1SIRrv3P9AOR07x3F8297BiZTqD8gFLM1pcIBzhxnlinAihc4CbNZvkhf3g/PQHWbCwVxDU6g/oOXlMNClA84WZlRJHAaGEGV8ACfyR9cjIY7Dg7H9kp0dZfoE2eMlOg0EOI4AZpodZvGo0oy2zfnHpwGsURgY1hcQRwkfsCnGxNfOYcXAMDhRr8LULHP+417f4e2sCGBsf3RtCx5bgdrgouIXj3s9j0QAc/fUFCeS3x8QFDPLba8XsIhgVnFBFMsOOOfVP26QvLXyEmaxeAiWnA8I6/jhwIST8hKG4siuDd6SS81lb1LegJmsbdpIy0YmS9BswpZPYSacMcyBMqdmdGBD9BrlHZi7q3bkseRM2PIXmGl6XHm9wonjvoXyLowPS4mddW3vMGHY52YG/V6qcw6TU4e/AwPLYy171zwkx+gbMNCpFShxhlWDX07OKxgI+1aNpEbaHjH5C4wPu0K2hf2k83LN6q78HAaW1nyWSQ/SPED4/D3zK9ybnB2Y0cKqgH6LxAnKmqelt4Mt9tJCGB9GxfwVqQWlHmmqJqY/a5CI4wEBjA8JrTUFNYRSA82pKoPO2YxzaDqBrfFhYNnP7jjMT255kuzQxlMz8qrZ0tPiFHFxeDAQXpL5gwevK+Wfm4PKQsiqD0+7X2f/hDAQdh71YcVxSgbIv/kYTkmA0daoT829I3sq2ML40InneUjbxo/Gc6YlnWVOaMZeO+86YXVytiHBBga6l/ZhYUFudbf7tRcV8maPnMZoa9X802bnY7mTnh2nJZlHnnkXPJ2YsaPGrcfw0f6DrGSugAWZBbAIZvTAs/8LixGF3MoASHo8cxe9koEsGhKMtlYSHowPj3SXPMTgkQTEF2UqgRlNnaOa7qFp1bksDLQL6sPqYU4AKtXZ8Mw3o5g63J+wofGaT7cWak0jK63TlEq9S7Mo0aAmoT42uz5O1TcY37/MG36QXeCz5BT1kobN16qqGXs5XTpJf8PxJ5TjvCsGWe1EalY0b8qXRZrJr9F4zZsya74PcTyv8bDt8bISaCtRZ1qqWJWckNfO7jdom4FAfC3onmp1qzqTq97twEcKfeEIztTW2hN1x0EWO/aqQCs7Xc7Vtt8MxUlOQ4LZwtJz769rzcrUmVcKqm1jE/LOm5VdNV20QlH2lRBOCd3yllmXQ9zhbQuAKiVzRtsLjRMOqvPHwk/PF7bXROH7p7ymM4TuEfIYq3HaZtTzylQh945GjIqf9FSWLAooZaaWXklwsSFGsOQ1Z6l9sUHUdC64ctKpcSATKeB1a4lglDj17yng99HxYCL1X9bjNp5zbwN2ynrlp3g3tXgwpbpe+amgZvvoOTDuUfEFcxenx5mFUayXWSz2QjALA1WMlXkKii0NA2OrdyATKXz17ESpRA/jm3r1IMjQym9hfFvB/lMtjpoHMpE2hrZ5EUjNS3NirQ1tBaPhy1Or+Hn1JJga7di/0uqgtnoSTNlLsztaBgLLl+d02frXSrlvAtoaxMo8tbynJ5UqXvxCz/iZwkSD7EF9LFpRm2FwpEt8yVG1hiFYP6/81Bw/P2DcWKswZqv0vmzuMOWgpVd+6n657gaDu0KjWJmne/w8wRCi5DMGv9ItYzvBRGrnYt/T/I8NijTH/FHt/b80dN361wqS6V9OZLcsfktp7dmDpvElq9yDOm/9G7Vye3y/q1CjNJmRkZGRkZGRkZGRkZGRkZGRkZGRkdH/Wv8BdGh4+SYkWNcAAAAASUVORK5CYII=',
  name: 'Ethereum',
  amount: 1000,
  symbol: 'ETH',
  dollar_amount: 10000,
});

const DetailsScreen = ({ navigation }: any) => {
  const { account } = useAccount();
  const { publicClient } = useWallet()
  const [balance, setBalance] = React.useState<string>('0');
  const handleSetting = () => {
    navigation.replace('setting'); 
  }
  React.useEffect(() => {
   
    const fetchBalance = async () => {
      if (!account || !publicClient) {
        
        return
        
      } ;

      try {
        const rawBalance = await publicClient.getBalance({
          address: account.publicAddress as `0x${string}`,
        });
        console.log("THE BALABCE",rawBalance)
     Alert.alert(`THE BALANCE,${rawBalance}`)
        setBalance(formatEther(rawBalance)); // convert BigInt to human-readable ETH
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };

    fetchBalance();
  }, [account, publicClient]);
  return (
    <View style={styles.container}>
      {/* Top Row: Setting + Scan */}
      <View style={styles.settingRow}>
        <TouchableOpacity onPress={handleSetting} style={styles.settingIcon}>
          <Icon name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.scanIcon}>
          <Icon name="scan-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={styles.balanceContainer}>
        <Text style={styles.tokenBalance}>{balance} XFI</Text>
        <View style={styles.conversionRow}>
          <Text style={styles.dollarAmount}>$100.10</Text>
          <Text style={styles.changePositive}>+3.52%</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <PrimaryButton title="Send" onPress={() => {}} style={styles.actionBtn} textStyle={styles.actionText} />
        <PrimaryButton title="Receive" onPress={() => {}} style={styles.actionBtn} textStyle={styles.actionText} />
        <PrimaryButton title="Swap" onPress={() => {}} style={styles.actionBtn} textStyle={styles.actionText} />
      </View>

      {/* Toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity>
          <Text style={styles.toggleText}>Tokens</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.toggleTextInactive}>Collectibles</Text>
        </TouchableOpacity>
      </View>

      {/* Token List */}
      <FlatList
        data={tokens}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.tokenCard}>
            <View style={styles.tokenLeft}>
              <Image source={{ uri: item.icon }} style={styles.tokenImage} />
              <View>
                <Text style={styles.tokenName}>{item.name}</Text>
                <Text style={styles.tokenSymbol}>{item.symbol}</Text>
              </View>
            </View>
            <View style={styles.tokenRight}>
              <Text style={styles.tokenAmount}>{item.amount} {item.symbol}</Text>
              <Text style={styles.tokenValue}>${item.dollar_amount.toLocaleString()}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

export default DetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceContainer: {
    // alignItems: 'center',
    marginBottom: 20,
  },
  tokenBalance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  conversionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  dollarAmount: {
    fontSize: 16,
    color: 'gray',
  },
  changePositive: {
    fontSize: 16,
    color: 'green',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  toggleRow: {
    flexDirection: 'row',
    // justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  toggleTextInactive: {
    fontSize: 16,
    fontWeight: '400',
    color: 'gray',
  },
  tokenCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tokenLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tokenImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  tokenName: {
    fontSize: 16,
    fontWeight: '600',
  },
  tokenSymbol: {
    fontSize: 12,
    color: 'gray',
  },
  tokenRight: {
    alignItems: 'flex-end',
  },
  tokenAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  tokenValue: {
    fontSize: 12,
    color: 'gray',
  },
});
