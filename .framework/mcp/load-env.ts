// CIL[BEGIN stable_id="~/.framework/mcp/load-env.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/load-env.ts"]
// CIL[DOC-MACRO purpose="Imports Node.js utilities for resolving and loading an environment file."]
// CIL[DOC-CONTEXT module="mcp" layer="framework" related_files=".framework/mcp/load-env.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="runtime dependencies available to the module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports fs, path, and fileURLToPath for use by loadEnv." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// CIL[DOC-VECTOR type="context" content="purpose='Imports Node.js utilities for resolving and loading an environment file.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/load-env.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/load-env.ts:loadEnv:function" type="function" identity="loadEnv" parent="~/.framework/mcp/load-env.ts"]
// CIL[DOC-MACRO purpose="Reads a .env file and populates process.env for any keys that are not already set."]
// CIL[DOC-RESPONSIBILITY responsibility="Bootstrap environment variables for the MCP server process."]
// CIL[DOC-CONTEXT module="mcp" layer="framework" related_files=".framework/mcp/load-env.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="process.env updated from .env file" errors="read/parse failures are silently ignored" side_effects="mutates process.env"]
// CIL[DOC-MICRO logic_summary="Resolves the .env path relative to this file, reads it line by line, skips empty and comment lines, parses KEY=VALUE pairs, trims and strips surrounding quotes from values, and writes to process.env only when the key is absent." notable_decisions="Returns early if .env is missing; ignores all exceptions so server startup is not blocked; preserves already-set environment variables."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function loadEnv(): void {
  try {
    const __filename = fileURLToPath(import.meta.url)
    const envPath = path.resolve(path.dirname(__filename), '../../.env')
    if (!fs.existsSync(envPath)) return
    const text = fs.readFileSync(envPath, 'utf-8')
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq === -1) continue
      const key = line.slice(0, eq).trim()
      let value = line.slice(eq + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  } catch {
    // Ignore read/parse errors so the server still starts if .env is missing.
  }
}

loadEnv()
// CIL[DOC-VECTOR type="context" content="purpose='Reads a .env file and populates process.env for any keys that are not already set.'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/load-env.ts:loadEnv:function"]
