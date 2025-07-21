import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView, // Use SafeAreaView for better layout on notched devices
  Platform, // To handle platform-specific styles
  StatusBar, // To manage status bar appearance
  Dimensions, // For responsive design
} from 'react-native';
import { WebView } from 'react-native-webview';
import FontAwesome from 'react-native-vector-icons/FontAwesome'; // Using Feather for a cleaner icon set
import Clipboard from '@react-native-clipboard/clipboard'; // For copy to clipboard functionality
import Toast from 'react-native-toast-message'; // For subtle feedback messages

// Define your Transaction type (assuming it's already defined correctly)
interface Transaction {
  tokenName: string;
  amount: number;
  amountInUSD: number;
  hash: string;
  type: 'sent' | 'received'; // Added type for better distinction
  date: string; // Added date for better context
}

const transactions: Transaction[] = [
  {
    tokenName: 'XFI',
    amount: 20.5,
    amountInUSD: 20.5,
    hash: '0xb90aadf0800f0f025a1502f3ba33b573526f3bdfa06c89a4e0bcad6ebe210bc4',
    type: 'received',
    date: '2025-07-20 14:30',
  },
  {
    tokenName: 'XFI',
    amount: 5.1,
    amountInUSD: 3.8,
    hash: '0xb90aadf0800f0f025a1502f3ba33b573526f3bdfa06c89a4e0bcad6ebe210bc4',
    type: 'sent',
    date: '2025-07-19 09:15',
  },
  {
    tokenName: 'XFI',
    amount: 100.0,
    amountInUSD: 100.0,
    hash: '0xb90aadf0800f0f025a1502f3ba33b573526f3bdfa06c89a4e0bcad6ebe210bc4',
    type: 'received',
    date: '2025-07-18 18:00',
  },
  {
    tokenName: 'XFI',
    amount: 1.2,
    amountInUSD: 0.9,
    hash: '0xb90aadf0800f0f025a1502f3ba33b573526f3bdfa06c89a4e0bcad6ebe210bc4',
    type: 'sent',
    date: '2025-07-17 11:45',
  },
];

const { height: screenHeight } = Dimensions.get('window');

const HistoryScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedTxHash, setSelectedTxHash] = useState<string | null>(null);
  const [isWebViewLoading, setIsWebViewLoading] = useState(true);

  const handleCardPress = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const openTxInWebView = (hash: string) => {
    setSelectedTxHash(hash);
  };

  const closeModal = () => {
    setSelectedTxHash(null);
    setIsWebViewLoading(true); 
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: 'Transaction hash copied to clipboard',
      visibilityTime: 2000,
      topOffset: 50,
    });
  };

  const shortenHash = (hash: string, length: number = 8) => {
    if (!hash) return '';
    return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
  };

  const getAmountColor = (type: 'sent' | 'received') => {
    return type === 'received' ? '#28a745' : '#dc3545'; 
  };

  const renderTransactionItem = ({ item, index }: { item: Transaction; index: number }) => {
    const isExpanded = expandedIndex === index;
    const amountSign = item.type === 'received' ? '+' : '-';

    return (
      <TouchableOpacity
        style={[styles.card, isExpanded && styles.cardExpanded]}
        onPress={() => handleCardPress(index)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.tokenInfo}>
            <Text style={styles.tokenName}>{item.tokenName}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
          <View style={styles.amountInfo}>
            <Text style={[styles.amount, { color: getAmountColor(item.type) }]}>
              {amountSign} {item.amount}
            </Text>
            <Text style={styles.usdAmount}>${item.amountInUSD.toFixed(2)}</Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <TouchableOpacity
              onPress={() => copyToClipboard(item.hash)}
              style={styles.hashContainer}
            >
              <Text style={styles.hashLabel}>Hash:</Text>
              <Text style={styles.hashText}>{shortenHash(item.hash, 15)}</Text>
              <FontAwesome name="copy" size={16} color="#6c757d" style={styles.copyIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openTxInWebView(item.hash)}
              style={styles.viewOnExplorerButton}
            >
              <FontAwesome name="external-link" size={16} color="#007bff" />
              <Text style={styles.viewOnExplorerText}>View on Crossfiscan</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F8FA" />
      <View style={styles.container}>
        <Text style={styles.header}>Transaction History</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <FontAwesome name="clock" size={60} color="#adb5bd" />
            <Text style={styles.emptyStateText}>No transactions yet.</Text>
            <Text style={styles.emptyStateSubText}>
              Your recent activities will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderTransactionItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Modal
        visible={!!selectedTxHash}
        animationType="slide"
        onRequestClose={closeModal} 
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <FontAwesome name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {isWebViewLoading && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading transaction...</Text>
            </View>
          )}
          {selectedTxHash && (
            <WebView
              source={{ uri: `https://test.xfiscan.com/tx/${selectedTxHash}` }}
              style={styles.webView}
              onLoadStart={() => setIsWebViewLoading(true)}
              onLoadEnd={() => setIsWebViewLoading(false)}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent.description);
                Toast.show({
                  type: 'error',
                  text1: 'Error loading page',
                  text2: 'Could not load transaction details.',
                });
                setIsWebViewLoading(false);
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
      <Toast />
    </SafeAreaView>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA', 
  },
  container: {
    flex: 1,
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    fontSize: 28, 
    fontWeight: '700',
    color: '#212529', 
    marginBottom: 25, 
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20, 
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, 
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, 
  },
  cardExpanded: {
    borderColor: '#007bff', 
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, 
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  dateText: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  amountInfo: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20, 
    fontWeight: '700',
  },
  usdAmount: {
    fontSize: 14,
    color: '#6c757d', 
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef', 
    paddingTop: 10,
  },
  hashContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#e9ecef', 
    marginBottom: 8,
  },
  hashLabel: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
    marginRight: 6,
  },
  hashText: {
    flex: 1,
    color: '#007bff', 
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', 
  },
  copyIcon: {
    marginLeft: 10,
  },
  viewOnExplorerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#e6f2ff', 
    justifyContent: 'center',
  },
  viewOnExplorerText: {
    color: '#007bff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: '#F5F8FA', 
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  closeButton: {
    padding: 5, 
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, 
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 15,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
});