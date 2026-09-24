import { useCallback, useMemo, useState } from 'react';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { createUnprovenCallTx, submitTxAsync } from '@midnight-ntwrk/midnight-js-contracts';
import { ArrowRight, Check, Fingerprint, LockKeyhole, RefreshCw, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import { Contract } from '../managed/contract/index.js';
import { useWallet } from '../contexts/WalletContext';
import { getContractAddress, getExplorerTxUrl } from '../config';
import { fromHex, toHex } from '../lib/midnight';
import { getIdentity, hasUsedPass, publicFingerprint } from '../lib/identity';
import { useContractState } from '../hooks/useContractState';

function compiled(score: bigint, secret: Uint8Array) {
  const witnesses = {
    get_eligibility_score: (ctx: any) => [ctx.privateState, score],
    get_passphrase: (ctx: any) => [ctx.privateState, secret],
    steward_secret: (ctx: any) => [ctx.privateState, new Uint8Array(32)],
  };
  return CompiledContract.make('LumenveilContract', Contract).pipe(CompiledContract.withWitnesses(witnesses), CompiledContract.withCompiledFileAssets(new URL('/managed', window.location.origin).toString())) as any;
}

export default function GatePage() {
  const { session, isConnected, connect, isConnecting, walletStatus, address } = useWallet();
  const { ledgerState, isLoading, error, refetch } = useContractState(4000);
  const [identity] = useState(getIdentity);
  const [score, setScore] = useState('88');
  const [status, setStatus] = useState<'ready' | 'proving' | 'success' | 'error'>('ready');
  const [message, setMessage] = useState('');
  const [txId, setTxId] = useState('');
  const threshold = BigInt(ledgerState?.entry_threshold || 0);
  const scoreValue = BigInt(Number.isFinite(Number(score)) ? Math.max(0, Math.floor(Number(score))) : 0);
  const hasUsed = useMemo(() => hasUsedPass(identity.secret, ledgerState), [identity.secret, ledgerState]);
  const isReady = Boolean(ledgerState && ledgerState.gate_open && scoreValue >= threshold && !hasUsed && isConnected);

  const prove = useCallback(async () => {
    if (!ledgerState) return setMessage('No deployed gate is indexed yet. Ask a steward to deploy one first.');
    if (!session || !isConnected) return setMessage('Connect a Midnight wallet before generating a proof.');
    if (hasUsed) return setMessage('This private passphrase has already been used for the active gate.');
    if (scoreValue < threshold) return setMessage(`The private score must clear the public threshold of ${threshold}.`);
    setStatus('proving'); setMessage('Constructing a local proof. Your score and passphrase remain in this browser.'); setTxId('');
    try {
      const privateSecret = fromHex(identity.secret);
      const call = await createUnprovenCallTx(session.providers as any, { compiledContract: compiled(scoreValue, privateSecret), contractAddress: getContractAddress(), circuitId: 'prove_entry', args: [], witnesses: {} } as any);
      const result = await submitTxAsync(session.providers as any, { unprovenTx: call.private.unprovenTx, circuitId: 'prove_entry' } as any);
      const id = typeof result === 'string' ? result : String(result);
      setTxId(id); setStatus('success'); setMessage('Proof accepted. The gate recorded a new anonymous entry.'); window.setTimeout(() => void refetch(), 3000);
    } catch (cause: any) { setStatus('error'); setMessage(cause?.message || 'The proof could not be submitted.'); }
  }, [identity.secret, isConnected, ledgerState, refetch, scoreValue, session, threshold, hasUsed]);

  return <div className="page"><div className="page-header"><div className="eyebrow">Member gate / private witness</div><h1>Bring the proof.<br /><em>Leave the story behind.</em></h1><p>Use a local eligibility signal to enter the active Lumenveil gate. The interface shows the public rule, never your private value.</p></div><div className="two-col"><div className="panel"><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><div className="eyebrow">Public gate state</div>{ledgerState?.gate_open ? <span className="status">● OPEN</span> : <span className="status closed">● CLOSED</span>}</div>{isLoading ? <div className="empty-state" style={{ marginTop: 22 }}>Reading the observatory…</div> : error ? <div className="notice error" style={{ marginTop: 22 }}>{error}</div> : !ledgerState ? <div className="empty-state" style={{ marginTop: 22 }}>No gate is configured yet.<br /><span className="mono">/steward</span> can deploy the first one.</div> : <div className="data-list"><div className="data-row"><span className="label">Threshold</span><strong>{threshold.toString()} points</strong></div><div className="data-row"><span className="label">Entries</span><strong>{ledgerState.total_entries?.toString()} / {ledgerState.entry_limit?.toString()}</strong></div><div className="data-row"><span className="label">Pass expires</span><strong>{new Date(Number(ledgerState.entry_deadline) * 1000).toLocaleDateString()}</strong></div><div className="data-row"><span className="label">Pass id</span><strong className="mono">{toHex(ledgerState.access_pass_id).slice(0, 12)}…</strong></div></div>}<div className="notice" style={{ marginTop: 20 }}><ShieldCheck size={15} style={{ verticalAlign:'-3px', color:'var(--accent)', marginRight:7 }} />Only the threshold, count, expiry and nullifier are public.</div></div>
    <div className="panel"><div className="eyebrow">Your private side</div><h2 style={{ marginTop: 13 }}>One local signal.</h2><p>For this demo, your eligibility score is a browser-only witness. It is not sent as a circuit argument. Replace it with your own credential adapter before production.</p>{!isConnected && <div className="notice" style={{ marginTop: 18 }}><WalletCards size={15} style={{ verticalAlign:'-3px', marginRight:7 }} />Connect 1AM or Lace on Preprod to submit a proof.</div>}<div className="field"><label htmlFor="private-score">Private score · never disclosed</label><input id="private-score" className="input mono" type="number" min="0" max="100" value={score} onChange={(event) => setScore(event.target.value)} /></div><div className="data-row"><span className="label">Local credential fingerprint</span><strong className="mono">{publicFingerprint(identity.secret).slice(0, 14)}…</strong></div><div className="data-row"><span className="label">Replay protection</span><strong style={{ color: hasUsed ? 'var(--danger)' : 'var(--accent)' }}>{hasUsed ? 'Already used' : 'Unused in this gate'}</strong></div>{message && <div className={`notice ${status === 'error' ? 'error' : status === 'success' ? 'success' : ''}`} style={{ marginTop: 18 }}>{message}</div>}{status === 'success' ? <div className="notice success" style={{ marginTop: 18 }}><Check size={15} style={{ verticalAlign:'-3px', marginRight:7 }} />Anonymous entry recorded.<div className="mono" style={{ marginTop: 8, wordBreak:'break-all' }}>{txId}</div><a className="tiny-button" href={getExplorerTxUrl(txId)} target="_blank" rel="noreferrer">View transaction ↗</a></div> : <button className="button primary" style={{ width:'100%', marginTop: 20 }} disabled={!isReady || status === 'proving'} onClick={() => void prove()}>{status === 'proving' ? <><RefreshCw size={15} className="spin" /> Proving locally…</> : <>Generate entry proof <ArrowRight size={15} /></>}</button>}{!isConnected && <button className="button" style={{ width:'100%', marginTop: 10 }} onClick={() => void connect('preprod')} disabled={isConnecting || walletStatus === 'not-found'}><LockKeyhole size={15} />{isConnecting ? 'Opening wallet…' : 'Connect wallet'}</button>}</div></div></div>;
}
