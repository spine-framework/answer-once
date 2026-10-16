// CIL[BEGIN stable_id="~/.framework/functions/_shared/hash-api-key.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-MACRO purpose="Provides PBKDF2-based API key hashing and verification utilities"]
// CIL[DOC-RESPONSIBILITY responsibility="Imports crypto primitives and exports hashApiKey and verifyApiKey"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports crypto functions used by hashing and verification" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]


import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto'
// CIL[DOC-VECTOR type="context" content="purpose='Provides PBKDF2-based API key hashing and verification utilities'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/hash-api-key.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/hash-api-key.ts:ITERATIONS:constant" type="constant" identity="ITERATIONS" parent="~/.framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-MACRO purpose="Defines the default PBKDF2 iteration count"]
// CIL[DOC-RESPONSIBILITY responsibility="Stores the default number of PBKDF2 iterations for hashing"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant default iteration count used by hashApiKey" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const ITERATIONS = 100000
// CIL[DOC-VECTOR type="context" content="purpose='Defines the default PBKDF2 iteration count'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/hash-api-key.ts:ITERATIONS:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/hash-api-key.ts:KEY_LENGTH:constant" type="constant" identity="KEY_LENGTH" parent="~/.framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-MACRO purpose="Defines the derived key length in bytes for PBKDF2"]
// CIL[DOC-RESPONSIBILITY responsibility="Stores the PBKDF2 derived key length"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="number" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant derived key length used by hashApiKey" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const KEY_LENGTH = 32
// CIL[DOC-VECTOR type="context" content="purpose='Defines the derived key length in bytes for PBKDF2'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/hash-api-key.ts:KEY_LENGTH:constant"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/hash-api-key.ts:DIGEST:constant" type="constant" identity="DIGEST" parent="~/.framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-MACRO purpose="Defines the digest algorithm for PBKDF2"]
// CIL[DOC-RESPONSIBILITY responsibility="Stores the PBKDF2 digest algorithm"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Constant digest algorithm used by hashApiKey and verifyApiKey" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const DIGEST = 'sha256'
// CIL[DOC-VECTOR type="context" content="purpose='Defines the digest algorithm for PBKDF2'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/hash-api-key.ts:DIGEST:constant"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/hash-api-key.ts:hashApiKey:function" type="function" identity="hashApiKey" parent="~/.framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-MACRO purpose="Hash a raw API key using PBKDF2 and return a storable key record"]
// CIL[DOC-RESPONSIBILITY responsibility="Derive a salted PBKDF2 hash, prefix the raw key, and return a hash string"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-CONTRACT inputs="rawKey: string, iterations = ITERATIONS" outputs="{ key_prefix: string, key_hash: string, rawKey: string }" errors="none" side_effects="Uses crypto.randomBytes and pbkdf2Sync to generate salt and hash"]
// CIL[DOC-MICRO logic_summary="Extracts an 8-character prefix, generates a random salt, derives a 32-byte PBKDF2 hash, and encodes the result as pbkdf2$iterations$salt$hash" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function hashApiKey(rawKey: string, iterations = ITERATIONS): { key_prefix: string; key_hash: string; rawKey: string } {
  const key_prefix = rawKey.slice(0, 8)
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(rawKey, salt, iterations, KEY_LENGTH, DIGEST)
  const key_hash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`

  return { key_prefix, key_hash, rawKey }
}
// CIL[DOC-VECTOR type="context" content="purpose='Hash a raw API key using PBKDF2 and return a storable key record'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/hash-api-key.ts:hashApiKey:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/hash-api-key.ts:verifyApiKey:function" type="function" identity="verifyApiKey" parent="~/.framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-MACRO purpose="Verify a raw API key against a stored PBKDF2 hash"]
// CIL[DOC-RESPONSIBILITY responsibility="Parse the stored hash, re-derive the key, and compare hashes timing-safely"]
// CIL[DOC-CONTEXT module="functions/_shared" layer="shared" related_files=".framework/functions/_shared/hash-api-key.ts"]
// CIL[DOC-CONTRACT inputs="rawKey: string, keyHash: string" outputs="boolean" errors="Returns false for invalid format, missing parts, non-positive iterations, base64 decode errors, or mismatched lengths" side_effects="Uses crypto.pbkdf2Sync and timingSafeEqual"]
// CIL[DOC-MICRO logic_summary="Validates the keyHash format, extracts iterations and salt, derives the hash with the stored length, and compares with timingSafeEqual" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function verifyApiKey(rawKey: string, keyHash: string): boolean {
  if (!keyHash || !keyHash.startsWith('pbkdf2$')) {
    return false
  }

  const parts = keyHash.split('$')
  if (parts.length !== 4) return false

  const [, iterStr, saltB64, hashB64] = parts
  const iterations = parseInt(iterStr, 10)
  if (Number.isNaN(iterations) || iterations <= 0) return false

  let salt: Buffer
  let storedHash: Buffer
  try {
    salt = Buffer.from(saltB64, 'base64url')
    storedHash = Buffer.from(hashB64, 'base64url')
  } catch {
    return false
  }

  const derived = pbkdf2Sync(rawKey, salt, iterations, storedHash.length, DIGEST)
  if (derived.length !== storedHash.length) return false

  try {
    return timingSafeEqual(derived, storedHash)
  } catch {
    return false
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Verify a raw API key against a stored PBKDF2 hash'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/hash-api-key.ts:verifyApiKey:function"]
