import { describe, it, expect } from 'vitest'
import { omitSecretFields } from '../../functions/_shared/hash-api-key'

describe('omitSecretFields', () => {
  it('removes key_value and key_hash and keeps the other fields', () => {
    const row = { id: 'key-1', name: 'Prod', key_prefix: 'sk_abc123', key_hash: 'hash', key_value: 'sk_secret' }
    const result = omitSecretFields(row)
    expect(result).toEqual({ id: 'key-1', name: 'Prod', key_prefix: 'sk_abc123' })
    expect(result).not.toHaveProperty('key_value')
    expect(result).not.toHaveProperty('key_hash')
  })

  it('does not mutate the input row', () => {
    const row = { id: 'key-1', key_value: 'sk_secret', key_hash: 'hash' }
    omitSecretFields(row)
    expect(row.key_value).toBe('sk_secret')
    expect(row.key_hash).toBe('hash')
  })

  it('returns null and undefined input as-is', () => {
    expect(omitSecretFields(null)).toBeNull()
    expect(omitSecretFields(undefined)).toBeUndefined()
  })

  it('returns an equal copy for a row without secret fields', () => {
    const row = { id: 'key-1', name: 'Prod', is_active: true, metadata: { env: 'prod' } }
    const result = omitSecretFields(row)
    expect(result).toEqual(row)
    expect(result).not.toBe(row)
  })

  it('strips key_hash even when it is the only secret field present', () => {
    const row = { id: 'key-2', name: 'CI', key_hash: 'pbkdf2$100000$salt$hash' }
    const result = omitSecretFields(row)
    expect(result).toEqual({ id: 'key-2', name: 'CI' })
    expect(result).not.toHaveProperty('key_hash')
  })
})
