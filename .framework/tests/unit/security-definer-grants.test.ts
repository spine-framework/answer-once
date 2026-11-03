import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

// Regression guard for the SECURITY DEFINER RPC exposure fixed in migration
// 075. Postgres grants EXECUTE on new functions to PUBLIC by default, and
// Supabase's anon/authenticated roles inherit it — so every definer function
// ships callable at /rest/v1/rpc/* with the anon key unless the migration
// explicitly revokes it.
//
// This lint statically scans non-archived migrations and asserts that every
// SECURITY DEFINER function either:
//   a) is an allowlisted RLS helper (policies evaluate it as the querying
//      role, so anon/authenticated MUST keep EXECUTE), or
//   b) is revoked from PUBLIC/anon/authenticated in some migration
//      (literal REVOKE statement or an entry in a revoke-list DO block), or
//   c) was dropped.
// It also asserts every definer function pins search_path — in its own body
// or via a later ALTER FUNCTION — to close schema-shadowing on privileged code.

const MIGRATIONS_DIR = join(__dirname, '../../migrations')

// anon/authenticated must keep EXECUTE on these: every tenant RLS policy
// evaluates them as the querying role. Revoking them would break isolation
// schema-wide — get_accessible_accounts is pinned internally instead (075).
const EXEC_ALLOWLIST = new Set([
  'current_actor_id',
  'get_accessible_accounts',
])

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort()
}

interface DefinerDef {
  name: string
  file: string
  hasSearchPath: boolean
}

// Find CREATE [OR REPLACE] FUNCTION public.name(...) blocks and keep those
// declared SECURITY DEFINER.
function findDefinerFunctions(file: string, content: string): DefinerDef[] {
  const out: DefinerDef[] = []
  const re = /CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.(\w+)\s*\(/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    // A function body never spans another top-level CREATE; bound the slice.
    const rest = content.slice(m.index)
    const endMatch = rest.slice(1).search(/CREATE\s+(?:OR\s+REPLACE\s+)?(?:FUNCTION|TRIGGER|POLICY|UNIQUE|INDEX)|CREATE\s+(?:TABLE|POLICY|TRIGGER|INDEX)/i)
    const body = endMatch === -1 ? rest : rest.slice(0, endMatch + 1)
    if (/SECURITY\s+DEFINER/i.test(body)) {
      out.push({
        name: m[1],
        file,
        hasSearchPath: /search_path\s*(?:=|TO)\s*'?public'?/i.test(body),
      })
    }
  }
  return out
}

// Names that appear in any literal REVOKE ... ON FUNCTION public.name(...),
// any DROP FUNCTION public.name, any ALTER FUNCTION public.name SET
// search_path, or any DO-block that performs those via format()/EXECUTE with
// signature entries like 'name(arg,arg)'.
function collectCovered(
  files: string[],
  contents: Map<string, string>,
): { revoked: Set<string>; dropped: Set<string>; pathed: Set<string> } {
  const revoked = new Set<string>()
  const dropped = new Set<string>()
  const pathed = new Set<string>()

  for (const file of files) {
    const content = contents.get(file)!

    for (const m of content.matchAll(/REVOKE\s+\w+\s+ON\s+FUNCTION\s+public\.(\w+)\s*\(/gi)) {
      revoked.add(m[1])
    }
    for (const m of content.matchAll(/DROP\s+FUNCTION\s+(?:IF\s+EXISTS\s+)?public\.(\w+)\s*\(/gi)) {
      dropped.add(m[1])
    }
    for (const m of content.matchAll(/ALTER\s+FUNCTION\s+public\.(\w+)\s*\([^)]*\)\s*SET\s+search_path/gi)) {
      pathed.add(m[1])
    }

    // DO $$ ... $$ blocks that EXECUTE grant-management statements against a
    // signature list: the signature literals inside the block name the covered
    // functions (075 pattern).
    for (const block of content.matchAll(/DO\s+\$\$[\s\S]*?END\s+\$\$;/gi)) {
      const b = block[0]
      const doesRevoke = /REVOKE/i.test(b)
      const doesPath = /ALTER\s+FUNCTION[\s\S]*search_path|search_path[\s\S]*ALTER\s+FUNCTION/i.test(b)
      if (!doesRevoke && !doesPath) continue
      for (const m of b.matchAll(/'([a-z_]+)\(([^']*)\)'/g)) {
        if (doesRevoke) revoked.add(m[1])
        if (doesPath) pathed.add(m[1])
      }
    }
  }

  return { revoked, dropped, pathed }
}

describe('SECURITY DEFINER grant hygiene', () => {
  const files = migrationFiles()
  const contents = new Map(files.map((f) => [f, readFileSync(join(MIGRATIONS_DIR, f), 'utf8')]))
  const { revoked, dropped, pathed } = collectCovered(files, contents)

  const definers: DefinerDef[] = files.flatMap((f) => findDefinerFunctions(f, contents.get(f)!))
  const uniqueNames = [...new Set(definers.map((d) => d.name))]

  it('finds the definer functions we know about', () => {
    expect(uniqueNames).toEqual(
      expect.arrayContaining([
        'match_embeddings',
        'get_account_apps',
        'get_accessible_accounts',
        'current_actor_id',
        'rebuild_kb_cache',
        'revoke_embeddings_for_item',
        'cleanup_old_logs',
      ]),
    )
  })

  it('every definer function is revoked, dropped, or an allowlisted RLS helper', () => {
    const exposed = uniqueNames.filter(
      (n) => !EXEC_ALLOWLIST.has(n) && !revoked.has(n) && !dropped.has(n),
    )
    expect(
      exposed,
      `SECURITY DEFINER functions still executable by PUBLIC/anon/authenticated — ` +
        `add "REVOKE ALL ON FUNCTION public.<sig> FROM PUBLIC, anon, authenticated" ` +
        `to a migration, or extend the EXEC_ALLOWLIST if it is an RLS helper:\n  ${exposed.join('\n  ')}`,
    ).toEqual([])
  })

  it('every definer function pins search_path', () => {
    const missing = uniqueNames.filter((n) => {
      const defs = definers.filter((d) => d.name === n)
      const anyDefHasPath = defs.some((d) => d.hasSearchPath)
      return !anyDefHasPath && !pathed.has(n)
    })
    expect(
      missing,
      `SECURITY DEFINER functions without a pinned search_path — ` +
        `add SET search_path = public to the definition or ALTER FUNCTION:\n  ${missing.join('\n  ')}`,
    ).toEqual([])
  })
})
