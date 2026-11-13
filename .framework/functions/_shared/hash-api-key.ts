/**
 * @module   hash-api-key
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides utilities for securely hashing API keys using cryptographic functions. It plays a crucial role in ensuring the integrity and confidentiality of sensitive data within the application. INVARIANT: The API keys must always be hashed before storage to prevent unauthorized access.
 *
 * @seeAlso crypto (provides cryptographic functions for hashing).
 *
 * @cil-generated
 */











import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto'
















/**
 * ITERATIONS defines the number of iterations used for hashing an API key, ensuring a high level of security. This constant is crucial for maintaining the strength of the hashing process.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const ITERATIONS = 100000















/**
 * KEY_LENGTH defines the length of the API key used for hashing to ensure a consistent key size for security purposes.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const KEY_LENGTH = 32















/**
 * DIGEST defines the hashing algorithm used for API key generation, specifically SHA-256. It provides a consistent and secure method for hashing within the module.
 *
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
const DIGEST = 'sha256'

















/**
 * Hashes a raw API key using PBKDF2 to enhance security and returns the key prefix along with the hashed key. This function is essential for securely storing API keys.
 *
 * @inputSpec
 *   - rawKey: string (required) — the raw API key to be hashed.
 *   - iterations: number (optional) — the number of iterations for the PBKDF2 algorithm, defaults to ITERATIONS.
 * @outputSpec  { key_prefix: string; key_hash: string; rawKey: string }
 * @sideEffects none
 * @stability   internal
 * @calls       randomBytes, pbkdf2Sync
 * @cil-generated
 */
export function hashApiKey(rawKey: string, iterations = ITERATIONS): { key_prefix: string; key_hash: string; rawKey: string } {
  const key_prefix = rawKey.slice(0, 8)
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(rawKey, salt, iterations, KEY_LENGTH, DIGEST)
  const key_hash = `pbkdf2$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`

  return { key_prefix, key_hash, rawKey }
}

















/**
 * Verifies an API key against a stored hash to ensure its validity. This function is essential for securing access to resources by validating the provided key.
 *
 * @inputSpec
 *   - rawKey: string (required) — the API key to verify.
 *   - keyHash: string (required) — the hashed representation of the API key.
 * @outputSpec  boolean — returns true if the API key is valid, otherwise false.
 * @sideEffects none
 * @stability   internal
 * @calls       pbkdf2Sync, timingSafeEqual
 * @cil-generated
 */
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
















/**
 * The omitSecretFields function removes sensitive fields from an object to prevent exposure of secret information. It is designed to sanitize data before further processing or transmission.
 *
 * @inputSpec
 *   row: Record<string, any> | null | undefined — the object from which secret fields will be omitted.
 * @outputSpec  Record<string, any> | null | undefined — a new object without the omitted fields, or the original input if it was not an object.
 * @sideEffects none
 * @stability   internal
 * @cil-generated
 */
export function omitSecretFields(row: Record<string, any> | null | undefined) {
  if (!row || typeof row !== 'object') return row
  const copy = { ...row }
  delete copy.key_value
  delete copy.key_hash
  return copy
}







