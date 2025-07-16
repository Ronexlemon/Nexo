import React from "react"
import { StyleSheet, Modal, View, Text ,TouchableOpacity} from "react-native";

const CustomAlertModal = ({ visible, title, message, onClose }: { visible: boolean, title: string, message: string, onClose: () => void }) => {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.alertBox}>
            <Text style={modalStyles.alertTitle}>{title}</Text>
            <Text style={modalStyles.alertMessage}>{message}</Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.alertButton}>
              <Text style={modalStyles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
};
export default CustomAlertModal;
const COLORS = {
    background: '#E3F2FD', // Lightest Blue
    cardBackground: '#FFFFFF',
    cardBorder: '#BBDEFB', // Lighter Blue
    primaryBlue: '#2196F3', // Primary Blue
    darkBlue: '#1976D2', // Darker Blue
    deepBlueText: '#0D47A1', // Deep Blue for important text
    lightText: '#444444',
    darkText: '#000000',
    whiteText: '#FFFFFF',
  };
  
const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertBox: {
      width: 300,
      backgroundColor: COLORS.cardBackground,
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    alertTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      color: COLORS.deepBlueText,
    },
    alertMessage: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 20,
      color: COLORS.lightText,
    },
    alertButton: {
      backgroundColor: COLORS.primaryBlue,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 10,
      minWidth: 100,
      alignItems: 'center',
    },
    alertButtonText: {
      color: COLORS.whiteText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });