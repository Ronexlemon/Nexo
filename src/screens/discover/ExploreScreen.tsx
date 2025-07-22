import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types'; // Assuming this path is correct

// Dummy dApp data - in a real app, this would likely come from an API
const dapps = [
  {
    id: '1',
    name: 'Uniswap',
    url: 'https://app.uniswap.org',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968393.png', // Example: Replaced with a more generic icon for demonstration
    description: 'Swap cryptocurrencies and earn on liquidity pools.'
  },
  {
    id: '2',
    name: 'Aave',
    url: 'https://app.aave.com',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968393.png', // Example: Replaced with a more generic icon for demonstration
    description: 'Lend and borrow digital assets with ease.'
  },
  {
    id: '3',
    name: 'Zerion',
    url: 'https://app.zerion.io',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968393.png', // Example: Replaced with a more generic icon for demonstration
    description: 'Manage your DeFi portfolio from one place.'
  },
  {
    id: '4',
    name: 'Pancakeswap',
    url: 'https://pancakeswap.finance/',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968393.png',
    description: 'A leading decentralized exchange on BNB Smart Chain.'
  },
  {
    id: '5',
    name: 'OpenSea',
    url: 'https://opensea.io/',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968393.png',
    description: 'Discover, collect, and sell NFTs.'
  },
  {
    id: '6',
    name: 'Nexo Template',
    url: 'https://nexo-next-template.vercel.app/',
    icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png',
    description: 'A starter template for building modern Web3 dApps.'
  }
];

const ExploreScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const openDapp = (dappUrl: string) => {
    navigation.navigate("MoveScreen", { dappUrl }); 
  };

  const renderDappCard = ({ item }: { item: typeof dapps[0] }) => (
    <TouchableOpacity style={styles.card} onPress={() => openDapp(item.url)}>
      <Image source={{ uri: item.icon }} style={styles.icon} />
      <View style={styles.infoContainer}>
        <Text style={styles.dappName}>{item.name}</Text>
        <Text style={styles.dappDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={styles.arrowContainer}>
        
        <Text style={styles.arrow}>❯</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Explore dApps</Text>
      <FlatList
        data={dapps}
        keyExtractor={(item) => item.id}
        renderItem={renderDappCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5', 
    paddingHorizontal: 20, 
    paddingTop: 40, 
  },
  headerTitle: {
    fontSize: 28, 
    fontWeight: '700', 
    color: '#333', 
    marginBottom: 25, 
    textAlign: 'center', 
  },
  listContent: {
    paddingBottom: 20, 
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    padding: 15,
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3, 
  },
  icon: {
    width: 50, 
    height: 50,
    borderRadius: 12, 
    marginRight: 15,
    backgroundColor: '#E6E9ED', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  dappName: {
    fontSize: 18, 
    fontWeight: '600',
    color: '#333',
    marginBottom: 4, 
  },
  dappDescription: {
    fontSize: 13,
    color: '#666', 
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#BBB', 
  },
});