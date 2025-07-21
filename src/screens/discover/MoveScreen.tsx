import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MoveRouteProp, RootStackParamList } from "../../../types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LottieView from "lottie-react-native";

// This import will now load the new animation data from your local file
import animation from "../../../assets/animation.json"

import connectIcon from "../../../assets/connect.json"

const MoveScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<MoveRouteProp>();
    const dappUrl = route.params?.dappUrl ?? 'https://supply-sphere.vercel.app';

  useEffect(() => {
    const timer = setTimeout(() => {
       navigation.replace("DiscoverScreen", { dappUrl: dappUrl as string });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* LottieView will render the animation from the updated animation.json */}
      <LottieView source={connectIcon} autoPlay loop style={styles.lottie} />

      {/* Basic Spinner Fallback */}
      {/* <ActivityIndicator size="large" color="#4c9" /> */}
    </View>
  );
};

export default MoveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  lottie: {
    width: 200,
    height: 200,
  },
});