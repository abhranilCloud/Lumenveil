import { useCallback, useEffect, useState } from 'react';
import { ledger } from '../managed/contract/index.js';
import { getContractAddress, INDEXER_URL, INDEXER_WS } from '../config';
import { createPatchedPublicDataProvider } from '../lib/midnight';

let provider: ReturnType<typeof createPatchedPublicDataProvider> | null = null;
const getProvider = () => provider || (provider = createPatchedPublicDataProvider(INDEXER_URL, INDEXER_WS));

export function useContractState(interval = 5000, requestedAddress?: string) {
  const [ledgerState, setLedgerState] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const address = requestedAddress || getContractAddress();

  const refetch = useCallback(async () => {
    if (!address) { setIsLoading(false); setLedgerState(null); return; }
    try {
      setIsLoading(true);
      const state = await getProvider().queryContractState(address);
      setLedgerState(state?.data ? ledger(state.data) : null);
      setError(null); setLastUpdate(new Date());
    } catch (cause: any) {
      setError(cause?.message || 'Unable to read the Midnight indexer.');
    } finally { setIsLoading(false); }
  }, [address]);

  useEffect(() => { void refetch(); const timer = window.setInterval(() => void refetch(), interval); return () => window.clearInterval(timer); }, [refetch, interval]);
  return { ledgerState, isLoading, error, lastUpdate, refetch };
}
