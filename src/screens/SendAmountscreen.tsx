import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

import { CustomBottomSheet } from "../../components/BottomSheet"; // Corrected name
import { AmountScreenRouteProp, RootStackParamList } from "../../types";
import PrimaryButton from "../../components/PrimaryButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
type TokenType = {
  name: string;
  symbol: string;
  amount: number;
  amount_usd: number;
};

// Token list
const TOKEN_LIST: TokenType[] = [
  { name: "XFI", symbol: "XFI", amount: 10, amount_usd: 20 },
  { name: "cUSD", symbol: "cUSD", amount: 5, amount_usd: 5 },
  { name: "CELO", symbol: "CELO", amount: 2.5, amount_usd: 4.8 },
];

const SendAmountScreen = () => {
  const [amount, setAmount] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("Token");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const route = useRoute<AmountScreenRouteProp>();
  const { address } = route.params;

  const openBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleTokenSelect = (token: TokenType) => {
    setSelectedToken(token.symbol);
    bottomSheetRef.current?.dismiss();
  };
  const handleReview = () => {
    navigation.navigate("SendScreen", { sendDetails:{amount:amount.toString(),to:address as `0x${string}`,token:selectedToken} });
  }

  return (
    <View style={styles.container}>
      <View style={styles.card_container}>
      <Text style={styles.label}>Enter Amount</Text>
      <View style={styles.card}>
        <View style={styles.card_token}>
          <View style={styles.card_token_detail}>
            <View style={styles.card_token_detail_symbol}>
              
            </View>
            <View style={styles.card_token_detail_name}>
              <Text>{selectedToken} on CROSSFI</Text>
              <Text>Available: { 53.000}</Text>

            </View>

          </View>
          <View style={styles.card_token_selection}>
            <TouchableOpacity onPress={openBottomSheet}>
              <Text>Drop</Text>
            </TouchableOpacity>
            
          </View>

        </View>
        <View style={styles.card_amount}>
          <View>
          <TextInput
        style={styles.input}
        placeholder="0.00"
        placeholderTextColor="#999"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
          />
          </View>
       
          <View>
            <Text>Amount</Text>

          </View>

</View>

      </View>
      

      {/* <Text style={styles.label}>Token</Text>
      <TouchableOpacity style={styles.tokenSelector} onPress={openBottomSheet}>
        <Text style={styles.tokenText}>{selectedToken}</Text>
      </TouchableOpacity> */}

      <CustomBottomSheet ref={bottomSheetRef} title="Select a Token">
      <FlatList
          data={TOKEN_LIST}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.tokenItem}
              onPress={() => handleTokenSelect(item)}
            >
              <Text style={styles.tokenItemText}>{item.symbol}</Text>
              <Text style={styles.tokenItemText}>
                {item.amount} (~${item.amount_usd})
              </Text>
            </TouchableOpacity>
          )}
        />
      </CustomBottomSheet>
      </View>
      <View style={styles.review}>
        <PrimaryButton title="Review" onPress={handleReview}/>

      </View>
      
    </View>
  );
};

export default SendAmountScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
    fontWeight: "600", // Added for slight emphasis
  },
  input: {
    height: 50,
    
   
    
    paddingHorizontal: 15,
    fontSize: 18,
    
    color: "#333", 
  },
  tokenSelector: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: "center",
    backgroundColor: "#fff",
    marginBottom: 20, // Added for consistent spacing
  },
  tokenText: {
    fontSize: 16,
    color: "#000",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15, // Increased spacing for title
    textAlign: "center", // Centered title for better appearance
    color: "#333",
  },
  tokenItem: {
    paddingVertical: 15, // Increased padding for easier tapping
    borderBottomColor: "#eee",
    borderBottomWidth: StyleSheet.hairlineWidth, // Use hairline width for subtle line
  },
  tokenItemText: {
    fontSize: 16,
    color: "#333",
  },
  card_container: {
    flex:4
    
  },
  card: {
    height: 190,
    flexDirection: "column",
    backgroundColor: "gray",
    borderRadius: 15,
    borderWidth: 1,
   
  },
  card_token: {
    flex: 1,
    flexDirection: "row",
    borderBottomColor: "black",
    borderBottomWidth: 2,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    alignItems:"center"
    
  },
  card_token_detail: {
    flexDirection: "row",
    gap: 10,
    alignItems:"center"
    
  },
  card_token_detail_name: {
    flexDirection: "column",
    gap: 2,
    alignItems:"center"
    
  },
  card_token_detail_symbol: {
    justifyContent:"center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor:"blue"
    
  },
  card_token_selection: {
    alignItems:"center"
    
  },
  card_amount: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal:10
    
  },
  review: {
    flex: 1,
    marginBottom: 10,
    justifyContent: 'flex-end'
    
    
  
}
});