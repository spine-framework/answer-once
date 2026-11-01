// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/generate.ts"]
// CIL[DOC-AUDIENCE audience="internal, cli-users"]
// CIL[DOC-MACRO purpose="Deprecated stub: the legacy 'generate' scaffold was removed; the command stays registered so callers get a clear migration message instead of writes to a dead v2-custom/ tree"]
// CIL[DOC-RESPONSIBILITY responsibility="Register the 'generate' command and fail fast with guidance"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/create-app.ts,.framework/cli/commands/validate-schema.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="registered deprecated command" errors="always exits non-zero when invoked" side_effects="prints removal notice to stderr"]
// CIL[DOC-MICRO logic_summary="Prints a removal notice pointing at create-app, the admin UI, and validate-schema, then exits with code 1" notable_decisions="Not aliased to create-app: generate created a type record + v2-custom stubs, create-app scaffolds custom/apps/<slug>/ — different semantics"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY deprecated]

import type { Command } from 'commander'
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:module_header:module_header"]

// CIL[DOC-VECTOR type="context" content="purpose='Deprecated stub for the removed generate scaffold'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Register the deprecated 'generate' command so invocations fail with a clear removal notice"]
// CIL[DOC-RESPONSIBILITY responsibility="Wire the deprecated generate command into the program"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/generate" layer="app-specific" related_files=".framework/cli/commands/create-app.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="void" errors="always exits 1 on invocation" side_effects="Registers a command and prints guidance to stderr"]
// CIL[DOC-MICRO logic_summary="Defines 'generate [slug]' whose action prints the removal notice and exits 1" notable_decisions="Exit 1 (non-zero) so scripts fail loudly rather than silently writing nothing"]
// CIL[DOC-CONFIDENCE pass="second" score="0.95" flags="none"]
// CIL[DOC-STABILITY deprecated]
// CIL[BEGIN stable_id="~/.framework/cli/commands/generate.ts:registerGenerateCommands:function" type="function" identity="registerGenerateCommands" parent="~/.framework/cli/commands/generate.ts"]
export function registerGenerateCommands(program: Command) {
  program
    .command('generate [slug]')
    .description('Removed — legacy v2 scaffold no longer exists (prints migration guidance)')
    .action(() => {
      console.error(`
❌ 'spine-framework generate' was removed.

   The old scaffold wrote type/handler/page stubs into a 'v2-custom/' tree
   and emitted a legacy design_schema shape — neither exists in this layout.

   To get the same outcome today:

   • New app:        spine-framework create-app <slug>
                     (scaffolds custom/apps/<slug>/ + registers the app)

   • New type:       author design_schema JSON, then either
                     - create it in the admin UI (Spine Admin → Types), or
                     - POST it to /api/types
                     Validate first: spine-framework validate-schema <file.json>

   • Custom logic:   put functions in custom/apps/<slug>/functions/ — they are
                     picked up by 'npm run assemble' automatically.
`)
      process.exit(1)
    })
}
// CIL[END stable_id="~/.framework/cli/commands/generate.ts:registerGenerateCommands:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Register the deprecated generate command'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
