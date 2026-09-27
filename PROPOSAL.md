# Lumenveil product proposal

## Selected Level 3 problem

**Private Allowlist Access** — prove membership without revealing identity.

## Problem

Invitation-only communities, private research rooms, and limited releases often use a database, a wallet address, or a screenshot of a credential as an allowlist. Each option creates a durable identity trail. A host learns more than “this visitor is eligible,” while members must trust the host to protect their address, credential, and social graph.

## Product

Lumenveil creates a public gate with a private rule. A curator publishes a minimum eligibility threshold, pass identifier, expiry and capacity. A member supplies an eligibility score and secret passphrase as private witnesses. The Compact circuit proves the score clears the threshold and records a gate-scoped nullifier. The curator gets a verifiable one-time entry event; the member keeps the underlying reason for eligibility private.

## Users

- Curators running private events, research groups, beta communities or access-controlled releases.
- Members who need to prove eligibility without connecting their public identity to the room.
- Auditors who need a public, replay-resistant count rather than access to private credentials.

## Public/private data model

| Data | Location | Why |
|---|---|---|
| Threshold, pass ID, deadline, capacity, open/closed state | Public ledger | Everyone must agree on the current rule |
| Entry count | Public ledger | Aggregate usage is intentionally observable |
| Nullifier | Public ledger | Prevents the same private passphrase being reused in one gate |
| Eligibility score | Private witness | Only the comparison result is needed |
| Member passphrase | Private witness | Derives a one-time nullifier without exposing the preimage |
| Steward secret | Private witness | Authorizes lifecycle changes without a secret circuit argument |
| Wallet address / source credential | Local wallet or adapter | Not needed by the gate circuit |

### Security decisions

- Nullifiers use domain-separated `persistentHash` and include the current pass identifier, preventing cross-gate reuse and accidental linkage between purposes.
- The circuit checks gate status, deadline, capacity, threshold and nullifier membership before writing the public result.
- Steward authorization compares the private witness-derived commitment with the public steward commitment.
- `disclose()` appears at intentional public boundaries. Witness values are not written directly to the ledger.

## Why Midnight

Midnight's Compact language makes the public/private boundary explicit with `export ledger`, `witness`, circuits and `disclose()`. The network can verify a proof of a private predicate while the witness remains outside the public ledger. Midnight's browser connector also lets wallet and proving configuration be selected by the user's installed wallet rather than hardcoded into a server flow.

## Scope and roadmap

### Level 1

Compile and test the four-circuit gate locally, generate managed ZK assets, and deploy an initial gate to Preview or Preprod.

### Level 2

Connect 1AM/Lace, generate an entry proof from the Gate page, and publish a verifiable address plus a short demo.

### Level 3

Harden the privacy boundary with more contract/application tests, CI and an indexed Observatory. Submit this private allowlist proposal for approval.

### Level 4

Run a live MVP with curator-controlled gate rotation, documented operating procedures, a release workflow and a public product profile.

### Later

Add credential adapters for verifiable credentials, rotating pass lifecycles, selective receipts for curators, and formal Compact/security review before mainnet use.
