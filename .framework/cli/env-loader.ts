// CIL[BEGIN stable_id="~/.framework/cli/env-loader.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/env-loader.ts"]
// CIL[DOC-MACRO purpose="CLI environment file loader module entry point"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize file system and path utilities and resolve environment files"]
// CIL[DOC-CONTEXT module="env-loader" layer="cli" related_files=".framework/cli/env-loader.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="loaded environment variables in process.env" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Module-level imports for fs, path, and url helpers" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="cli"]
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
// CIL[DOC-VECTOR type="context" content="purpose='CLI environment file loader module entry point'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/env-loader.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/env-loader.ts:__filename:constant" type="constant" identity="__filename" parent="~/.framework/cli/env-loader.ts"]
// CIL[DOC-MACRO purpose="Resolve the current module file path"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide __filename equivalent for ESM modules"]
// CIL[DOC-CONTEXT module="env-loader" layer="cli" related_files=".framework/cli/env-loader.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="__filename string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Convert import.meta.url to a file path" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __filename = fileURLToPath(import.meta.url)
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the current module file path'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/env-loader.ts:__filename:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/env-loader.ts:__dirname:constant" type="constant" identity="__dirname" parent="~/.framework/cli/env-loader.ts"]
// CIL[DOC-MACRO purpose="Resolve the current module directory path"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide __dirname equivalent for ESM modules"]
// CIL[DOC-CONTEXT module="env-loader" layer="cli" related_files=".framework/cli/env-loader.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="__dirname string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Derive the directory name from __filename" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const __dirname = dirname(__filename)
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the current module directory path'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/env-loader.ts:__dirname:constant"]

// CIL[BEGIN stable_id="~/.framework/cli/env-loader.ts:loadEnvFile:function" type="function" identity="loadEnvFile" parent="~/.framework/cli/env-loader.ts"]
// CIL[DOC-MACRO purpose="Parse and load key-value pairs from a .env file into process.env"]
// CIL[DOC-RESPONSIBILITY responsibility="Read environment files and populate process.env for missing keys"]
// CIL[DOC-CONTEXT module="env-loader" layer="cli" related_files=".framework/cli/env-loader.ts"]
// CIL[DOC-CONTRACT inputs="envPath: string" outputs="process.env updated with new key-value pairs" errors="none" side_effects="mutates process.env"]
// CIL[DOC-MICRO logic_summary="Read .env file, parse KEY=VALUE lines, skip comments and blanks, strip quotes, and set process.env only for unset keys" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function loadEnvFile(envPath: string) {
  if (!existsSync(envPath)) return
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}
// CIL[DOC-VECTOR type="context" content="purpose='Parse and load key-value pairs from a .env file into process.env'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/env-loader.ts:loadEnvFile:function"]

// CIL[BEGIN stable_id="~/.framework/cli/env-loader.ts:env_loader_init:expression" type="function" identity="env_loader_init" parent="~/.framework/cli/env-loader.ts"]
// CIL[DOC-MACRO purpose="Execute environment loading for the CLI at startup"]
// CIL[DOC-RESPONSIBILITY responsibility="Load .env files from project root and framework directory"]
// CIL[DOC-CONTEXT module="env-loader" layer="cli" related_files=".framework/cli/env-loader.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="process.env populated from .env and .xenv files" errors="none" side_effects="calls loadEnvFile and mutates process.env"]
// CIL[DOC-MICRO logic_summary="Invoke loadEnvFile for .env in process.cwd and .xenv in the framework directory" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
loadEnvFile(resolve(process.cwd(), '.env'))

loadEnvFile(resolve(__dirname, '../.xenv'))
// CIL[DOC-VECTOR type="context" content="purpose='Execute environment loading for the CLI at startup'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/env-loader.ts:env_loader_init:expression"]
