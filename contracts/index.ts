import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export {
  Contract,
  ledger,
  pureCircuits,
  type Ledger,
  type ImpureCircuits,
  type PureCircuits,
} from './managed/lumenveil/contract/index.js';
import { Contract } from './managed/lumenveil/contract/index.js';

const currentDir = path.resolve(fileURLToPath(import.meta.url), '..');
export const zkConfigPath = path.resolve(currentDir, 'managed', 'lumenveil');

export const CompiledLumenveilContract = CompiledContract.make('LumenveilContract', Contract).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);
