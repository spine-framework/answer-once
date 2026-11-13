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







import type { Command } from 'commander'
import { buildCliContext, handleError } from '../context.js'

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