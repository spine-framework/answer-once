/**
 * @module   agents
 * @audience both
 * @layer    shared-core
 * @stability stable
 *
 * This module provides command-line interface (CLI) commands for managing agents within the system. It serves as a bridge between user input and the underlying agent functionalities, facilitating operations such as running agents and interacting with the admin database. INVARIANT: The commands must be executed within a valid CLI context to ensure proper functionality.
 *
 * @seeAlso context.ts (provides CLI context management).
 * @seeAlso _shared/index.ts (contains shared functions for agent operations).
 *
 * @cil-generated
 */




// CIL[BEGIN stable_id="~/.framework/cli/commands/agents.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/agents.ts"]
// CIL[DOC-AUDIENCE audience="both"]
// CIL[DOC-MACRO purpose="Top-level module imports for the agents CLI command set."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the external dependencies used by the agents CLI commands."]
// CIL[DOC-CONTEXT module="agents" layer="shared-core" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="Command type and shared helper functions for the agents command module" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the Commander Command type, CLI context utilities, and shared agent functions." notable_decisions="Uses explicit .ts extensions on relative imports."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
import type { Command } from 'commander'
import { buildCliContext, printResult, handleError } from '../context.ts'
import { runAgent, adminDb } from '../../functions/_shared/index.ts'



// CIL[DOC-VECTOR type="context" content="purpose='Top-level module imports for the agents CLI command set.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/agents.ts:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/cli/commands/agents.ts:registerAgentCommands:function" type="function" identity="registerAgentCommands" parent="~/.framework/cli/commands/agents.ts"]
// CIL[DOC-MACRO purpose="Register agent and thread subcommands with a Commander program."]
// CIL[DOC-RESPONSIBILITY responsibility="Attach 'agents run', 'threads list', and 'threads get' command handlers to the program."]
// CIL[DOC-CONTEXT module="agents" layer="shared-core" related_files=".framework/cli/commands/agents.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Commander Command" outputs="none (mutates the program)" errors="throws Error for database or runtime failures, handled by handleError" side_effects="registers CLI commands, queries the admin database, prints to stdout"]
// CIL[DOC-MICRO logic_summary="Creates the 'agents' command group and attaches run/list/get actions, builds CLI context, calls runAgent and adminDb queries, and prints results." notable_decisions="Uses async action handlers; supports optional account scoping and JSON output."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY internal]
/**
 * Registers commands for interacting with AI agents, including sending messages and managing agent threads. This module facilitates user interaction with agent functionalities through a command-line interface.
 *
 * @macro       Command registration handler for AI agent operations.
 * @micro       Defines nested commands for running agents and managing threads, utilizing asynchronous actions to handle user input.
 * @inputSpec
 *   program: Command (required) — The command program instance to register agent commands with.
 * @outputSpec  none
 * @sideEffects none
 * @stability   internal
 * @calls       buildCliContext, runAgent, adminDb.from, printResult, handleError
 * @errorHandling catches and handles errors during command execution.
 * @cil-generated
 */
export function registerAgentCommands(program: Command) {
  const agents = program
    .command('agents')
    .description('AI agent interaction')

  agents
    .command('run <threadId>')
    .description('Send a message to an agent thread and get a response')
    .requiredOption('--message <text>', 'The message to send')
    .option('--account <id>', 'Account scope')
    .option('--json', 'Output as JSON')
    .action(async (threadId, opts) => {
      try {
        const ctx = await buildCliContext({ account: opts.account })

        console.log(`Sending message to thread ${threadId}...`)
        const response = await runAgent(threadId, opts.message, ctx)

        if (opts.json) {
          console.log(JSON.stringify(response, null, 2))
        } else {
          console.log('\n─── Agent Response ───')
          console.log(response.content || JSON.stringify(response))
          console.log('─────────────────────')
          if (response.data?.confidence !== undefined) {
            console.log(`Confidence: ${(response.data.confidence * 100).toFixed(0)}%`)
          }
          console.log()
        }
      } catch (err: any) {
        handleError(err)
      }
    })

  const threads = agents
    .command('threads')
    .description('Agent thread management')

  threads
    .command('list')
    .description('List agent threads')
    .option('--account <id>', 'Account scope')
    .option('--limit <n>', 'Max results', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const ctx = await buildCliContext({ account: opts.account })

        let query = adminDb
          .from('threads')
          .select('id, title, status, created_at')
          .order('created_at', { ascending: false })
          .limit(parseInt(opts.limit))

        if (ctx.accountId) {
          query = query.eq('account_id', ctx.accountId)
        }

        const { data, error } = await query
        if (error) throw new Error(error.message)
        printResult(data || [], { json: opts.json })
      } catch (err: any) {
        handleError(err)
      }
    })

  threads
    .command('get <id>')
    .description('Get thread details and recent messages')
    .option('--limit <n>', 'Number of messages to show', '20')
    .option('--json', 'Output as JSON')
    .action(async (id, opts) => {
      try {
        await buildCliContext()

        const { data: thread, error: threadError } = await adminDb
          .from('threads')
          .select('*')
          .eq('id', id)
          .single()

        if (threadError || !thread) throw new Error(`Thread not found: ${id}`)

        const { data: messages, error: msgError } = await adminDb
          .from('messages')
          .select('id, content, data, created_at')
          .eq('thread_id', id)
          .order('created_at', { ascending: true })
          .limit(parseInt(opts.limit))

        if (msgError) throw new Error(msgError.message)

        if (opts.json) {
          console.log(JSON.stringify({ thread, messages }, null, 2))
        } else {
          console.log(`\nThread: ${thread.title || thread.id}`)
          console.log(`Status: ${thread.status || 'open'}`)
          console.log('─'.repeat(50))
          for (const msg of messages || []) {
            const msgType = msg.data?.message_type || 'message'
            const prefix = msgType === 'human' ? 'You' : msgType === 'agent' ? 'Agent' : msgType
            console.log(`\n[${prefix}] ${msg.created_at}`)
            console.log(msg.content)
          }
          console.log()
        }
      } catch (err: any) {
        handleError(err)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register agent and thread subcommands with a Commander program.'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/agents.ts:registerAgentCommands:function"]
