// CIL[BEGIN stable_id="~/.framework/functions/_shared/message-sequence.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/message-sequence.ts"]
// CIL[DOC-MACRO purpose="Race-safe message sequence allocation for writers outside the agent runner's per-instance counter"]
// CIL[DOC-RESPONSIBILITY responsibility="Allocate the next sequence value for a thread and retry the caller's insert when a concurrent write collides on UNIQUE(thread_id, sequence)"]
// CIL[DOC-CONTEXT module="functions/_shared/message-sequence" layer="data-access" related_files=".framework/functions/_shared/db.ts,.framework/functions/_shared/agent-runner.ts"]
// CIL[DOC-CONTRACT inputs="threadId: string, insert: (sequence: number) => Promise<T>, maxAttempts?: number" outputs="T — the insert result" errors="rethrows non-duplicate errors and 23505 once attempts are exhausted" side_effects="one sequence read per attempt plus the caller's insert"]
// CIL[DOC-MICRO logic_summary="Each attempt reads MAX(sequence) fresh then runs the caller's insert; a 23505 means the allocation went stale between read and write, so the loop re-reads and retries" notable_decisions="MAX(sequence)+1 rather than COUNT+1 — sparse or deleted sequences can't cause under-allocation; the insert callback keeps the caller's own create path (admin-data stamping, direct insert) so no shared module reaches into admin-data"]
// CIL[DOC-LEARNING topic="sequence_allocation" content="Any non-runner writer that computes COUNT(*)+1 then inserts is racy — a concurrent writer on the same thread lands the same sequence and the UNIQUE(thread_id, sequence) constraint throws 23505. All such sites must allocate through insertMessageSequenced (or the runner's allocSequence/persist path). Production evidence: case-analysis finalize 500'd when the detached chain's finalize overlapped the client resumer's kick('finalized')."]
// CIL[DOC-NOTE type="caution" content="The agent runner has its own per-instance counter (threadSeqCounter + allocSequence) — do not route runner message writes through this helper; this is for custom-app and finalize-path writers that persist one message at a time."]
// CIL[DOC-AUDIENCE audience="custom app developers writing messages into threads outside runAgent"]
// CIL[DOC-STABILITY stability="stable"]
import { adminDb } from './db'
// CIL[END stable_id="~/.framework/functions/_shared/message-sequence.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/message-sequence.ts:isduplicatekeyerror:function" type="function" identity="isDuplicateKeyError" parent="~/.framework/functions/_shared/message-sequence.ts"]
// CIL[DOC-MACRO purpose="Detect Postgres 23505 unique-violation errors from admin-data throws or supabase-js error objects"]
// CIL[DOC-CONTRACT inputs="err: any (thrown error or PostgrestError)" outputs="boolean" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks error.code === '23505' and falls back to message matching for wrapped errors" notable_decisions="[]"]
// CIL[DOC-STABILITY stability="stable"]
function isDuplicateKeyError(err: any): boolean {
  return err?.code === '23505' || /23505|duplicate key/i.test(String(err?.message || err || ''))
}
// CIL[END stable_id="~/.framework/functions/_shared/message-sequence.ts:isduplicatekeyerror:function"]

// CIL[BEGIN stable_id="~/.framework/functions/_shared/message-sequence.ts:insertmessagesequenced:function" type="function" identity="insertMessageSequenced" parent="~/.framework/functions/_shared/message-sequence.ts"]
// CIL[DOC-MACRO purpose="Allocate the next message sequence for a thread and run the caller's insert, retrying on unique-violation"]
// CIL[DOC-RESPONSIBILITY responsibility="Replace the read-count-then-insert pattern (COUNT+1) that collides whenever two writers race on one thread"]
// CIL[DOC-CONTRACT inputs="threadId, insert: (sequence:number)=>Promise<T>, maxAttempts=3" outputs="insert result" errors="rethrows final error" side_effects="messages read + caller insert"]
// CIL[DOC-MICRO logic_summary="Reads MAX(sequence) fresh each attempt so a retried insert re-allocates above whatever the racing writer landed" notable_decisions="callback carries the sequence so type stamping/audit stays inside the caller's existing create call"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[END stable_id="~/.framework/functions/_shared/message-sequence.ts:insertmessagesequenced:function"]
