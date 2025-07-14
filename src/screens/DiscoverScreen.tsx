import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebView as WebViewType } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { WebViewMessageEvent } from 'react-native-webview';

import { useWallet } from '../../hook/useWallet'; // Assuming this hook provides viem client and account
import { DiscoverRouteProp } from '../../types'; // Assuming your navigation types
import { Account, Chain, Client, Transport, PublicClient } from 'viem';

const DiscoverScreen = () => {
  const webviewRef = useRef<WebViewType>(null);
  const route = useRoute<DiscoverRouteProp>();
  const { account, client, createWallet } = useWallet(); // Assuming switchChain might be available

  // Auto-connect wallet on mount if not already connected
  useEffect(() => {
    if (!account || !client) {
      const { account: newAccount } = createWallet();
      console.log("Auto-connected wallet:", newAccount.address);
      Alert.alert("Wallet connected", newAccount.address);
    }
  }, [account, client, createWallet]);

  const currentAddress = account?.address;
  const currentChainId = client?.chain?.id;
  const dappUrl = route.params?.dappUrl ?? 'https://supply-sphere.vercel.app';

  // --- Injected JavaScript Provider ---
  // We use useCallback to memoize this and only re-create if dependencies change.
  // This is crucial if you want to re-inject on address/chain changes.
  const injectedJavaScriptProvider = useCallback((address: string | undefined, chainId: number | undefined) => {
    // Only inject if address and chainId are available
    if (!address || !chainId) {
      return `
        (function() {
          console.warn("Wallet not ready, not injecting ethereum provider.");
        })();
        true;
      `;
    }

    const hexChainId = `0x${chainId.toString(16)}`;

    return `
      (function() {
        if (window.ethereum && window.ethereum.isMetaMask) {
          console.log("Ethereum provider already injected or exists.");
          return; // Avoid re-injecting if already present
        }

        let _selectedAddress = "${address}";
        let _chainId = "${hexChainId}";
        let _isConnected = true; // Assume connected initially

        const listeners = {
          accountsChanged: [],
          chainChanged: [],
          connect: [],
          disconnect: [],
          message: [],
        };

        const emit = (eventName, data) => {
          listeners[eventName]?.forEach(listener => listener(data));
        };

        window.ethereum = {
          isMetaMask: true,
          _metamask: {
            is        : true,
            get      : () => window.ethereum,
            set      : () => {}
          },
          _events: listeners, // Expose internal event listeners for debugging
          selectedAddress: _selectedAddress,
          chainId: _chainId,
          isConnected: () => _isConnected,

          // Standard EIP-1193 request method
          request: ({ method, params }) => {
            return new Promise((resolve, reject) => {
              const id = Math.random().toString(36).substring(7);
              const message = { id, method, params };
              console.log('WebView: Sending request to native:', message);

              const listener = (event) => {
                try {
                  const nativeMessage = JSON.parse(event.data);
                  if (nativeMessage.id === id) {
                    window.removeEventListener("message", listener);
                    console.log('WebView: Received response from native:', nativeMessage);
                    if (nativeMessage.error) {
                      reject(new Error(nativeMessage.error.message || 'Error from native'));
                    } else {
                      resolve(nativeMessage.result);
                    }
                  }
                } catch (e) {
                  console.error('WebView: Error parsing native message:', e);
                }
              };
              window.addEventListener("message", listener);
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
            });
          },

          // EIP-1193 event methods
          on: (eventName, handler) => {
            if (listeners[eventName]) {
              listeners[eventName].push(handler);
            } else {
              console.warn(\`Ethereum provider: Unsupported event "\${eventName}"\`);
            }
          },
          removeListener: (eventName, handler) => {
            if (listeners[eventName]) {
              listeners[eventName] = listeners[eventName].filter(l => l !== handler);
            }
          },

          // Deprecated methods for compatibility (Uniswap might still use them)
          send: (method, params) => {
            if (typeof method === 'string') { // new send method (EIP-1193 style)
              return window.ethereum.request({ method, params });
            } else { // old send method (e.g., web3.js 0.x)
              const payload = method;
              return new Promise((resolve, reject) => {
                window.ethereum.request({ method: payload.method, params: payload.params })
                  .then(result => resolve({ jsonrpc: "2.0", id: payload.id, result }))
                  .catch(error => reject({ jsonrpc: "2.0", id: payload.id, error }));
              });
            }
          },
          sendAsync: (payload, callback) => {
            window.ethereum.request({ method: payload.method, params: payload.params })
              .then(result => callback(null, { jsonrpc: "2.0", id: payload.id, result }))
              .catch(error => callback(error, null));
          }
        };

        // Dispatch events that DApps listen for
        // This is crucial for DApps to detect the provider and trigger connection flows
        window.dispatchEvent(new Event('ethereum#initialized'));
        emit('connect', { chainId: _chainId }); // Inform DApp about connection
        console.log('WebView: injected ethereum provider with address:', _selectedAddress, 'chainId:', _chainId);
      })();
      true;
    `;
  }, []);

  // --- Handle Messages from WebView (DApp requests) ---
  const handleMessage = async (event: WebViewMessageEvent) => {
    try {
      const { id, method, params } = JSON.parse(event.nativeEvent.data);
      let result: any;
      let error: { code?: number; message: string } | null = null;

      if (!client || !account) {
        error = { code: -32000, message: "Wallet not initialized." };
      } else {
        switch (method) {
          case 'eth_requestAccounts':
          case 'eth_accounts':
            result = [account.address];
            break;

          case 'eth_chainId':
            result = `0x${client?.chain?.id.toString(16)}`;
            break;

          case 'net_version': // Some DApps might still use this
            result = client?.chain?.id.toString();
            break;

          case 'personal_sign':
          case 'eth_sign': {
            const message = params[0]; // Message is typically the first param
            // Note: `eth_sign` takes an address as the second param, `personal_sign` doesn't
            // For simplicity, we assume `message` is the first parameter.
            try {
              result = await client.signMessage({
                account: account as Account,
                message: { raw: message }, // `viem` expects {raw: string | Uint8Array} or {text: string}
              });
            } catch (e: any) {
              console.error('Signing error:', e);
              error = { code: 4001, message: e.message || 'User rejected signature.' }; // User rejected
            }
            break;
          }

          case 'eth_sendTransaction': {
            const tx = params[0];
            try {
              // Ensure BigInt conversion for value and gas
              const hash = await client.sendTransaction({
                account: account as Account,
                to: tx.to,
                value: tx.value ? BigInt(tx.value) : undefined,
                gas: tx.gas ? BigInt(tx.gas) : undefined,
                data: tx.data,
                chain: undefined
              });
              result = hash;
            } catch (e: any) {
              console.error('Transaction error:', e);
              error = { code: 4001, message: e.message || 'User rejected transaction.' }; // User rejected
            }
            break;
          }

          case 'wallet_switchEthereumChain': {
            const chainIdParam = params[0].chainId; // e.g., "0x1"
            const targetChainId = parseInt(chainIdParam, 16);
            if (client?.chain?.id !== targetChainId) {
              try {
                // You would implement actual chain switching logic here.
                // This might involve updating your `useWallet` hook's state
                // and potentially recreating the viem client with the new chain.
                // For now, we'll just simulate it.
                // If you have `switchChain` in useWallet, call it:
                // await switchChain(targetChainId);

                // For a simple demo, if you don't actually switch, you might
                // return an error or silently succeed if the chain is "acceptable".
                console.warn(`Wallet: DApp requested to switch to chain ${targetChainId}. Current chain: ${client?.chain?.id}`);
                // If you don't support switching or don't want to switch, you could return an error:
                // error = { code: 4902, message: 'Unrecognized chain ID. Please add/switch chain manually.' };
                result = null; // As per EIP-3326, `wallet_switchEthereumChain` resolves with null on success.
              } catch (e: any) {
                console.error('Chain switch error:', e);
                error = { code: 4902, message: e.message || 'Failed to switch chain.' };
              }
            } else {
              result = null; // Already on the requested chain
            }
            break;
          }

          case 'wallet_addEthereumChain': {
            // You would implement logic to add a new chain to your wallet's supported chains.
            // This is more complex and involves managing a list of chains your wallet supports.
            // For now, we'll log and return an error or success based on your app's policy.
            console.log('DApp requested to add chain:', params[0]);
            error = { code: 4902, message: 'Adding custom chains not supported yet.' };
            break;
          }

          default:
            console.log('Unhandled Ethereum RPC method:', method, params);
            error = { code: -32601, message: `Method not supported: ${method}` }; // Method not found
            break;
        }
      }

      // Send response back to WebView
      const responseScript = `
        (function() {
          const messageEvent = new MessageEvent("message", {
            data: ${JSON.stringify(JSON.stringify({ id, result, error }))},
            origin: window.location.origin
          });
          window.dispatchEvent(messageEvent);
        })();
      `;
      webviewRef.current?.injectJavaScript(responseScript);

    } catch (e: any) {
      console.error('WebView handleMessage parsing/processing error:', e);
      // Attempt to send an error response back if parsing failed
      const errorResponseScript = `
        (function() {
          const id = ${event.nativeEvent.data ? JSON.parse(event.nativeEvent.data).id : null};
          const error = { code: -32700, message: 'Parse error or internal handler error: ${e.message}' };
          const messageEvent = new MessageEvent("message", {
            data: ${JSON.stringify(JSON.stringify({  Error }))},
            origin: window.location.origin
          });
          window.dispatchEvent(messageEvent);
        })();
      `;
      webviewRef.current?.injectJavaScript(errorResponseScript);
    }
  };

  // --- Re-inject Ethereum provider if address or chain changes ---
  useEffect(() => {
    if (webviewRef.current && currentAddress && currentChainId) {
      console.log("Re-injecting Ethereum provider due to address/chain change...");
      // Re-inject the script. This will overwrite the existing window.ethereum.
      webviewRef.current.injectJavaScript(injectedJavaScriptProvider(currentAddress, currentChainId));

      // After re-injection, also dispatch events to inform the DApp
      // This might be redundant if the DApp re-initializes on window.ethereum change,
      // but it's good practice.
      const scriptToDispatchEvents = `
        (function() {
          if (window.ethereum && window.ethereum.emit) {
            window.ethereum.emit('accountsChanged', ["${currentAddress}"]);
            window.ethereum.emit('chainChanged', "0x${currentChainId.toString(16)}");
          }
        })();
      `;
      webviewRef.current.injectJavaScript(scriptToDispatchEvents);
    }
  }, [currentAddress, currentChainId, injectedJavaScriptProvider]);


  return (
    <View style={styles.container}>
      {/* <WebView
        ref={webviewRef}
        source={{ uri: dappUrl }}
        // Inject initially. It will be re-injected if address/chain changes.
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptProvider(currentAddress, currentChainId)}
        onMessage={handleMessage}
        originWhitelist={['*']}
        javaScriptEnabled
        // If you encounter issues with DApps not reacting, consider these:
        // allowingFileAccess={true}
        // domStorageEnabled={true}
        // For debugging in development:
        // onNavigationStateChange={(navState) => console.log("Nav State:", navState.url)}
        // onLoadEnd={() => console.log("WebView finished loading.")}
      /> */}
      <WebView
  ref={webviewRef}
  source={{ uri: dappUrl }}
  injectedJavaScriptBeforeContentLoaded={injectedJavaScriptProvider(currentAddress, currentChainId)}
  onMessage={handleMessage}
  originWhitelist={['*']}
  javaScriptEnabled
  domStorageEnabled={true}
  allowFileAccess={true}
  allowUniversalAccessFromFileURLs={true}
  allowFileAccessFromFileURLs={true}
  scrollEnabled={true}
  nestedScrollEnabled={true}
  showsVerticalScrollIndicator={false}
  overScrollMode="always"
  renderToHardwareTextureAndroid={true}
  androidLayerType="hardware"
  bounces={false}
/>

    </View>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});