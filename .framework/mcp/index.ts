import './load-env.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import * as architectTools from './tools/architect.js'
import * as kbTools from './tools/kb/index.js'
import * as observabilityTools from './tools/observability.js'

const server = new McpServer({
  name: 'spine-framework',
  version: '1.0.0',
})

architectTools.register(server)
kbTools.register(server)
observabilityTools.register(server)

async function main() {
  const missingEnv = []
  if (!process.env.SPINE_URL) missingEnv.push('SPINE_URL')
  if (!process.env.SPINE_API_KEY) missingEnv.push('SPINE_API_KEY')

  if (missingEnv.length > 0) {
    process.stderr.write(
      `[spine-framework-mcp] ERROR: Missing required environment variables: ${missingEnv.join(', ')}\n` +
      `Set SPINE_URL and SPINE_API_KEY in the MCP host config (env block).\n`
    )
    process.exit(1)
  }

  const transport = new StdioServerTransport()
  await server.connect(transport)
  process.stderr.write('[spine-framework-mcp] Server running on stdio\n')
}

main().catch(err => {
  process.stderr.write(`[spine-framework-mcp] Fatal error: ${err}\n`)
  process.exit(1)
})
