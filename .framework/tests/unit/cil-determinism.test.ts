// CIL[BEGIN stable_id="~/.framework/tests/unit/cil-determinism.test.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Unit tests for CIL deterministic identity and content hashing utilities"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide test coverage for CIL stable identity generation and content hash normalization"]
// CIL[DOC-CONTEXT module="cil-determinism.test.ts" layer="tests" related_files=".framework/functions/_shared/cil.ts"]
// CIL[DOC-CONTRACT inputs="vitest describe/it/expect, cil.ts computeContentHash/generateStableId/parseStableId" outputs="Passing unit test assertions" errors="AssertionError on deterministic/round-trip/hash mismatch failures" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports utilities and sets up a Vitest test module" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="test maintainers"]
import { describe, it, expect } from 'vitest'
import { computeContentHash, generateStableId, parseStableId } from '../../functions/_shared/cil.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Unit tests for CIL deterministic identity and content hashing utilities'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/cil-determinism.test.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/cil-determinism.test.ts:describe_cil_stable_identity:block" type="block" identity="describe_cil_stable_identity" parent="none"]
// CIL[DOC-MACRO purpose="Verify stable id generation and parsing are deterministic"]
// CIL[DOC-RESPONSIBILITY responsibility="Assert generateStableId and parseStableId behave predictably"]
// CIL[DOC-CONTEXT module="cil-determinism.test.ts" layer="tests" related_files=".framework/functions/_shared/cil.ts,.framework/tests/unit/cil-determinism.test.ts"]
// CIL[DOC-CONTRACT inputs="file path, identity, and type strings; stable id strings" outputs="Stable id string; parsed stable id object" errors="AssertionError if output does not match expected deterministic id or object" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Tests deterministic stable id formatting and round-trip parsing" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('CIL stable identity', () => {
  it('generateStableId produces deterministic stable ids', () => {
    expect(generateStableId('~/.framework/functions/auth.ts', 'getAccount', 'function'))
      .toBe('~/.framework/functions/auth.ts:getAccount:function')
  })

  it('parseStableId round-trips stable ids', () => {
    const id = generateStableId('~/.framework/functions/auth.ts', 'getAccount', 'function')
    expect(parseStableId(id)).toEqual({
      canonicalPath: '~/.framework/functions/auth.ts',
      identity: 'getAccount',
      type: 'function',
    })
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify stable id generation and parsing are deterministic'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/cil-determinism.test.ts:describe_cil_stable_identity:block"]

// CIL[BEGIN stable_id="~/.framework/tests/unit/cil-determinism.test.ts:describe_cil_content_hash:block" type="block" identity="describe_cil_content_hash" parent="none"]
// CIL[DOC-MACRO purpose="Verify content hash is deterministic and normalizes CIL markers"]
// CIL[DOC-RESPONSIBILITY responsibility="Assert computeContentHash produces consistent hashes and ignores CIL markers/blank lines"]
// CIL[DOC-CONTEXT module="cil-determinism.test.ts" layer="tests" related_files=".framework/functions/_shared/cil.ts,.framework/tests/unit/cil-determinism.test.ts"]
// CIL[DOC-CONTRACT inputs="JavaScript function source strings" outputs="32-character hexadecimal hash string" errors="AssertionError on hash mismatch or non-hex output" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Tests hash determinism, CIL marker stripping, and sensitivity to code changes" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
describe('CIL content_hash', () => {
  it('computeContentHash is deterministic for identical inputs', () => {
    const h1 = computeContentHash('function foo() { return 1 }')
    const h2 = computeContentHash('function foo() { return 1 }')
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[0-9a-f]{32}$/)
  })

  it('computeContentHash normalizes away CIL markers and blank lines', () => {
    const withCil = '// CIL[BEGIN]\nfunction foo() { return 1 }\n// CIL[END]\n\n'
    const without = 'function foo() { return 1 }'
    expect(computeContentHash(withCil)).toBe(computeContentHash(without))
  })

  it('computeContentHash changes when code changes', () => {
    const h1 = computeContentHash('function foo() { return 1 }')
    const h2 = computeContentHash('function foo() { return 2 }')
    expect(h1).not.toBe(h2)
  })
})
// CIL[DOC-VECTOR type="context" content="purpose='Verify content hash is deterministic and normalizes CIL markers'; No verified external callers; imports: .framework/functions/_shared/cil.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/unit/cil-determinism.test.ts:describe_cil_content_hash:block"]
