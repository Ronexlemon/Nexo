import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PrimaryButton from '../../components/PrimaryButton';


const HomeScreen = ({ navigation }: any) => {
  return (
      <View style={styles.container}>
          {/* icon */}
          <View style={styles.icon}>
          <View style={styles.icon_logo}>
                  
                  </View>
              <View style={styles.icon_text}>
                  <Text style={styles.primaryText}>Wallet SetUp</Text>
                  <Text style={styles.secondaryText}>Import an existing wallet </Text>
                  <Text style={styles.secondaryText}>Or create a new one </Text>
                  
              </View>
              
          </View>
          <View style={styles.account}>
              <View style={styles.button_card}>
                  <PrimaryButton style={styles.button_accent} title='Create Account' onPress={function (): void {
                      throw new Error('Function not implemented.');
                  }} />
                  <PrimaryButton style={styles.button_primary} title='Import account' onPress={function (): void {
                      throw new Error('Function not implemented.');
                  } } />
              </View>
              
          {/* <Text>Home Screen</Text>
          <Button title="Go to Details" onPress={() => navigation.navigate('Details')} /> */}
          </View>

    </View>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E40AF',
        padding: 16,
        
        
        
    },
    icon: {
        flex: 4,
        // backgroundColor:"red"
    },
    icon_logo: {
        flex:4
        
    },
    primaryText: {
        color: "#FFFFFF", 
       
        fontWeight: 'bold',
        fontSize: 32,
        justifyContent:"center",
        alignItems: "center",
        alignContent:"center"
      },
      secondaryText: {
        color: "#CBD5E1",
          fontSize: 16,
          
          justifyContent:"center",
          alignItems: "center",
          alignContent:"center"
      },
    icon_text: {
        flex: 2,
        justifyContent: "flex-end",
        paddingHorizontal:16
        
        
    },
    title_text: {
       
        
    },
    info_text: {
       
        
    },
    account: {
        flex: 3,
        width:"100%",
        justifyContent: "center",
        
        
    },
    button_card: {
        flexDirection: "column",
        gap:8

        
    },
    button_primary: {
        paddingHorizontal: 8,
        backgroundColor:"#3B82F6"
    },
    button_accent: {
        paddingHorizontal: 8,
        backgroundColor:"#93C5FD"
    }
})