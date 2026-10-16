// CIL[BEGIN stable_id="~/.framework/tests/setup.ts:file_header:constant" type="constant" identity="file_header" parent="~/.framework/tests/setup.ts"]
// CIL[DOC-MACRO purpose="Documentation header for the Vitest setup file."]
// CIL[DOC-RESPONSIBILITY responsibility="Describes the setup file's role, audience, and environment stubbing strategy."]
// CIL[DOC-CONTEXT module="tests/setup" layer="test-infrastructure" related_files=".framework/tests/setup.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="JSDoc module metadata" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Provides a module-level JSDoc header for the test setup file." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/// <reference types="node" />
/**
 * @module tests/setup
 * @audience core-contributor
 * @layer test-infrastructure
 * @stability stable
 *
 * Global Vitest setup file — runs before every test file via
 * `vitest.config.ts → setupFiles`.
 *
 * Stubs the three required Supabase env vars (`SUPABASE_URL`,
 * `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) so modules that call
 * `createClient()` at import time (`principal.ts`, `db.ts`) don't crash
 * with "supabaseUrl is required" in unit test runs.
 *
 * Integration tests load real values from `.xenv.test` via
 * `tests/integration/helpers.ts` and override these stubs.
 */
// CIL[DOC-VECTOR type="context" content="purpose='Documentation header for the Vitest setup file.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/setup.ts:file_header:constant"]

// CIL[BEGIN stable_id="~/.framework/tests/setup.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/tests/setup.ts"]
// CIL[DOC-MACRO purpose="Imports required Node.js utilities for path and file resolution."]
// CIL[DOC-RESPONSIBILITY responsibility="Makes fs, path, and url utilities available for the setup module."]
// CIL[DOC-CONTEXT module="tests/setup" layer="test-infrastructure" related_files=".framework/tests/setup.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="Imported modules" errors="" side_effects=""]
// CIL[DOC-MICRO logic_summary="Imports fs, path, and url modules for ESM setup." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="core-contributor"]
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
// CIL[DOC-VECTOR type="context" content="purpose='Imports required Node.js utilities for path and file resolution.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/setup.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/tests/setup.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/tests/setup.ts"]
// CIL[DOC-MACRO purpose="Derive a stable __filename reference for the ESM module."]
// CIL[DOC-RESPONSIBILITY responsibility="Computes the current file's path from import.meta.url."]
// CIL[DOC-CONTEXT module="tests/setup" layer="test-infrastructure" related_files=".framework/tests/setup.ts"]
// CIL[DOC-CONTRACT inputs="import.meta.url" outputs="__filename" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Converts import.meta.url to a filesystem path using fileURLToPath." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Derive a stable __filename reference for the ESM module.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/setup.ts:__filename:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/setup.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/tests/setup.ts"]
// CIL[DOC-MACRO purpose="Derive __dirname from the computed __filename."]
// CIL[DOC-RESPONSIBILITY responsibility="Extracts the directory portion of the current file path."]
// CIL[DOC-CONTEXT module="tests/setup" layer="test-infrastructure" related_files=".framework/tests/setup.ts"]
// CIL[DOC-CONTRACT inputs="__filename" outputs="__dirname" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes __dirname by passing __filename to the path dirname function." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Derive __dirname from the computed __filename.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/setup.ts:__dirname:constant"]

// Load .xenv.test before stubs so integration tests get real DB credentials
// before db.ts evaluates its createClient() calls at module load time.
// CIL[BEGIN stable_id="~/.framework/tests/setup.ts:xenvTestPath:constant" type="constant" identity="xenvTestPath" parent="~/.framework/tests/setup.ts"]
// CIL[DOC-MACRO purpose="Resolve the absolute path to the .xenv.test file."]
// CIL[DOC-RESPONSIBILITY responsibility="Provides the location of the local test environment file."]
// CIL[DOC-CONTEXT module="tests/setup" layer="test-infrastructure" related_files=".framework/tests/setup.ts"]
// CIL[DOC-CONTRACT inputs="__dirname" outputs="xenvTestPath" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds the absolute .xenv.test path relative to the setup file directory." notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const xenvTestPath = resolve(__dirname, '../.xenv.test')
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the absolute path to the .xenv.test file.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/setup.ts:xenvTestPath:constant"]
// CIL[BEGIN stable_id="~/.framework/tests/setup.ts:setup_env:variable" type="variable" identity="setup_env" parent="~/.framework/tests/setup.ts"]
// CIL[DOC-MACRO purpose="Load .xenv.test and set default Supabase test environment variables."]
// CIL[DOC-RESPONSIBILITY responsibility="Ensures required Supabase environment variables are present before test modules import client code."]
// CIL[DOC-CONTEXT module="tests/setup" layer="test-infrastructure" related_files=".framework/tests/setup.ts"]
// CIL[DOC-CONTRACT inputs="xenvTestPath, process.env" outputs="process.env with SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY" errors="none" side_effects="Mutates process.env"]
// CIL[DOC-MICRO logic_summary="Parses .xenv.test line-by-line and applies default Supabase test credentials." notable_decisions="Skips blank and commented lines; preserves existing env values; strips surrounding quotes."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
if (existsSync(xenvTestPath)) {
  for (const line of readFileSync(xenvTestPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = value
  }
}

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-key'
// CIL[DOC-VECTOR type="context" content="purpose='Load .xenv.test and set default Supabase test environment variables.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/tests/setup.ts:setup_env:variable"]
