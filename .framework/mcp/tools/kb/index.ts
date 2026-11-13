import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as search from './search.js'
import * as ingest from './ingest.js'
import * as revoke from './revoke.js'
import * as reindex from './reindex.js'
import * as publish from './publish.js'
import * as upsert from './upsert.js'
import * as remove from './delete.js'
import * as listTypes from './list-types.js'


export function register(server: McpServer) {
  search.register(server)
  ingest.register(server)
  revoke.register(server)
  reindex.register(server)
  publish.register(server)
  upsert.register(server)
  remove.register(server)
  listTypes.register(server)
}