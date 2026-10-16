/**
 * @module   auth
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module handles authentication commands for the CLI, providing the necessary context and error handling for user authentication processes. It serves as an entry point for command execution related to user authentication, ensuring that commands are processed correctly and errors are managed effectively.
 * 
 * INVARIANT: The CLI must be invoked with valid authentication parameters to function correctly.
 *
 * @seeAlso context.js (provides context management and error handling functionality.)
 * @seeAlso commander (used for command parsing and execution.)
 *
 * @cil-generated
 */







// CIL[BEGIN stable_id="~/.framework/cli/commands/auth.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/auth.ts"]
// CIL[DOC-MACRO purpose="Module setup and imports for auth.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Establish the public surface and dependencies of auth.ts"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/auth.ts" layer="cli" related_files=".framework/cli/context.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports required modules for auth.ts" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-AUDIENCE audience="cli"]
// CIL[DOC-STABILITY stability="stable"]
import type { Command } from 'commander'
import { buildCliContext, handleError } from '../context.js'

// CIL[DOC-VECTOR type="context" content="purpose='Module setup and imports for auth.ts'; No verified external callers; imports: .framework/cli/context.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/auth.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/auth.ts:registerAuthCommands:function" type="function" identity="registerAuthCommands" parent="~/.framework/cli/commands/auth.ts"]
// CIL[DOC-MACRO purpose="Implement registerAuthCommands"]
// CIL[DOC-RESPONSIBILITY responsibility="Execute the core logic for registerAuthCommands"]
// CIL[DOC-CONTEXT module=".framework/cli/commands/auth.ts" layer="cli" related_files=".framework/cli/commands/auth.ts,.framework/cli/context.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="result of the operation" errors="propagates dependency errors" side_effects="writes to stdout/stderr; calls process.exit"]
// CIL[DOC-MICRO logic_summary="Processes inputs, performs work, and returns output for registerAuthCommands" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
/**
 * Registers authentication-related commands for the CLI, enabling users to manage their identity and validate credentials. This module provides commands for displaying the current user's identity and checking credential validity.
 *
 * @macro       Command registration handler for authentication operations.
 * @micro       Defines subcommands under the 'auth' command with specific actions for each.
 * @inputSpec
 *   program: Command (required) — the CLI program instance to register commands with.
 * @outputSpec  none
 * @sideEffects none
 * @stability   internal
 * @calls       buildCliContext, handleError
 * @errorHandling none
 * @cil-generated
 */
export function registerAuthCommands(program: Command) {
  const auth = program
    .command('auth')
    .description('Authentication and identity commands')

  auth
    .command('whoami')
    .description('Show the resolved principal for the current environment config')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const ctx = await buildCliContext()
        const output = {
          principal_id: ctx.principal.id,
          principal_type: ctx.principal.type,
          account_id: ctx.accountId,
          display_name: ctx.principal.displayName,
          email: ctx.principal.email,
          roles: ctx.principal.roles,
          scopes: ctx.principal.scopes,
          request_id: ctx.requestId
        }

        if (opts.json) {
          console.log(JSON.stringify(output, null, 2))
        } else {
          console.log('\nSpine CLI — Current Identity')
          console.log('─'.repeat(40))
          console.log(`Principal ID:   ${output.principal_id}`)
          console.log(`Type:           ${output.principal_type}`)
          console.log(`Account:        ${output.account_id || '(none)'}`)
          if (output.display_name) console.log(`Name:           ${output.display_name}`)
          if (output.email) console.log(`Email:          ${output.email}`)
          if (output.roles?.length) console.log(`Roles:          ${output.roles.join(', ')}`)
          if (output.scopes?.length) console.log(`Scopes:         ${output.scopes.join(', ')}`)
          console.log(`Request ID:     ${output.request_id}`)
          console.log()
        }
      } catch (err: any) {
        handleError(err)
      }
    })

  auth
    .command('check')
    .description('Validate credentials — exits 0 if valid, 1 if not')
    .action(async () => {
      try {
        await buildCliContext()
        console.log('✓ Credentials valid')
        process.exit(0)
      } catch (err: any) {
        console.error(`✗ ${err.message}`)
        process.exit(1)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Implement registerAuthCommands'; No verified external callers; imports: .framework/cli/context.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/auth.ts:registerAuthCommands:function"]