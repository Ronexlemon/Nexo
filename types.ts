import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
type sendNativeTransaction = {
  amount: string,
  token: string,
  to:`0x${string}`
}
export type Transaction = {
  tokenName: string;
  amount: number;
  amountInUSD: number;
  hash: string;
};


export type RootStackParamList = {
    UnlockScreen: { nextScreen: string };
    Details: undefined;
  RecoveryPhraseScreen: undefined;
  SendAddressScreen: undefined,
  AmountScreen: { address: string };
  SendScreen: { sendDetails: sendNativeTransaction },
  DiscoverScreen: { dappUrl?: string },
  setting: undefined,
  Settings: undefined,
  SendAddress: undefined,
  MoveScreen: { dappUrl?: string },
  Wallet : undefined,
  
    
  };

export const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
export type AmountScreenRouteProp = RouteProp<RootStackParamList, 'AmountScreen'>;
export type SendScreenRouteProp = RouteProp<RootStackParamList, 'SendScreen'>;
export type DiscoverRouteProp = RouteProp<RootStackParamList, 'DiscoverScreen'>;
export type MoveRouteProp = RouteProp<RootStackParamList, 'MoveScreen'>;
