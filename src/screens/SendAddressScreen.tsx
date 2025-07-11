import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, Text } from "react-native";
import { isAddress } from "viem";
import { useNavigation } from "@react-navigation/native";
import debounce from "lodash.debounce";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types";


const SendAddressScreen = () => {
  
    const [input, setInput] = useState("");
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const checkAddressAndNavigate = useCallback(
    debounce((value: string) => {
      if (isAddress(value.trim())) {
        navigation.navigate("AmountScreen", { address: value.trim() as string });
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (input.length > 0) {
      checkAddressAndNavigate(input);
    }
  }, [input]);

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="To Wallet Address"
          placeholderTextColor="#999"
          autoCapitalize="none"
          onChangeText={setInput}
          value={input}
        />
      </View>
      <View>
        <Text style={styles.label}>Send via QR Code</Text>
      </View>
    </View>
  );
};

export default SendAddressScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
    gap: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    height: 50,
    fontSize: 16,
    color: "#000",
  },
});
