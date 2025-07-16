import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { selectAllTokens, selectTokenByAddress } from '../store/selector';
import { addToken, clearTokens, setTokens, updateTokenBalance } from '../store/tokenSlice';


export const useTokens = () => {
  const dispatch = useDispatch();

  const tokens = useSelector(selectAllTokens);

  const addNewToken = useCallback((tokenData: Parameters<typeof addToken>[0]) => {
    dispatch(addToken(tokenData));
  }, [dispatch]);

  const updateBalance = useCallback((address: string, balance: string) => {
    dispatch(updateTokenBalance({ address, balance }));
  }, [dispatch]);

  const bulkSetTokens = useCallback((tokenList: Parameters<typeof setTokens>[0]) => {
    dispatch(setTokens(tokenList));
  }, [dispatch]);

  const resetTokens = useCallback(() => {
    dispatch(clearTokens());
  }, [dispatch]);

  const getTokenByAddress = useCallback(
    (address: string) => useSelector(selectTokenByAddress(address)),
    []
  );

  return {
    tokens,
    addNewToken,
    updateBalance,
    bulkSetTokens,
    resetTokens,
    getTokenByAddress,
  };
};
