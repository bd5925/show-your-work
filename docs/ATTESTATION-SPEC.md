# Attestation token spec — v0.1 (draft)

One page. A signer vouches for facts about an AI account; a browser verifies them against the signer's published keys. The page that renders a review is never a trusted party.

## Token
- Format: JWS, compact serialization. Algorithm: EdDSA (Ed25519).
- Keys: published at `https://<issuer>/.well-known/syw-jwks.json` (JWKS). Verifiers pin the issuer list; an unlisted issuer is rejected even with a valid signature.
- Issuers: `openai.com`, `anthropic.com`, `x.ai` (provider issuers) and `verifier.showyourwork` (third-party issuer, attested enclave). The verify page labels which kind it is showing.

## Claims
| Claim | Type | Meaning |
| --- | --- | --- |
| `iss` | string | issuer |
| `iat` | int | issued at (unix seconds) |
| `sub` | string | stable pseudonymous account id (never email) |
| `email` | string? | optional, candidate-revealed, per employer |
| `mode` | `"portfolio" \| "audit"` | self-selected vs nonce-bound sample |
| `nonce` | string? | recruiter nonce (required in audit mode) |
| `account` | object | `{ first_activity, last_activity, created? }` ISO dates |
| `histogram` | array | per month: `{ month, sessions, user_messages }` |
| `models` | array | model identifiers seen, with first/last dates |
| `sessions` | array | `{ id, root, messages, omitted }` — Merkle root over canonical message hashes; `omitted` = messages the candidate removed |
| `sample` | array? | audit mode: session ids drawn by HKDF(signer_key, sub ‖ nonce) |
| `exhibits` | object | exhibit values with denominators; `{ code_version, code_hash }` of the open-source exhibit code |
| `totals` | object | `{ sessions, user_messages, omitted_sessions, omitted_messages }` |

## Canonical message hash
`SHA-256( role ‖ 0x00 ‖ model ‖ 0x00 ‖ timestamp ‖ 0x00 ‖ parent_id ‖ 0x00 ‖ content )`, UTF-8, NFC-normalized content. Edits and regenerations are branches: `parent_id` keeps them in the tree.

## Inclusion proof
For a quoted passage: `{ session_id, message_hash, path: [ { side, hash } ... ] }` chaining to the session root in the signed token. A quote renders only if the proof verifies.

## Omission
Allowed. Counted in `sessions[].omitted` and `totals`. The signature covers the counts. Silent deletion is the attack; counted omission is not.

## Audit mode
1. Hiring manager generates a random 128-bit nonce and gives it to the candidate.
2. Candidate requests an attestation bound to that nonce.
3. Signer draws the sample: `HKDF-SHA256(signer_secret, info = sub ‖ nonce)` seeds a selection of N session ids from the account. The candidate cannot predict or pre-pick it.
4. Token carries `nonce`, `sample`, and omission counts. The verify page checks the nonce matches the one the hiring manager generated.

## Verify page (static, runs in the browser)
Shows three visually separated blocks: **verified facts** (signature, issuer, nonce, histogram, models, span), **proven excerpts** (inclusion proof chains to a signed root), **narrative** (labeled commentary wherever no proof backs it). Never merges multiple issuers into one number.

## Provider endpoint (what a provider implements)
`POST /attestations` — body `{ mode, nonce?, session_ids?, omit?: { session_id: [message_hash...] } }` from an authenticated user → returns the JWS above. Small on the provider side: they already store the chats and already run the export.

## Third-party issuer (the bridge)
`verifier.showyourwork` fetches the platform's export download link (platform origin), computes the same claims from the file, signs with its own key, discards the data. Runs in an attested enclave; the attestation document is published with every token. Labeled as third-party on the verify page. Replaced per provider the day that provider publishes a JWKS.
