// CIL[BEGIN stable_id="~/.framework/cli/commands/items.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/cli/commands/items.ts"]
// CIL[DOC-MACRO purpose="Import dependencies and define module context for the items CLI command group"]
// CIL[DOC-RESPONSIBILITY responsibility="Load Commander type, CLI context utilities, and shared admin database access for use by registerItemCommands"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="Imported Command type, buildCliContext, printResult, handleError, adminDb" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Static import block for the items command module" notable_decisions="Uses path-relative .ts imports to remain Deno/Node compatible"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="cli-developer"]




import type { Command } from 'commander'
import { buildCliContext, printResult, handleError } from '../context.ts'
import { adminDb } from '../../functions/_shared/index.ts'
// CIL[DOC-VECTOR type="context" content="purpose='Import dependencies and define module context for the items CLI command group'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/items.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/cli/commands/items.ts:registerItemCommands:function" type="function" identity="registerItemCommands" parent="~/.framework/cli/commands/items.ts"]
// CIL[DOC-MACRO purpose="Register items subcommands (list, get, create, update, delete) with the CLI program"]
// CIL[DOC-RESPONSIBILITY responsibility="Attach item record management commands to a Commander program, handling account scoping, type resolution, CRUD operations, and soft/hard deletion"]
// CIL[DOC-CONTEXT module="cli" layer="commands" related_files=".framework/cli/commands/items.ts,.framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-CONTRACT inputs="program: Command" outputs="Side-effect: registers the 'items' command with list/get/create/update/delete subcommands and their options" errors="Throws Error for missing account, missing or invalid item type, invalid JSON data, database errors, and not-found records" side_effects="Prints results to stdout via printResult/console.log; reads and writes public.items and public.types rows"]
// CIL[DOC-MICRO logic_summary="Configures Commander subcommands for item records; each action builds a CLI context, resolves the item type by slug when needed, performs adminDb queries, and prints or handles errors" notable_decisions="Account required for create; soft delete is default unless --hard is provided; result limit is parsed with parseInt; JSON output is optional"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export function registerItemCommands(program: Command) {
  const items = program
    .command('items')
    .description('Item record management')

  items
    .command('list')
    .description('List items, optionally filtered by type')
    .option('--type <slug>', 'Filter by item type slug')
    .option('--account <id>', 'Account scope')
    .option('--limit <n>', 'Max results', '20')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const ctx = await buildCliContext({ account: opts.account })

        let query = adminDb
          .from('items')
          .select('id, type_id, title, status, is_active, created_at')
          .order('created_at', { ascending: false })
          .limit(parseInt(opts.limit))

        if (ctx.accountId) {
          query = query.eq('account_id', ctx.accountId)
        }

        if (opts.type) {
          const { data: typeRecord } = await adminDb
            .from('types')
            .select('id')
            .eq('slug', opts.type)
            .single()

          if (!typeRecord) throw new Error(`Item type not found: ${opts.type}`)
          query = query.eq('type_id', typeRecord.id)
        }

        const { data, error } = await query
        if (error) throw new Error(error.message)
        printResult(data || [], { json: opts.json })
      } catch (err: any) {
        handleError(err)
      }
    })

  items
    .command('get <id>')
    .description('Get a single item by ID')
    .option('--json', 'Output as JSON')
    .action(async (id, opts) => {
      try {
        await buildCliContext()

        const { data, error } = await adminDb
          .from('items')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) throw new Error(error?.message || `Item not found: ${id}`)
        printResult(data, { json: opts.json })
      } catch (err: any) {
        handleError(err)
      }
    })

  items
    .command('create')
    .description('Create a new item')
    .requiredOption('--type <slug>', 'Item type slug')
    .option('--data <json>', 'Item data as JSON', '{}')
    .option('--title <title>', 'Item title')
    .option('--account <id>', 'Account scope')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      try {
        const ctx = await buildCliContext({ account: opts.account })

        if (!ctx.accountId) {
          throw new Error('--account or SPINE_CLI_ACCOUNT_ID required to create items')
        }

        const { data: typeRecord, error: typeError } = await adminDb
          .from('types')
          .select('id')
          .eq('slug', opts.type)
          .single()

        if (typeError || !typeRecord) throw new Error(`Item type not found: ${opts.type}`)

        let itemData: any = {}
        try {
          itemData = JSON.parse(opts.data)
        } catch {
          throw new Error(`--data must be valid JSON. Got: ${opts.data}`)
        }

        const { data, error } = await adminDb
          .from('items')
          .insert({
            type_id: typeRecord.id,
            account_id: ctx.accountId,
            title: opts.title || itemData.title || null,
            data: itemData,
            is_active: true,
            created_by: ctx.principal.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw new Error(error.message)
        if (opts.json) {
          console.log(JSON.stringify(data, null, 2))
        } else {
          console.log(`✓ Created item ${data.id}`)
          printResult(data, { json: false })
        }
      } catch (err: any) {
        handleError(err)
      }
    })

  items
    .command('update <id>')
    .description('Update item data fields')
    .option('--data <json>', 'Partial item data as JSON', '{}')
    .option('--title <title>', 'Update item title')
    .option('--json', 'Output as JSON')
    .action(async (id, opts) => {
      try {
        const ctx = await buildCliContext()

        let patchData: any = {}
        try {
          patchData = JSON.parse(opts.data)
        } catch {
          throw new Error(`--data must be valid JSON`)
        }

        const updates: any = {
          updated_at: new Date().toISOString(),
          updated_by: ctx.principal.id
        }
        if (opts.title) updates.title = opts.title
        if (Object.keys(patchData).length > 0) updates.data = patchData

        const { data, error } = await adminDb
          .from('items')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw new Error(error.message)
        if (opts.json) {
          console.log(JSON.stringify(data, null, 2))
        } else {
          console.log(`✓ Updated item ${id}`)
          printResult(data, { json: false })
        }
      } catch (err: any) {
        handleError(err)
      }
    })

  items
    .command('delete <id>')
    .description('Soft-delete an item (sets is_active = false)')
    .option('--hard', 'Hard delete — permanently removes the record')
    .option('--json', 'Output as JSON')
    .action(async (id, opts) => {
      try {
        const ctx = await buildCliContext()

        if (opts.hard) {
          const { error } = await adminDb
            .from('items')
            .delete()
            .eq('id', id)

          if (error) throw new Error(error.message)
          console.log(`✓ Hard-deleted item ${id}`)
        } else {
          const { data, error } = await adminDb
            .from('items')
            .update({
              is_active: false,
              updated_at: new Date().toISOString(),
              updated_by: ctx.principal.id
            })
            .eq('id', id)
            .select('id, is_active')
            .single()

          if (error) throw new Error(error.message)
          const out = opts.json ? JSON.stringify(data) : `✓ Soft-deleted item ${id}`
          console.log(out)
        }
      } catch (err: any) {
        handleError(err)
      }
    })
}
// CIL[DOC-VECTOR type="context" content="purpose='Register items subcommands (list, get, create, update, delete) with the CLI program'; No verified external callers; imports: .framework/cli/context.ts,.framework/functions/_shared/index.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/cli/commands/items.ts:registerItemCommands:function"]