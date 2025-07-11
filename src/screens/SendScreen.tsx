import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRoute } from "@react-navigation/native";

import { SendScreenRouteProp } from "../../types";
import PrimaryButton from "../../components/PrimaryButton";

const SendScreen = () => {
  const route = useRoute<SendScreenRouteProp>();
  const { sendDetails } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.card_container}>
        <Text style={styles.label}>Send Summary</Text>

        <View style={styles.card}>
          <View style={styles.card_row}>
            <Text style={styles.card_label}>Token:</Text>
            <Text style={styles.card_value}>{sendDetails?.token}</Text>
          </View>

          <View style={styles.card_row}>
            <Text style={styles.card_label}>To:</Text>
            <Text style={styles.card_value}>{sendDetails?.to}</Text>
          </View>

          <View style={styles.card_row}>
            <Text style={styles.card_label}>Amount:</Text>
            <Text style={styles.card_value}>{sendDetails?.amount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.review}>
        <PrimaryButton title="Review" onPress={() => {}} />
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
      flex: 4,
    },
    card: {
      backgroundColor: "#fff",
      borderRadius: 15,
      borderWidth: 1,
      borderColor: "#ccc",
      padding: 15,
      gap: 12,
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
    card_value: {
      fontSize: 16,
      color: "#000",
    },
    review: {
      flex: 1,
      marginBottom: 10,
      justifyContent: "flex-end",
    },
  });
  