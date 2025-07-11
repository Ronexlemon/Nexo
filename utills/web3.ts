
import { Account, createPublicClient, createWalletClient, http, isAddress, PublicClient, WalletClient } from 'viem';
import { mnemonicToAccount, generateMnemonic, english, french, japanese, czech, simplifiedChinese, portuguese } from 'viem/accounts';
import { erc20Abi } from 'viem';
import { parseUnits } from 'viem/utils';
import { crossfi } from '../chains/crossfi';

export const createMnemonic = (language?: string) => {
  const wordlists: Record<string, typeof english> = {
    english,
    french,
      japanese,
      czech,
      portuguese,
    simplifiedChinese
    
  };

  const selectedWordlist = wordlists[language ?? 'english'] || english;
  const mnemonic = generateMnemonic(selectedWordlist);

  return mnemonic;
};

export const wallet_Client = (account: Account): WalletClient => {
    return createWalletClient({
      account,
      chain: crossfi, 
      transport: http("https://rpc.testnet.ms"), 
    });
};
export const wallet_Client_Provider = (): PublicClient => {
  return createPublicClient({
    chain: crossfi,
    transport: http('https://rpc.testnet.ms'),
  });
};
export const accountfromMnemonic = (mnemonic: string) => {
      return mnemonicToAccount(mnemonic)
  }
export const checkIfAddress = (address: `0x${string}`): boolean => {
  return isAddress(address)
  
}


export const sendNativeTransaction = async(client: WalletClient, to_: `0x${string}`, amount:bigint):Promise<`0x${string}`> => {
    const hash = await client.sendTransaction({
        to: to_,
        value: amount,
        account: null,
        chain: undefined
    })
    return hash
}



export const sendERC20 = async (
  client: WalletClient,
  tokenAddress: `0x${string}`,
  to: `0x${string}`,
  amount: string, 
  decimals: number = 18
): Promise<`0x${string}`> => {
  const hash = await client.writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to, parseUnits(amount, decimals)],
      chain: undefined,
      account: null
  });

  return hash;
};