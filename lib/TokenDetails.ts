

import { erc20Abi } from 'viem';

import { wallet_Client_Provider } from '../utills/web3';

const client = wallet_Client_Provider()
export const fetchERC20TokenDetails = async (
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}`
) => {
  const [name, symbol, decimals, balance] = await Promise.all([
    client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'name',
    }),
    client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'symbol',
    }),
    client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'decimals',
    }),
    client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress],
    }),
  ]);

  return {
    name,
    symbol,
    decimals: Number(decimals),
    balance: balance.toString(),
    address: tokenAddress,
  };
};
