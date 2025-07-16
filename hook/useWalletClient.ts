import { useMemo } from "react";
import { createWalletClient, http } from "viem";

import type { Account, WalletClient } from "viem";
import { crossfi } from "../chains/crossfi";

export const useWalletClient = (account: Account | undefined): WalletClient | undefined => {
  const walletClient = useMemo(() => {
    if (!account) return undefined;

    return createWalletClient({
      account,
      chain: crossfi,
      transport: http("https://rpc.testnet.ms"),
    });
  }, [account]);

  return walletClient;
};
