import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { ContractState } from '@midnight-ntwrk/compact-runtime';
import type { MidnightProvider, WalletProvider } from '@midnight-ntwrk/midnight-js-types';

export function toHex(bytes: Uint8Array | number[] | string): string {
  if (typeof bytes === 'string') return bytes.replace(/^0x/, '');
  return Array.from(bytes, (b) => Number(b).toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const normalized = hex.replace(/^0x/, '');
  if (normalized.length % 2 || !/^[0-9a-f]*$/i.test(normalized)) throw new Error('Invalid hexadecimal secret.');
  const result = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < result.length; i += 1) result[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  return result;
}

export function createPrivateStateProvider() {
  let scope = '';
  const state = new Map<string, unknown>();
  const signingKeys = new Map<string, unknown>();
  const key = (id: string) => `${scope}:${id}`;
  return {
    setContractAddress(address: string) { scope = address; },
    async set(id: string, value: unknown) { state.set(key(id), value); },
    async get(id: string) { return state.get(key(id)) ?? null; },
    async remove(id: string) { state.delete(key(id)); },
    async clear() { state.clear(); },
    async setSigningKey(address: string, value: unknown) { signingKeys.set(address, value); },
    async getSigningKey(address: string) { return signingKeys.get(address) ?? null; },
    async removeSigningKey(address: string) { signingKeys.delete(address); },
    async clearSigningKeys() { signingKeys.clear(); },
    async exportPrivateStates() { throw new Error('Private state export is not enabled in this browser session.'); },
    async importPrivateStates() { throw new Error('Private state import is not enabled in this browser session.'); },
    async exportSigningKeys() { throw new Error('Signing key export is not enabled in this browser session.'); },
    async importSigningKeys() { throw new Error('Signing key import is not enabled in this browser session.'); },
  };
}

export function createPatchedPublicDataProvider(queryUrl: string, subscriptionUrl: string) {
  const base = indexerPublicDataProvider(queryUrl, subscriptionUrl);
  return {
    ...base,
    async queryContractState(contractAddress: string, config?: unknown) {
      if (config) return base.queryContractState(contractAddress, config as any);
      const response = await fetch(queryUrl, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          query: 'query LUMENVEIL_STATE($address: HexEncoded!) { contractAction(address: $address) { state } }',
          variables: { address: contractAddress },
        }),
      });
      if (!response.ok) throw new Error(`Indexer request failed (${response.status}).`);
      const payload = await response.json();
      if (payload.errors?.length) throw new Error(payload.errors.map((error: any) => error.message).join('; '));
      const action = payload.data?.contractAction;
      return action ? ContractState.deserialize(fromHex(action.state)) : null;
    },
  };
}

export type ConnectedSession = {
  api: any;
  config: any;
  unshieldedAddress: string;
  providers: {
    privateStateProvider: ReturnType<typeof createPrivateStateProvider>;
    publicDataProvider: ReturnType<typeof createPatchedPublicDataProvider>;
    zkConfigProvider: FetchZkConfigProvider<any>;
    proofProvider: any;
    walletProvider: WalletProvider;
    midnightProvider: MidnightProvider;
  };
};

export async function createConnectedSession(api: any): Promise<ConnectedSession> {
  const [config, unshielded, shielded] = await Promise.all([
    api.getConfiguration(),
    api.getUnshieldedAddress(),
    api.getShieldedAddresses(),
  ]);
  setNetworkId(config.networkId);

  const zkConfigProvider = new FetchZkConfigProvider(
    new URL('/managed', window.location.origin).toString(),
    window.fetch.bind(window),
  );
  const provingProvider = await api.getProvingProvider(zkConfigProvider);
  const proofProvider = {
    async proveTx(unprovenTx: any) {
      const { CostModel } = await import('@midnight-ntwrk/ledger-v8');
      return unprovenTx.prove(provingProvider, CostModel.initialCostModel());
    },
  };
  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => shielded.shieldedCoinPublicKey,
    getEncryptionPublicKey: () => shielded.shieldedEncryptionPublicKey,
    balanceTx: async (tx: any) => {
      const balanced = await api.balanceUnsealedTransaction(toHex(tx.serialize()));
      if (!balanced?.tx) throw new Error('Wallet could not balance this transaction.');
      const { Transaction } = await import('@midnight-ntwrk/ledger-v8');
      return Transaction.deserialize('signature', 'proof', 'binding', fromHex(balanced.tx));
    },
  };
  const midnightProvider: MidnightProvider = {
    submitTx: async (tx: any) => {
      const result = await api.submitTransaction(toHex(tx.serialize()));
      return typeof result === 'string' ? result : result?.transactionId || result?.id || 'submitted';
    },
  };
  return {
    api,
    config,
    unshieldedAddress: typeof unshielded === 'string' ? unshielded : unshielded.unshieldedAddress,
    providers: {
      privateStateProvider: createPrivateStateProvider(),
      publicDataProvider: createPatchedPublicDataProvider(config.indexerUri, config.indexerWsUri),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    },
  };
}
