export const INDEXER_URL = import.meta.env.VITE_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v4/graphql';
export const INDEXER_WS = import.meta.env.VITE_INDEXER_WS || 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws';

export const getContractAddress = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('DEPLOYED_CONTRACT_ADDRESS') || import.meta.env.VITE_CONTRACT_ADDRESS || '';
  }
  return import.meta.env.VITE_CONTRACT_ADDRESS || '';
};

export const setContractAddress = (address: string) => {
  localStorage.setItem('DEPLOYED_CONTRACT_ADDRESS', address.trim());
};

export const getExplorerContractUrl = (address = getContractAddress(), network = 'preprod') =>
  address ? `https://explorer.1am.xyz/contract/${address}?network=${network}` : 'https://explorer.1am.xyz';

export const getExplorerTxUrl = (txId: string, network = 'preprod') =>
  `https://explorer.1am.xyz/tx/${txId}?network=${network}`;

export const DEFAULT_GATE_THRESHOLD = 72n;
export const DEFAULT_ENTRY_LIMIT = 144n;
