// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/index.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/mcp/tools/kb/index.ts"]
// CIL[DOC-MACRO purpose="Re-export and aggregate Knowledge Base MCP tool modules (search, ingest, revoke, reindex, publish, upsert, delete, list-types) for unified server registration."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the integration surface that imports all kb tool submodules and exposes a single register() entry point for the MCP server."]
// CIL[DOC-CONTEXT module="index" layer="shared-core" related_files=".framework/mcp/tools/kb/delete.ts,.framework/mcp/tools/kb/ingest.ts,.framework/mcp/tools/kb/list-types.ts,.framework/mcp/tools/kb/publish.ts,.framework/mcp/tools/kb/reindex.ts,.framework/mcp/tools/kb/revoke.ts,.framework/mcp/tools/kb/search.ts,.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports the McpServer type and all sibling tool modules; contains no runtime logic itself." notable_decisions="Tool modules are imported as side-effect namespaces for their register() functions."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="both"]
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as search from './search.js'
import * as ingest from './ingest.js'
import * as revoke from './revoke.js'
import * as reindex from './reindex.js'
import * as publish from './publish.js'
import * as upsert from './upsert.js'
import * as remove from './delete.js'
import * as listTypes from './list-types.js'
// CIL[DOC-VECTOR type="context" content="purpose='Re-export and aggregate Knowledge Base MCP tool modules (search, ingest, revoke, reindex, publish, upsert, delete, list-types) for unified server registration.'; No verified external callers; imports: .framework/mcp/tools/kb/search.ts,.framework/mcp/tools/kb/ingest.ts,.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/index.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/mcp/tools/kb/index.ts:register:function" type="function" identity="register" parent="~/.framework/mcp/tools/kb/index.ts"]
// CIL[DOC-MACRO purpose="Register all Knowledge Base MCP tool handlers on a provided McpServer instance."]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize and attach search, ingest, revoke, reindex, publish, upsert, remove and listTypes tool registrations to the server."]
// CIL[DOC-CONTEXT module="index" layer="shared-core" related_files=".framework/mcp/tools/kb/delete.ts,.framework/mcp/tools/kb/index.ts,.framework/mcp/tools/kb/ingest.ts,.framework/mcp/tools/kb/list-types.ts,.framework/mcp/tools/kb/publish.ts,.framework/mcp/tools/kb/reindex.ts,.framework/mcp/tools/kb/revoke.ts,.framework/mcp/tools/kb/search.ts,.framework/mcp/tools/kb/upsert.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer (required)" outputs="void" errors="Exceptions thrown by submodule register() calls propagate to the caller." side_effects="Tool handlers are registered on the supplied McpServer."]
// CIL[DOC-MICRO logic_summary="Calls each submodule's register() method with the server argument, delegating initialization to the individual tool modules." notable_decisions="Registration order matches the import list; each tool owns its own handler attachment."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Register all Knowledge Base MCP tool handlers on a provided McpServer instance.'; No verified external callers; imports: .framework/mcp/tools/kb/search.ts,.framework/mcp/tools/kb/ingest.ts,.framework/mcp/tools/kb/revoke.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/tools/kb/index.ts:register:function"]