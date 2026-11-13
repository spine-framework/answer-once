
import type { Command } from 'commander'


// Exit 1 (non-zero) so scripts fail loudly rather than silently writing nothing
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
