import { describe, it, expect, vi } from 'vitest'

vi.mock('../../functions/_shared/db.ts', () => ({
  adminDb: { from: vi.fn(), rpc: vi.fn() },
}))

import { TARGET_TYPE_TO_TABLE } from '../../functions/admin-data.ts'

// Regression: link-create to an attachment 403'd because the parent-record
// check resolved target_type 'attachments' to the 'items' table. Apps send
// both table ('items') and kind ('item') spellings.
describe('TARGET_TYPE_TO_TABLE — polymorphic parent resolution', () => {
  it('resolves attachments in both spellings', () => {
    expect(TARGET_TYPE_TO_TABLE['attachments']).toBe('attachments')
    expect(TARGET_TYPE_TO_TABLE['attachment']).toBe('attachments')
  })

  it('resolves every runtime record table by kind and table spelling', () => {
    for (const [table, kind] of [
      ['items', 'item'],
      ['threads', 'thread'],
      ['messages', 'message'],
      ['accounts', 'account'],
      ['people', 'person'],
      ['links', 'link'],
      ['watchers', 'watcher'],
    ]) {
      expect(TARGET_TYPE_TO_TABLE[table]).toBe(table)
      expect(TARGET_TYPE_TO_TABLE[kind]).toBe(table)
    }
  })
})
