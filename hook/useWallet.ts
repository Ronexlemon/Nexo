import { useCallback, useState } from 'react';
import {
  createMnemonic,
  wallet_Client,
  accountfromMnemonic,
  wallet_Client_Provider,
} from '../utills/web3';
import { Account } from 'viem/accounts';
import { PublicClient, WalletClient } from 'viem';
import React from 'react';

type CreateWalletOptions = {
  language?: string;
};

type WalletData = {
  mnemonic: string;
  account: Account;
  client: WalletClient;
  
};

export const useWallet = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [client, setClient] = useState<WalletClient | null>(null);
  const [publicClient] = useState<PublicClient>(() => wallet_Client_Provider());






  // Create a new wallet and return the result
  const createWallet = useCallback((options?: CreateWalletOptions): WalletData => {
    const generatedMnemonic = createMnemonic(options?.language);
    const newAccount = accountfromMnemonic(generatedMnemonic);
    const walletClient = wallet_Client(newAccount);
   

    // Update state
    setMnemonic(generatedMnemonic);
    setAccount(newAccount);
    setClient(walletClient);
   

    // Return data immediately
    return {
      mnemonic: generatedMnemonic,
      account: newAccount,
      client: walletClient,
      
    };
  }, []);

  // Import a wallet using an existing mnemonic
  const importWallet = useCallback((existingMnemonic: string): WalletData => {
    const importedAccount = accountfromMnemonic(existingMnemonic);
    const walletClient = wallet_Client(importedAccount);
    const pubClient = wallet_Client_Provider();

    // Update state
    setMnemonic(existingMnemonic);
    setAccount(importedAccount);
    setClient(walletClient);
    

    return {
      mnemonic: existingMnemonic,
      account: importedAccount,
      client: walletClient,
     
    };
  }, []);
 
  return {
    mnemonic,
    account,
    client,
    createWallet,
    importWallet,
    publicClient
  };
};
