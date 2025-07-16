import { RootState } from "./redux";


export const selectAllTokens = (state: RootState) => state.tokens.tokens;

export const selectTokenByAddress = (address: string) => (state: RootState) =>
  state.tokens.tokens.find(
    (token) => token.address.toLowerCase() === address.toLowerCase()
  );
