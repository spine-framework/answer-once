// MAX(sequence)+1 rather than COUNT+1 — sparse or deleted sequences can't cause under-allocation; the insert callback keeps the caller's own create path (admin-data stamping, direct insert) so no shared module reaches into admin-data
// Any non-runner writer that computes COUNT(*)+1 then inserts is racy — a concurrent writer on the same thread lands the same sequence and the UNIQUE(thread_id, sequence) constraint throws 23505. All such sites must allocate through insertMessageSequenced (or the runner's allocSequence/persist path). Production evidence: case-analysis finalize 500'd when the detached chain's finalize overlapped the client resumer's kick('finalized').
// The agent runner has its own per-instance counter (threadSeqCounter + allocSequence) — do not route runner message writes through this helper; this is for custom-app and finalize-path writers that persist one message at a time.
import { adminDb } from './db'

function isDuplicateKeyError(err: any): boolean {
  return err?.code === '23505' || /23505|duplicate key/i.test(String(err?.message || err || ''))
}

export async function insertMessageSequenced<T>(
  threadId: string,
  insert: (sequence: number) => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let lastErr: any = null
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data } = await adminDb
      .from('messages')
      .select('sequence')
      .eq('thread_id', threadId)
      .order('sequence', { ascending: false })
      .limit(1)
    const sequence = (data?.[0]?.sequence ?? 0) + 1
    try {
      return await insert(sequence)
    } catch (err: any) {
      lastErr = err
      if (!isDuplicateKeyError(err)) throw err
    }
  }
  throw lastErr
}
