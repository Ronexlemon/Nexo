// // eip1193/walletInjector.js

// const walletInjector =(walletAddress,chainId)=> `
// (function() {
//   const accounts = ["${walletAddress}"];

//   const provider = {
//     isMetaMask: false,
//     isInjected: true,
//     isConnected: () => true,

//     request: async ({ method, params }) => {
//       switch (method) {
//         case 'eth_requestAccounts':
//         case 'eth_accounts':
//           return accounts;

//         case 'eth_chainId':
//           return '${chainId}'; // Replace with the actual chainId, e.g., '0xa4ec' for Celo

//         case 'eth_sendTransaction':
//           const tx = params[0];
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             type: 'sendTransaction',
//             payload: tx
//           }));
//           return tx; // Replace when tx is sent

//         case 'personal_sign':
//           const [message, from] = params;
//           window.ReactNativeWebView.postMessage(JSON.stringify({
//             type: 'personal_sign',
//             payload: { message, from }
//           }));
//           return '0xSignaturePlaceholder'; // Replace when signed

//         default:
//           throw new Error('Unsupported method: ' + method);
//       }
//     },

//     on: (event, callback) => {
//       console.log('EIP1193: on event registered:', event);
//     },

//     removeListener: (event, callback) => {
//       console.log('EIP1193: removeListener called:', event);
//     },
//   };

//   window.ethereum = provider;
//   window.dispatchEvent(new Event('ethereum#initialized'));
// })();
// `;

// export default walletInjector;


// eip1193/walletInjector.js

const injectedJavaScriptProvider = (walletAddress, chainId) => `
(function () {
  const accounts = ["${walletAddress}"];
  const pendingRequests = {};
  const listeners = {
    accountsChanged: [],
    chainChanged: [],
    connect: [],
    disconnect: [],
    message: [],
  };

  function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(fn => fn(data));
    }
  }

  // Listen for messages from React Native
  window.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      const { id, result, error, eventName, eventData } = data;

      if (id && pendingRequests[id]) {
        if (error) {
          pendingRequests[id].reject(error);
        } else {
          pendingRequests[id].resolve(result);
        }
        delete pendingRequests[id];
      }

      // Emit events sent from native
      if (eventName && listeners[eventName]) {
        emit(eventName, eventData);
      }
    } catch (err) {
      console.error('Error parsing message from React Native:', err);
    }
  });

  const provider = {
    isMetaMask: false,
    isInjected: true,
    isNexo: true,
    selectedAddress: accounts[0],
    isConnected: () => true,

    request: ({ method, params }) => {
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return Promise.resolve(accounts);

        case 'eth_chainId':
          return Promise.resolve('${chainId}');

        case 'eth_sendTransaction':
        case 'personal_sign':
        case 'eth_sign':
        case 'eth_signTypedData_v4': {
          const id = generateId();
          let payload;

          if (method === 'personal_sign') {
            payload = { message: params[0], from: params[1] };
          } else if (method === 'eth_sign') {
            payload = { from: params[0], message: params[1] };
          } else if (method === 'eth_signTypedData_v4') {
            payload = { from: params[0], data: params[1] };
          } else {
            payload = params[0];
          }

          window.ReactNativeWebView.postMessage(JSON.stringify({
            id,
            method,
            params: payload
          }));

          return new Promise((resolve, reject) => {
            pendingRequests[id] = { resolve, reject };
          });
        }

        default:
          return Promise.reject(new Error('Unsupported method: ' + method));
      }
    },

    on: (event, callback) => {
      if (listeners[event]) {
        listeners[event].push(callback);
      }
    },

    removeListener: (event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(fn => fn !== callback);
      }
    },

    emit: (event, data) => emit(event, data),

    // Legacy support
    send: (methodOrPayload, paramsOrCallback) => {
      if (typeof methodOrPayload === 'string') {
        return provider.request({ method: methodOrPayload, params: paramsOrCallback });
      }

      const payload = methodOrPayload;
      const callback = paramsOrCallback;
      provider.request({ method: payload.method, params: payload.params })
        .then(result => callback(null, { jsonrpc: '2.0', id: payload.id, result }))
        .catch(error => callback(error, null));
    },

    sendAsync: function () {
      return this.send.apply(this, arguments);
    }
  };

  window.ethereum = provider;
  window.dispatchEvent(new Event('ethereum#initialized'));
})();
`;

export default injectedJavaScriptProvider;
