/**
 * walletInjector.ts
 *
 * This script is injected into a React Native WebView to expose an EIP-1193 compliant
 * `window.ethereum` provider. It facilitates bidirectional communication between the DApp
 * running in the WebView and the native React Native wallet application.
 *
 * DApp requests (e.g., eth_requestAccounts, eth_sendTransaction) are sent to native via
 * `window.ReactNativeWebView.postMessage`.
 *
 * Native responses and events (e.g., transaction hashes, accountsChanged) are sent back to
 * the DApp via methods exposed on `window.rnWebviewEthereumBridge`.
 */

const injectedJavaScriptProvider = (walletAddress: string, chainId: string) => `
(function () {
  // Prevent re-injection if an EIP-1193 provider (especially MetaMask's) already exists.
  // This helps avoid conflicts if multiple scripts try to inject providers.
  if (window.ethereum && window.ethereum.isMetaMask) {
    console.warn('EIP-1193 Provider: An existing MetaMask-like provider was detected. Skipping injection.');
    return;
  }

  // Initial state for the provider, set from values passed by the native side.
  // These variables will be updated dynamically by the native app.
  let currentAccounts = ["${walletAddress}"]; // Array of connected account addresses
  let currentChainId = "${chainId}";         // Current blockchain ID in hex (e.g., "0x1" for Ethereum Mainnet)

  // A Map to store Promises for pending DApp requests.
  // When a DApp calls ethereum.request, a Promise is created and stored here.
  // The native side will later resolve or reject this Promise by calling handleResponse.
  const pendingRequests = new Map();

  // Simple custom Event Emitter for EIP-1193 events (e.g., 'accountsChanged', 'chainChanged').
  // DApps subscribe to these events using ethereum.on().
  class EventEmitter {
    constructor() {
      this.events = {}; // Stores event names as keys, and arrays of listener functions as values.
    }

    /**
     * Registers an event listener for a specified event.
     * @param {string} eventName - The name of the event to listen for.
     * @param {function} listener - The callback function to execute when the event occurs.
     */
    on(eventName, listener) {
      if (typeof listener !== 'function') {
        console.error('EIP-1193 Provider: Event listener must be a function.');
        return;
      }
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(listener);
    }

    /**
     * Removes a previously registered event listener.
     * @param {string} eventName - The name of the event.
     * @param {function} listener - The callback function to remove.
     */
    removeListener(eventName, listener) {
      if (!this.events[eventName]) return;
      this.events[eventName] = this.events[eventName].filter(l => l !== listener);
    }

    /**
     * Emits an event, calling all registered listeners for that event.
     * @param {string} eventName - The name of the event to emit.
     * @param {...any} args - Arguments to pass to the event listeners.
     */
    emit(eventName, ...args) {
      if (!this.events[eventName]) return;
      this.events[eventName].forEach(listener => {
        try {
          listener(...args); // Execute each listener, wrapped in a try-catch for robustness.
        } catch (error) {
          console.error(\`EIP-1193 Provider: Error in '\${eventName}' event listener:\`, error);
        }
      });
    }
  }

  const emitter = new EventEmitter();

  /**
   * Generates a unique ID for each request sent from the WebView to native.
   * This ID is used to match responses back to their original requests.
   * @returns {string} A unique request ID.
   */
  function generateRequestId() {
    return Date.now().toString() + Math.random().toString(36).substring(2, 11);
  }

  /**
   * Sends a message (an EIP-1193 request) from the WebView to the native React Native app.
   * This function utilizes window.ReactNativeWebView.postMessage.
   * @param {object} payload - The request payload containing id, method, and params.
   * @returns {Promise<void>} A Promise that resolves if the message is sent, or rejects if the bridge is unavailable.
   */
  function sendToReactNative(payload) {
    if (!window.ReactNativeWebView || typeof window.ReactNativeWebView.postMessage !== 'function') {
      console.error('EIP-1193 Provider: ReactNativeWebView.postMessage is not available. Communication channel not ready.');
      return Promise.reject(new Error('WebView communication channel not ready.'));
    }
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }

  /**
   *window.rnWebviewEthereumBridge serves as the explicit bidirectional communication channel
   * from the native React Native side back into the WebView's JavaScript context.
   * Native code will call methods on this object to:
   * 1. Resolve or reject DApp requests.
   * 2. Emit EIP-1193 events.
   * 3. Update the provider's internal state (accounts, chain ID).
   */
  window.rnWebviewEthereumBridge = {
    /**
     * Called by React Native to deliver the result or error of a DApp request.
     * @param {string} id - The ID of the original request.
     * @param {object | null} error - An error object if the request failed (e.g., {code: 4001, message: "User rejected"}), or null if successful.
     * @param {any} result - The successful result of the RPC call.
     */
    handleResponse: (id, error, result) => {
      const promiseCallbacks = pendingRequests.get(id);
      if (promiseCallbacks) {
        pendingRequests.delete(id); // Clean up the stored promise callbacks
        if (error) {
          promiseCallbacks.reject(error); // Reject the DApp's Promise
        } else {
          promiseCallbacks.resolve(result); // Resolve the DApp's Promise
        }
      } else {
        console.warn('EIP-1193 Provider: Received response for an unknown request ID:', id);
      }
    },

    /**
     * Called by React Native to emit a standard EIP-1193 event (e.g., 'accountsChanged', 'chainChanged').
     * This allows the native app to notify DApps of state changes.
     * @param {string} eventName - The name of the event to emit.
     * @param {any} eventData - The data associated with the event.
     */
    emitEvent: (eventName, eventData) => {
      emitter.emit(eventName, eventData);
    },

    /**
     * Called by React Native to update the provider's internal chain ID and emit a 'chainChanged' event.
     * @param {string} newChainId - The new chain ID in hex string format (e.g., "0x1").
     */
    updateChainId: (newChainId) => {
      if (currentChainId !== newChainId) {
        currentChainId = newChainId;
        emitter.emit('chainChanged', currentChainId);
        // It's also common for DApps to re-check connection after chain changes.
        // Emitting 'connect' with the new chainId helps some DApps re-initialize.
        emitter.emit('connect', { chainId: currentChainId });
        // Update networkVersion property as well for consistency.
        provider.networkVersion = parseInt(currentChainId, 16).toString();
      }
    },

    /**
     * Called by React Native to update the provider's internal accounts and emit an 'accountsChanged' event.
     * @param {string[]} newAccounts - An array of account addresses (e.g., ["0xabc..."]).
     */
    updateAccounts: (newAccounts) => {
      const oldAccounts = currentAccounts;
      currentAccounts = newAccounts;
      // Only emit 'accountsChanged' if the accounts array has actually changed.
      if (JSON.stringify(oldAccounts) !== JSON.stringify(newAccounts)) {
        emitter.emit('accountsChanged', currentAccounts);
        // Update the selectedAddress property to reflect the first account.
        provider.selectedAddress = currentAccounts.length > 0 ? currentAccounts[0] : null;
      }
    }
  };

  /**
   * The main EIP-1193 compliant Ethereum provider object.
   * This object is assigned to  window.ethereum  and is the primary interface for DApps.
   */
  const provider = {
    // --- Common flags DApps might check for provider detection ---
    isMetaMask: false,     // Explicitly false, as this is a custom wallet provider.
    isNexo: true,          // A custom flag to identify your specific wallet (e.g., Nexo).
    isInjected: true,      // Indicates that this provider was injected into the JavaScript context.
    isCoinbaseWallet: false, // Example: explicitly false if not Coinbase Wallet.

    // --- EIP-1193 Required Properties --
    selectedAddress: currentAccounts[0] || null, // The currently selected Ethereum address (first in currentAccounts).
    chainId: currentChainId,                     // The current blockchain ID in hex string format.
    networkVersion: parseInt(currentChainId, 16).toString(), // The current network ID in decimal string format (legacy).
    autoRefreshOnNetworkChange: false,           // Typically set to false for modern wallets to prevent unexpected page reloads.

    // --- EIP-1193 Required Methods ---
    /**
     * Checks if the provider is currently connected to an Ethereum node.
     * Assumed to be true if this provider script is successfully injected and running.
     * @returns {boolean} True if connected.
     */
    isConnected: () => true,

    /**
     * The primary entry point for DApps to send JSON-RPC requests to the provider.
     * It handles some common read-only requests locally (for efficiency) and forwards
     * others (especially those requiring user interaction or complex network calls)
     * to the native React Native application for processing.
     * @param {object} args - An object containing the method (string) and optional params (array).
     * @returns {Promise<any>} A Promise that resolves with the RPC result or rejects with an error.
     */
    request: async ({ method, params }) => {
      console.log('EIP-1193 Provider: DApp Request received -', method, params);

      // Handle common read-only methods directly in the WebView for performance.
      // These methods do not require user interaction or complex native logic.
      switch (method) {
        case 'eth_accounts':
          // Returns an array of currently connected accounts.
          return currentAccounts;
        case 'eth_chainId':
          // Returns the current blockchain ID in hex string format.
          return currentChainId;
        case 'net_version':
          // Returns the current network ID in decimal string format (legacy, but still used by some DApps).
          return parseInt(currentChainId, 16).toString();
        case 'web3_clientVersion':
          // Returns a string identifying the client software (your wallet).
          return 'NexoWallet/React-Native-WebView-Provider';
        // For 'eth_requestAccounts', we pass it to native, as it requires user confirmation.
        // Other read-only methods like 'eth_call', 'eth_getBalance' are also passed to native
        // so that the native app (using viem or similar) can make the actual RPC call to a node.
      }

      // For all other methods (e.g., 'eth_sendTransaction', 'personal_sign', 'wallet_switchEthereumChain',
      // or other RPC calls that require a connection to a real node),
      // forward the request to the native React Native side for processing.
      const requestId = generateRequestId(); // Generate a unique ID for this request.
      const payload = { id: requestId, method, params };

      return new Promise((resolve, reject) => {
        // Store the resolve/reject callbacks in pendingRequests so handleResponse
        // can fulfill this promise when the native side responds.
        pendingRequests.set(requestId, { resolve, reject });
        sendToReactNative(payload); // Send the request to the native app.
      });
    },

    // --- EIP-1193 Event Emitter Methods ---
    /**
     * Registers an event listener on the provider.
     * DApps use this to subscribe to events like 'accountsChanged', 'chainChanged', etc.
     * @param {string} eventName - The name of the event to listen for.
     * @param {function} listener - The callback function to execute when the event fires.
     */
    on: (eventName, listener) => emitter.on(eventName, listener),

    /**
     * Removes an event listener from the provider.
     * @param {string} eventName - The name of the event from which to remove the listener.
     * @param {function} listener - The callback function to remove.
     */
    removeListener: (eventName, listener) => emitter.removeListener(eventName, listener),

    // --- Legacy send and sendAsync methods for backward compatibility ---
    // These methods are deprecated in the EIP-1193 standard but are still used by older DApps.
    // They are internally mapped to the modern request method.
    send: (methodOrPayload, callback) => {
      if (typeof methodOrPayload === 'string') {
        // Handles provider.send('eth_accounts', callback) or provider.send('eth_accounts', [...params], callback)
        const method = methodOrPayload;
        // Arguments can be tricky: callback might actually be the params array, or the true callback.
        const params = Array.isArray(callback) ? callback : [];
        const finalCallback = Array.isArray(callback) ? arguments[2] : callback; // Get the actual callback function.

        provider.request({ method, params })
          .then(result => {
            if (typeof finalCallback === 'function') {
              // Respond in the legacy JSON-RPC format for callbacks.
              finalCallback(null, { jsonrpc: '2.0', id: 1, result }); // id can be arbitrary for legacy calls.
            }
          })
          .catch(error => {
            if (typeof finalCallback === 'function') {
              finalCallback(error, null); // Pass error to callback.
            }
          });
      } else {
        // Handles provider.send({method: 'eth_accounts', id: 1, params: []}, callback)
        const payload = methodOrPayload;
        const finalCallback = callback;

        provider.request({ method: payload.method, params: payload.params || [] })
          .then(result => {
            if (typeof finalCallback === 'function') {
              finalCallback(null, { jsonrpc: '2.0', id: payload.id, result });
            }
          })
          .catch(error => {
            if (typeof finalCallback === 'function') {
              finalCallback(error, null);
            }
          });
      }
    },
    // sendAsync is functionally identical to send for compatibility.
    sendAsync: function (payload, callback) {
      this.send(payload, callback);
    },
  };

  // --- Final Setup: Expose Provider and Dispatch Initial Events ---
  // Assign the constructed provider object to window.ethereum.
  // This is the standard global property DApps look for.
  Object.defineProperty(window, 'ethereum', {
    value: provider,
    writable: true,     // Allows other scripts to overwrite if needed (less common now).
    configurable: true, // Allows deleting or redefining the property.
  });

  // Emit the 'connect' event immediately after the provider is available.
  // This is a critical signal for DApps to know the wallet is connected and ready.
  emitter.emit('connect', { chainId: currentChainId });

  // Dispatch custom DOM events that DApps (especially those checking for MetaMask)
  // might listen for to detect provider availability.
  window.dispatchEvent(new Event('ethereum#initialized'));
  window.dispatchEvent(new Event('DOMContentLoaded')); // Some DApps may wait for this too.

  console.log('EIP-1193 Provider Injected: window.ethereum is now available in the WebView.');
})();
`;

export default injectedJavaScriptProvider;
