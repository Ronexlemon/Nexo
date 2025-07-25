/**
 * DiscoverScreen.tsx
 *
 * This React Native component serves as a DApp browser. It hosts a `WebView`
 * and establishes a bidirectional communication bridge to enable DApps to
 * interact with the native wallet. It uses `viem` for blockchain interactions.
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebView as WebViewType } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { WebViewMessageEvent } from 'react-native-webview';

// Import your custom wallet hooks and utilities.
// Adjust these paths based on your project structure.
import { useWallet } from '../../hook/useWallet'; // Provides viem client and account
import { Account, WalletClient } from 'viem'; // viem Account type
import { accountfromMnemonic } from '../../utills/web3'; // Utility to derive viem Account from mnemonic

// Import the EIP-1193 injected JavaScript provider.
// This is the function that returns the JavaScript string to be injected.
import injectedJavaScriptProvider from '../injector/walletInjector';
import { useAccount } from '../../hook/useAccount';
import { DiscoverRouteProp } from '../../types';
import { mnemonicToAccount } from 'viem/accounts';
import { useWalletClient } from '../../hook/useWalletClient';
import { ConfirmationTokenProps, ConfirmationTokenSend } from '../../components/ConfirmationTokensend';


const DiscoverScreen = () => {
  //const {openConfirmation,setOpenConfirmation} = React.useState<boolean>(false)
  const { account:acct, publicClient: client } = useWallet();
  const {account} = useAccount()
  const [loading, setLoading] = useState(true); // State to control the loading indicator for the WebView
  const mnemonic = account.mnemonic as string
    const acc = mnemonicToAccount(mnemonic)
    const walletClient = useWalletClient(acc);
  const [sendprops, setSendProps] = React.useState<ConfirmationTokenProps>({
    // confirm?: () => {},
    // cancel: () => {},
    token: {
      to: '0x0000000000000000000000000000000000000000',
      data: '0x',
    },
    open: false,
    walletclient: {
      client: walletClient as WalletClient, // must be a WalletClient instance
      account: '0x0000000000000000000000000000000000000000',
    },
  });
  const webviewRef = useRef<WebViewType>(null); // Reference to the WebView component instance
  const route = useRoute<DiscoverRouteProp>(); // Hook to access navigation route parameters



  // Access wallet state (account details and viem client) from your custom hook.
  

  // Derive the current wallet address and chain ID.
  // These values are dynamic and used to inject/re-inject the provider.
  const currentAddress = account?.publicAddress;
  const currentChainId = client?.chain?.id; // viem client's chain ID (number)
  const dappUrl = route.params?.dappUrl ?? 'https://app.uniswap.org/#/swap'; // Default DApp URL

  /**
   * `handleMessage` is the callback function for `WebView`'s `onMessage` prop.
   * It receives messages (EIP-1193 requests) sent from the DApp within the WebView.
   * This function processes each request using `viem` and sends a response back to the DApp.
   * `useCallback` is used to memoize this function for performance.
   */
  const handleMessage = useCallback(async (event: WebViewMessageEvent) => {
    let result: any = null; // Stores the successful result of the RPC call
    let error: { code: number; message: string; data?: any } | null = null; // Stores error information if the call fails
    let id: string | null = null; // Stores the unique request ID for matching responses

    try {
      const parsedData = JSON.parse(event.nativeEvent.data);
      id = parsedData.id; // Extract the request ID
      const { method, params } = parsedData; // Extract the RPC method and its parameters

      console.log('Native: Received DApp request from WebView:', { id, method, params });

      // Ensure the wallet is fully initialized and connected before proceeding.
      if (!client || !account || !currentAddress || currentChainId === undefined) {
        console.log("Client non issue connecting")
        error = { code: -32000, message: "Wallet not fully initialized or connected. Please ensure your wallet state is ready." };
        
      } else {
        // Derive the `viem` Account object from the mnemonic for signing operations.
        // This is crucial because `viem`'s `sendTransaction` and `signMessage` require an `Account` object.
        const connectedViemAccount = accountfromMnemonic(account.mnemonic as string) as Account;
        if (!connectedViemAccount) {
          console.log("No Accout non issue connecting")
          error = { code: -32000, message: "Failed to derive account from mnemonic. Please check wallet data." };
          
        } else {
          // --- Process DApp's EIP-1193 RPC Requests ---
          console.log("Start processsing")
            switch (method) {
                case 'eth_requestAccounts':
                case 'eth_accounts':
                    // These methods request access to user accounts.
                    // A user confirmation modal should be displayed.
                    await new Promise(resolve => {
                        Alert.alert(
                            "Connect Wallet",
                            `A DApp wants to connect to your account:\n${currentAddress}\n\nDo you allow this connection?`,
                            [
                                {
                                    text: "Deny",
                                    onPress: () => {
                                        error = { code: 4001, message: 'User rejected the request.' }; // EIP-1193 standard: User Rejected Request
                                        resolve(null);
                                    },
                                    style: "cancel"
                                },
                                {
                                    text: "Allow",
                                    onPress: () => {
                                        result = [currentAddress]; // Return the current address as the connected account.
                                        resolve(null);
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    });
                    break;

                case 'eth_chainId':
                    // Return the current blockchain ID in hex string format as DApps expect.
                    result = `0x${currentChainId.toString(16)}`;
                    break;

                case 'net_version':
                    // Return the current network ID in decimal string format (legacy method).
                    result = currentChainId.toString();
                    break;

                case 'personal_sign':
                case 'eth_sign': {
                    // Methods for signing messages. `personal_sign` is widely used.
                    const messageParam = params[0]; // The message content (often a string or hex string)
                    const addressParam = params[1]; // The address requesting the signature (optional for `personal_sign`, but often present)

                    // Ensure the signing request is for the currently connected account.
                    if (addressParam && addressParam.toLowerCase() !== currentAddress.toLowerCase()) {
                        error = { code: -32000, message: `Cannot sign for address ${addressParam}. Connected account is ${currentAddress}.` };
                        break;
                    }

                    // Display a user confirmation modal for signing the message.
                    await new Promise(resolve => {
                        Alert.alert(
                            "Sign Message",
                            `\nMethod: ${method}\nAccount: ${addressParam || currentAddress}\nMessage: ${messageParam.substring(0, 150)}${messageParam.length > 150 ? '...' : ''}\n\nDo you approve this signature?`,
                            [
                                {
                                    text: "Cancel",
                                    onPress: () => {
                                        error = { code: 4001, message: 'User rejected signature.' }; // User rejected the signature request.
                                        resolve(null);
                                    },
                                    style: "cancel"
                                },
                                {
                                    text: "Sign",
                                    onPress: async () => {
                                        try {
                                            // Use viem's `signMessage` to sign the message with the connected account.
                                            const signature = await walletClient?.signMessage({
                                                account: connectedViemAccount,
                                                message: { raw: messageParam }, // viem expects {raw: string | Uint8Array} or {text: string}
                                            });
                                            result = signature;
                                        } catch (e: any) {
                                            console.error('Native: viem signMessage error:', e);
                                            error = { code: -32002, message: e.message || 'Signature failed.' }; // Signature processing error.
                                        }
                                        resolve(null);
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    });
                    break;
                }

                case 'eth_signTypedData_v4': {
                    // Method for signing EIP-712 typed data (structured data).
                    const addressParam = params[0];
                    const jsonMessage = params[1]; // The EIP-712 data as a JSON string

                    // Ensure signing for the correct account.
                    if (addressParam.toLowerCase() !== currentAddress.toLowerCase()) {
                        error = { code: -32000, message: `Cannot sign for address ${addressParam}. Connected account is ${currentAddress}.` };
                        break;
                    }

                    try {
                        const parsedData = JSON.parse(jsonMessage);
                        const { domain, types, message } = parsedData; // Destructure EIP-712 components

                        // Display a user confirmation modal for signing typed data.
                        await new Promise(resolve => {
                            Alert.alert(
                                "Sign Typed Data (EIP-712)",
                                `\nAccount: ${addressParam}\nDomain: ${JSON.stringify(domain)}\nTypes: ${JSON.stringify(types)}\nMessage: ${JSON.stringify(message).substring(0, 150)}...\n\nDo you approve this signature?`,
                                [
                                    {
                                        text: "Cancel",
                                        onPress: () => {
                                            error = { code: 4001, message: 'User rejected signature.' };
                                            resolve(null);
                                        },
                                        style: "cancel"
                                    },
                                    {
                                        text: "Sign",
                                        onPress: async () => {
                                            try {
                                                // Use viem's internal `_signTypedData` for now.
                                                // NOTE: `_signTypedData` is an internal method and might change in future viem versions.
                                                // For robust production, consider using public viem hashing functions to hash the data
                                                // and then sign the hash with `signMessage`.
                                                // @ts-ignore - _signTypedData is not publicly typed.
                                                const signature = await client._signTypedData({
                                                    account: connectedViemAccount,
                                                    domain,
                                                    types,
                                                    message
                                                });
                                                result = signature;
                                            } catch (e: any) {
                                                console.error('Native: viem signTypedData_v4 error:', e);
                                                error = { code: -32002, message: e.message || 'Signing typed data failed.' };
                                            }
                                            resolve(null);
                                        }
                                    }
                                ],
                                { cancelable: false }
                            );
                        });
                    } catch (e: any) {
                        console.error('Native: Error parsing typed data or unexpected:', e);
                        error = { code: -32602, message: `Invalid typed data: ${e.message}` }; // Invalid parameters error.
                    }
                    break;
                }

              case 'eth_sendTransaction': {
               // setOpenConfirmation(true)
                console.log("The Send")
               
                    // Method for sending blockchain transactions.
                const tx = params; // The transaction object from the DApp.
                Alert.alert(`Sending tx ${tx}`)
                    // Convert hex string values (e.g., value, gas) to BigInt for viem, as it expects BigInts.
                    const value = "1" //tx.value ? BigInt(tx.value) : undefined;
                    const gas = "1" //tx.gas ? BigInt(tx.gas) : undefined;
                const gasPrice = "1"//tx.gasPrice ? BigInt(tx.gasPrice) : undefined;
                setSendProps({
                  // confirm: handleConfirmSignature,
                  // cancel: handleCancelSignature,
                  token: {
                    
                    to: tx.to,
                    data: tx.data,
                    nonce: tx.nonce ? Number(tx.nonce) : undefined,
                  },
                  open: true,
                  walletclient: {
                    client: walletClient as WalletClient,
                    account: connectedViemAccount 
                  },
                });

                    // Display a user confirmation modal for the transaction details.
                    // await new Promise(resolve => {
                    //     Alert.alert(
                    //         "Confirm Transaction",
                    //         `\nTo: ${tx.to || 'Contract Deployment'}\nValue: ${value ? `${Number(value) / 10**18} ETH` : '0 ETH'}\nGas Limit: ${gas ? gas.toString() : 'Auto'}\nData: ${tx.data ? tx.data.substring(0, 100) + '...' : 'None'}\n\nDo you approve this transaction?`,
                    //         [
                    //             {
                    //                 text: "Cancel",
                    //                 onPress: () => {
                    //                     error = { code: 4001, message: 'User rejected transaction.' }; // User rejected the transaction.
                    //                     resolve(null);
                    //                 },
                    //                 style: "cancel"
                    //             },
                    //             {
                    //                 text: "Approve",
                    //                 onPress: async () => {
                    //                     try {
                    //                         // Use viem's `sendTransaction` to sign and send the transaction.
                    //                         const hash = await walletClient?.sendTransaction({
                    //                           account: connectedViemAccount, // The viem Account object for signing.
                    //                           to: tx.to,
                    //                           // value: value,
                    //                           data: tx.data,
                    //                           // gas: gas,
                    //                           // gasPrice: gasPrice,
                    //                           nonce: tx.nonce ? Number(tx.nonce) : undefined,
                    //                           chain: undefined
                    //                         });
                    //                         result = hash; // Return the transaction hash on success.
                    //                     } catch (e: any) {
                    //                         console.error('Native: viem sendTransaction error:', e);
                    //                         error = { code: -32003, message: e.message || 'Transaction failed.' }; // Transaction execution error.
                    //                     }
                    //                     resolve(null);
                    //                 }
                    //             }
                    //         ],
                    //         { cancelable: false }
                    //     );
                // });
                 
                    break;
                }

                case 'wallet_switchEthereumChain': {
                    // DApp requests to switch the connected blockchain network.
                    const chainIdParam = params[0].chainId; // e.g., "0x1" from DApp
                    const targetChainId = parseInt(chainIdParam, 16); // Convert hex string to number.

                    if (currentChainId === targetChainId) {
                        result = null; // Already on the requested chain, resolve with null as per EIP-3326.
                    } else {
                        // Display a user confirmation modal for switching networks.
                        await new Promise(resolve => {
                            Alert.alert(
                                "Switch Network",
                                `A DApp wants to switch the network to Chain ID: ${targetChainId} (${chainIdParam}).\n\nDo you approve this?`,
                                [
                                    {
                                        text: "Cancel",
                                        onPress: () => {
                                            error = { code: 4001, message: 'User rejected chain switch.' };
                                            resolve(null);
                                        },
                                        style: "cancel"
                                    },
                                    {
                                        text: "Switch",
                                        onPress: async () => {
                                            // TODO: Implement actual chain switching logic in your `useWallet` hook.
                                            // This involves updating your viem client's chain configuration.
                                            // Example: If your useWallet hook had a `switchChain` method:
                                            // try {
                                            //   await useWallet.switchChain(targetChainId);
                                            //   result = null; // Resolve with null on success.
                                            // } catch (e: any) {
                                            //   error = { code: 4902, message: e.message || 'Failed to switch chain.' }; // Unrecognized Chain ID error.
                                            // }
                                            Alert.alert('Info', `Simulating chain switch to ${targetChainId}. Actual switch not yet implemented.`);
                                            error = { code: 4902, message: 'Chain switching is not fully implemented in this wallet.' }; // Placeholder error.
                                            resolve(null);
                                        }
                                    }
                                ],
                                { cancelable: false }
                            );
                        });
                    }
                    break;
                }

                case 'wallet_addEthereumChain': {
                    // DApp requests to add a new custom blockchain network to the wallet.
                    const newChain = params[0]; // Chain configuration object from DApp.
                    console.log('Native: DApp requested to add chain:', newChain);

                    // Display a user confirmation modal for adding a new network.
                    await new Promise(resolve => {
                        Alert.alert(
                            "Add Network",
                            `A DApp wants to add a new network:\n\nChain ID: ${newChain.chainId}\nName: ${newChain.chainName}\nRPC URL: ${newChain.rpcUrls[0]}\n\nDo you allow this?`,
                            [
                                {
                                    text: "Cancel",
                                    onPress: () => {
                                        error = { code: 4001, message: 'User rejected adding chain.' };
                                        resolve(null);
                                    },
                                    style: "cancel"
                                },
                                {
                                    text: "Add",
                                    onPress: async () => {
                                        // TODO: Implement actual logic to add this chain to your wallet's supported configurations.
                                        // This is a complex feature that involves storing custom RPC URLs, chain details,
                                        // and potentially dynamically configuring viem clients for new chains.
                                        Alert.alert('Info', 'Simulating add chain. Actual adding not yet implemented.');
                                        error = { code: 4902, message: 'Adding custom chains is not fully supported in this wallet.' };
                                        resolve(null);
                                    }
                                }
                            ],
                            { cancelable: false }
                        );
                    });
                    break;
                }

                // --- Handle Common Read-Only Methods via viem PublicClient ---
                // These methods typically fetch blockchain data without requiring user interaction.
                case 'eth_call':
                case 'eth_getBalance':
                case 'eth_getCode':
                case 'eth_getStorageAt':
                case 'eth_getTransactionCount':
                case 'eth_getBlockByNumber':
                case 'eth_getTransactionByHash':
                case 'eth_getTransactionReceipt':
                case 'eth_estimateGas':
                case 'eth_gasPrice':
                    try {
                        // Dynamically call the corresponding `viem` `PublicClient` method.
                        // Ensure your `client` from `useWallet` is configured as a `PublicClient`
                        // or has methods to handle these RPC calls.
                        if (method === 'eth_getBalance') {
                            result = await client.getBalance({ address: params[0] });
                        } else if (method === 'eth_call') {
                            result = await client.call(params[0]);
                        } else if (method === 'eth_estimateGas') {
                            result = await client.estimateGas(params[0]);
                        } else if (method === 'eth_gasPrice') {
                            result = await client.getGasPrice();
                        } else if (method === 'eth_getCode') {
                            result = await client.getBytecode({ address: params[0] });
                        } else if (method === 'eth_getTransactionCount') {
                            result = await client.getTransactionCount({ address: params[0] });
                        } else if (method === 'eth_getBlockByNumber') {
                            // `viem`'s `getBlock` takes a BigInt for `blockNumber` and a boolean for `includeTransactions`.
                            result = await client.getBlock({ blockNumber: BigInt(params[0]), includeTransactions: params[1] || false });
                        } else if (method === 'eth_getTransactionByHash') {
                            result = await client.getTransaction({ hash: params[0] });
                        } else if (method === 'eth_getTransactionReceipt') {
                            result = await client.getTransactionReceipt({ hash: params[0] });
                        } else {
                            // Fallback for other standard RPC methods not explicitly mapped to `viem` functions.
                            // This uses `client.request` which directly sends the RPC method.
                            // Ensure your `viem` `Client` instance is capable of direct JSON-RPC requests.
                            console.warn(`Native: Attempting to send RPC method "${method}" directly via client.request. This might require explicit mapping in your viem client configuration.`);
                            result = await (client as any).request({ method, params });
                        }
                    } catch (e: any) {
                        console.error(`Native: Error processing read-only method ${method}:`, e);
                        error = { code: -32003, message: e.message || 'RPC call failed.' }; // RPC call failed error.
                    }
                    break;

                default:
                    // Log and return an error for any unhandled or unsupported RPC methods.
                    console.warn('Native: Unhandled Ethereum RPC method:', method, params);
                    error = { code: -32601, message: `Method not supported by wallet: ${method}` }; // Method not found error.
                    break;
            }
        }
      }
    } catch (e: any) {
      // Catch any parsing errors or unexpected errors within this native `handleMessage` function itself.
      console.error('Native: WebView handleMessage parsing/processing error:', e);
      error = { code: -32700, message: `Parse error or internal handler error: ${e.message}` }; // Parse error.
    } finally {
        // --- Crucial: Always Send a Response Back to the WebView ---
        // This ensures the DApp's Promise (from `ethereum.request`) is always resolved or rejected,
        // preventing DApp requests from hanging indefinitely.
        // It uses the `window.rnWebviewEthereumBridge.handleResponse` method exposed by the injected JavaScript.
        if (webviewRef.current && id) {
            const responseScript = `
              if (window.rnWebviewEthereumBridge && typeof window.rnWebviewEthereumBridge.handleResponse === 'function') {
                window.rnWebviewEthereumBridge.handleResponse(${JSON.stringify(id)}, ${JSON.stringify(error)}, ${JSON.stringify(result)});
              } else {
                console.error('WebView bridge not found or not ready to handle response for ID:', ${JSON.stringify(id)});
              }
              true; // injectJavaScript always needs to return true.
            `;
            webviewRef.current.injectJavaScript(responseScript);
        }
    }
  }, [account, client, currentAddress, currentChainId]); // Dependencies for `useCallback`: This function re-creates if wallet state changes.

  /**
   * `useEffect` hook to manage the injection and re-injection of the Ethereum provider.
   * This ensures the provider is present when the component mounts and is updated
   * whenever the wallet's address or connected chain ID changes.
   */
  useEffect(() => {
    // Only proceed with injection if all necessary wallet data is available.
    if (webviewRef.current && currentAddress && currentChainId !== undefined) {
      const hexChainId = `0x${currentChainId.toString(16)}`; // Convert chain ID to hex string for injection.
      console.log("Native: Initiating/Re-injecting Ethereum provider due to wallet state change:", { currentAddress, hexChainId });

      // Step 1: Inject the main EIP-1193 provider script.
      // This call executes the `injectedJavaScriptProvider` function (from walletInjector.ts),
      // which returns the JavaScript string to be run inside the WebView.
      const scriptToInject = injectedJavaScriptProvider(currentAddress, hexChainId);
      webviewRef.current.injectJavaScript(scriptToInject);

      // Step 2: After a short delay, dispatch crucial EIP-1193 events to the DApp.
      // This is important because DApps might load their own scripts very quickly,
      // and events are how they are notified of the provider's readiness and initial state.
      const dispatchEventsScript = `
        (function() {
          // Check if the window.rnWebviewEthereumBridge is available.
          if (window.rnWebviewEthereumBridge && typeof window.rnWebviewEthereumBridge.emitEvent === 'function') {
            // Emit 'connect' event to signal that the wallet is connected and ready.
            window.rnWebviewEthereumBridge.emitEvent('connect', { chainId: '${hexChainId}' });
            // Explicitly update accounts and chain ID.
            // These calls also trigger 'accountsChanged' and 'chainChanged' events if values have indeed changed.
            window.rnWebviewEthereumBridge.updateAccounts(["${currentAddress}"]);
            window.rnWebviewEthereumBridge.updateChainId('${hexChainId}');
          } else {
            console.error('Native: WebView bridge for event dispatch not found. Events might not be delivered.');
          }
        })();
        true; // injectJavaScript requires a return value of true.
      `;
      // Use `setTimeout` to ensure the `window.rnWebviewEthereumBridge` object is fully initialized
      // in the WebView's JavaScript context before attempting to call its methods.
      setTimeout(() => {
        webviewRef.current?.injectJavaScript(dispatchEventsScript);
      }, 100); // A small delay (e.g., 100ms) often suffices; adjust if DApps consistently miss initial events.
    }
  }, [currentAddress, currentChainId]); // Dependencies: This effect re-runs whenever the wallet address or chain ID changes.

  return (
    <View style={styles.container}>
      {/* Loading overlay displayed while the WebView content is loading. */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading DApp...</Text>
        </View>
      )}
      <WebView
        ref={webviewRef} // Assign ref to control the WebView programmatically.
        source={{ uri: dappUrl }} // The URL of the DApp to load.
        // `injectedJavaScriptBeforeContentLoaded` is crucial for injecting the provider
        // before the DApp's own scripts try to detect `window.ethereum`.
        // If wallet data isn't ready, inject a minimal script with a warning.
        injectedJavaScriptBeforeContentLoaded={
            (currentAddress && currentChainId !== undefined)
            ? injectedJavaScriptProvider(currentAddress, `0x${currentChainId.toString(16)}`)
            : `(function() { console.warn("Wallet not yet ready, Ethereum provider will be injected once data is available."); })(); true;`
        }
        onMessage={handleMessage} // Callback for messages sent from the WebView (DApp requests).
        originWhitelist={['*']} // Allows loading content from any origin (be cautious in production for security).
        javaScriptEnabled={true} // Essential to allow DApp JavaScript to run.
        domStorageEnabled={true} // Enables localStorage and sessionStorage for the DApp.
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true} // Specifically for Android to allow file access from URLs.
        scrollEnabled={true}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        overScrollMode="always" // Android specific: controls over-scrolling behavior.
        renderToHardwareTextureAndroid={true} // Android specific: improves rendering performance.
        androidLayerType="hardware" // Android specific: controls rendering layer type.
        bounces={false} // iOS specific: disables the scroll bounce effect.

        // WebView lifecycle event handlers for managing the loading indicator.
        onLoadStart={() => {
            setLoading(true); // Show loading indicator when loading starts.
            console.log('Native: WebView load started for:', dappUrl);
        }}
        onLoadEnd={() => {
            setLoading(false); // Hide loading indicator when loading finishes.
            console.log('Native: WebView load finished.');
        }}
        onLoad={() => console.log('Native: WebView initial page load completed.')}
        onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('Native: WebView error during load:', nativeEvent.description);
            Alert.alert('WebView Error', `Failed to load DApp: ${nativeEvent.description}`);
        }}
        // `setSupportMultipleWindows={false}` is crucial to prevent DApps from attempting
        // to open new browser tabs/windows, which isn't supported directly in WebView.
        setSupportMultipleWindows={false}
      />
     {sendprops && <ConfirmationTokenSend {...sendprops} />}
    </View>
  );
};

// Stylesheet for the React Native components.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the WebView takes up available space.
  },
  loadingOverlay: {
    position: 'absolute', // Position over the WebView.
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)', // Semi-transparent white background.
    zIndex: 100, // Ensure it's rendered above the WebView content.
  },
  loadingText: {
    marginTop: 10,
    color: '#333',
    fontSize: 16,
  }
});

export default DiscoverScreen;
