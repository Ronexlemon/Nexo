import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import { SendScreenRouteProp } from "../../types";
import PrimaryButton from "../../components/PrimaryButton";
import { useTransactions } from "../../hook/useTransactions";
import { useWallet } from "../../hook/useWallet";
import { amount_to_bigint } from "../../utills/web3";
import { useSelector } from "react-redux";
import { RootState } from "../../store/redux";
import { useWalletClient } from "../../hook/useWalletClient";
import { mnemonicToAccount } from "viem/accounts";


const SendScreen = () => {
  const route = useRoute<SendScreenRouteProp>();
  const { sendDetails } = route.params;
  const { sendNative, sendToken } = useTransactions();
  const { createWallet } = useWallet();
  const account = useSelector((state: RootState) => state.account);

  const [isSending, setIsSending] = useState(false);
  const mnemonic = account.mnemonic as string
  const acc = mnemonicToAccount(mnemonic)
  const walletClient = useWalletClient(acc);
  
  

  const handleSendNative = async () => {
    const amount = amount_to_bigint(sendDetails.amount as string);
   
    if (!mnemonic) {
      Alert.alert("No Mnemonic");
      
    }
    try {
      setIsSending(true);
      // const { client } = createWallet();
      if (!walletClient) {
        Alert.alert("No client");
        return;
      }
      const tx = await sendNative(walletClient, sendDetails.to as `0x${string}`, amount,mnemonic);
      console.log("THE TX IS",tx)
      Alert.alert(`The hash is ${tx}`);
    } catch (error: any) {
      Alert.alert(`Error: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

  // const isSendDisabled =
  //   isSending ||
  //   !sendDetails?.token?.trim() ||
  //   !sendDetails?.to?.trim() ||
  //   !sendDetails?.amount?.trim();

  return (
    <View style={styles.container}>
      <View style={styles.card_container}>
       

        <View style={styles.card}>
          <View style={styles.card_row}>
            <Text style={styles.card_label}>Sending</Text>
            
          </View>
          <View style={styles.card_token}>
            <View style={styles.token_symbol}>
               <Text>image</Text>
            </View>
            <View style={styles.token}>
              <Text style={styles.text_amount} >{sendDetails?.amount}  {sendDetails?.token}</Text>
              <Text style={styles.text_amount}>$ {200}  </Text>

            </View>

          </View>


          <View style={styles.token_to}>
            <Text style={styles.card_label}>To:</Text>
            <View style={styles.to_address}>
              
            <Text style={styles.card_value}>{sendDetails?.to}</Text>
            </View>
           
          </View>
          
        </View>
      </View>

      {/* network and fees */}
      <View style={styles.network}>
        <View style={styles.network_name}>
          <Text style={styles.general_test}>Network</Text>
          <Text  style={styles.general_test}>Crossfi</Text>
        </View>
        <View style={styles.network_name}>
          <Text style={styles.general_test}>Network Fee</Text>
          <Text style={styles.text_amount}>{0.011}{ sendDetails?.token}</Text>
        </View>
        <View style={styles.network_name}>
          <Text style={styles.general_test}>Total plus Fees</Text>
          <Text style={styles.text_amount}>${100 }</Text>
        </View>

      </View>

      <View style={styles.review}>
        <PrimaryButton
          title={isSending ? "Sending..." : "Send"}
          onPress={handleSendNative}
         
        />
      </View>
    </View>
  );
};

export default SendScreen;

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
      fontWeight: "600",
    },
    card_container: {
      flex: 2,
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 15,
      gap: 12,
      height: 250,
      flexWrap: 'wrap'
    },
    card_row: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    card_label: {
      fontSize: 16,
      fontWeight: "500",
      color: "#444",
  },
  card_token: {
    flexDirection: "row",
    gap:8
      
    },
    card_value: {
      fontSize: 16,
      color: "#000",
    },
    review: {
      flex: 1,
      marginBottom: 10,
      justifyContent: "flex-end",
  },
  token_symbol: {
    width: 46,
    height:46,
    borderRadius: 23,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems:"center"
  },
  token: {
    flexDirection: "column",
    gap: 4,
    
  },
  token_to: {
    flexDirection: "column",
    gap:2
  },
  to_address: {
    flexDirection: "row",
    gap: 4,
    flexWrap:"wrap"
  },

  network: {
    flex: 2,
    flexDirection: "column",
    gap:16
    
  },
  network_name: {
    flexDirection: "row",
    justifyContent:"space-between"
  },
  general_test: {
    fontSize:16
    
  },
  text_amount: {
    fontSize:16
    
  }
  });
  