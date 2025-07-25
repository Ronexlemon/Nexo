import { erc20Abi, decodeFunctionData, Hex } from "viem";

/**
 * Decodes transaction data using the standard ERC20 ABI.
 * @param txData The transaction data as a Hex string.
 * @returns The decoded function name and arguments if it matches an ERC20 function, otherwise returns null.
 */
const decodedFunction = (txData: Hex) => {
  try {
    const decoded = decodeFunctionData({
      abi: erc20Abi,
      data: txData,
    });
    return decoded;
  } catch (error) {
    // This block will be executed if decodeFunctionData fails.
    // This happens when the function selector in txData does not match any
    // function in the erc20Abi.
    return null;
  }
};

export  {decodedFunction}