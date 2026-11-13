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




import type { Command } from 'commander'
import { buildCliContext, printResult, handleError } from '../context.ts'
import { runAgent, adminDb } from '../../functions/_shared/index.ts'



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
