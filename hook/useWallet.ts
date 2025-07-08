import { useCallback, useState } from 'react';
import {
  createMnemonic,
  wallet_Client,
  accountfromMnemonic,
} from '../utills/web3';
import { Account } from 'viem/accounts';
import { WalletClient } from 'viem';

type CreateWalletOptions = {
  language?: string;
};

export const useWallet = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [client, setClient] = useState<WalletClient | null>(null);

  // Create a new wallet
  const createWallet = useCallback((options?: CreateWalletOptions) => {
    const generatedMnemonic = createMnemonic(options?.language);
    const newAccount = accountfromMnemonic(generatedMnemonic);
    const walletClient = wallet_Client(newAccount);

    setMnemonic(generatedMnemonic);
    setAccount(newAccount);
    setClient(walletClient);
  }, []);

  // Import wallet from existing mnemonic
  const importWallet = useCallback((existingMnemonic: string) => {
    const importedAccount = accountfromMnemonic(existingMnemonic);
    const walletClient = wallet_Client(importedAccount);

    setMnemonic(existingMnemonic);
    setAccount(importedAccount);
    setClient(walletClient);
  }, []);

  return {
    mnemonic,
    account,
    client,
    createWallet,
    importWallet,
  };
};
