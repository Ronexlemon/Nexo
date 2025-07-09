import { defineChain } from 'viem'
 
export const crossfi = defineChain({
  id: 4157,
  name: 'crossfi',
  nativeCurrency: {
    decimals: 18,
    name: 'XFI',
    symbol: 'XFI',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.ms'],
      // webSocket: ['wss://rpc.zora.energy'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://test.xfiscan.com' },
  },
  contracts: {
    multicall3: {
      address: '0xdb5c548684221ce2f55f16456ec5cf43a028d8e9',
      blockCreated: 5882,
    },
  },
})