import { useCallback, useState } from 'react';
import { sendNativeTransaction, sendERC20 } from '../utills/web3';
import { WalletClient } from 'viem';

export const useTransactions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Send native token (e.g., ETH, XFI)
  const sendNative = useCallback(
    async (client: WalletClient, to: `0x${string}`, amount: bigint,mnemonic:string) => {
      try {
        setIsLoading(true);
        setError(null);
        const hash = await sendNativeTransaction(client, to, amount,mnemonic);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        console.error('Send native token error:', err);
        setError(err.message || 'Failed to send transaction');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Send ERC-20 token
  const sendToken = useCallback(
    async (
      client: WalletClient,
      tokenAddress: `0x${string}`,
      to: `0x${string}`,
      amount: string,
      decimals: number = 18
    ) => {
      try {
        setIsLoading(true);
        setError(null);
        const hash = await sendERC20(client, tokenAddress, to, amount, decimals);
        setTxHash(hash);
        return hash;
      } catch (err: any) {
        console.error('Send token error:', err);
        setError(err.message || 'Failed to send ERC20 transaction');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    txHash,
    error,
    sendNative,
    sendToken,
  };
};
