import { beforeAll, describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import { createCircuitContext, createConstructorContext, dummyContractAddress, sampleUserAddress } from '@midnight-ntwrk/compact-runtime';
import { Contract, ledger, pureCircuits } from '../../contracts/managed/lumenveil/contract/index.js';

const bytes = () => new Uint8Array(crypto.randomBytes(32));

describe('Lumenveil Compact contract', () => {
  let contract: Contract;
  let state: any;
  const contractAddress = dummyContractAddress();
  const userAddress = sampleUserAddress();
  const pass = bytes();
  const curator = bytes();
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 86_400);
  const stewardSecret = bytes();
  let eligibleSecret: Uint8Array;

  beforeAll(() => {
    const stewardHash = pureCircuits.steward_public_key(stewardSecret);
    contract = new Contract({
      get_eligibility_score: () => [{}, 90n],
      get_passphrase: () => [{}, bytes()],
      steward_secret: () => [{}, stewardSecret],
    } as any);
    const result = contract.initialState(createConstructorContext({}, userAddress), 72n, pass, deadline, curator, stewardHash, 10n);
    state = result.currentContractState.data;
    eligibleSecret = bytes();
  });

  it('initializes the public gate state', () => {
    const value = ledger(state);
    expect(value.entry_threshold).toBe(72n);
    expect(value.gate_open).toBe(true);
    expect(value.total_entries).toBe(0n);
    expect(value.entry_limit).toBe(10n);
  });

  it('accepts an eligible private witness', () => {
    contract.witnesses = { get_eligibility_score: () => [{}, 90n], get_passphrase: () => [{}, eligibleSecret], steward_secret: () => [{}, stewardSecret] } as any;
    const result = contract.circuits.prove_entry(createCircuitContext(contractAddress, userAddress, state, {}));
    state = result.context.currentQueryContext.state;
    expect(ledger(state).total_entries).toBe(1n);
  });

  it('rejects a private score below the threshold', () => {
    contract.witnesses = { get_eligibility_score: () => [{}, 20n], get_passphrase: () => [{}, bytes()], steward_secret: () => [{}, stewardSecret] } as any;
    expect(() => contract.circuits.prove_entry(createCircuitContext(contractAddress, userAddress, state, {}))).toThrow(/Eligibility threshold/);
  });
});
