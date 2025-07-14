import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
type sendNativeTransaction = {
  amount: string,
  token: string,
  to:`0x${string}`
}

export type RootStackParamList = {
    UnlockScreen: { nextScreen: string };
    Details: undefined;
  RecoveryPhraseScreen: undefined;
  SendAddressScreen: undefined,
  AmountScreen: { address: string };
  SendScreen: { sendDetails: sendNativeTransaction },
  DiscoverScreen: { dappUrl?: string },
  setting: undefined,
  SendAddress: undefined,
  MoveScreen: {dappUrl?:string}
  
    
  };

export const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
export type AmountScreenRouteProp = RouteProp<RootStackParamList, 'AmountScreen'>;
export type SendScreenRouteProp = RouteProp<RootStackParamList, 'SendScreen'>;
export type DiscoverRouteProp = RouteProp<RootStackParamList, 'DiscoverScreen'>;
export type MoveRouteProp = RouteProp<RootStackParamList, 'MoveScreen'>;
