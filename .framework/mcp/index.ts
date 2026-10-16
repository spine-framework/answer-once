// CIL[BEGIN stable_id="~/.framework/mcp/index.ts:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="Initialize and wire up the Spine MCP server with all registered tool modules."]
// CIL[DOC-RESPONSIBILITY responsibility="Load environment configuration, create the McpServer instance, and import and register every tool module."]
// CIL[DOC-CONTEXT module="mcp" layer="entry-point" related_files=".framework/mcp/load-env.ts,.framework/mcp/tools/architect.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/graph.ts,.framework/mcp/tools/cil/ingest.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts,.framework/mcp/tools/cil/pipeline.ts,.framework/mcp/tools/cil/project.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search.ts,.framework/mcp/tools/cil/validate.ts,.framework/mcp/tools/kb/index.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Imports the environment loader, McpServer SDK, all tool modules, and registers each module with a shared server instance." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="framework"]
import './load-env.js'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import * as contextTools from './tools/cil/context.js'
import * as searchTools from './tools/cil/search.js'
import * as graphTools from './tools/cil/graph.js'
import * as validateTools from './tools/cil/validate.js'
import * as projectTools from './tools/cil/project.js'
import * as pipelineTools from './tools/cil/pipeline.js'
import * as pipelineOrchestratorTools from './tools/cil/pipeline-orchestrator.js'
import * as ingestTools from './tools/cil/ingest.js'
import * as retrievalTools from './tools/cil/retrieval.js'
import * as architectTools from './tools/architect.js'
import * as kbTools from './tools/kb/index.js'
import * as observabilityTools from './tools/observability.js'
// CIL[DOC-VECTOR type="context" content="purpose='Initialize and wire up the Spine MCP server with all registered tool modules.'; No verified external callers; imports: .framework/mcp/load-env.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/index.ts:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/mcp/index.ts:server:constant" type="constant" identity="server" parent="none"]
// CIL[DOC-MACRO purpose="Define the configured McpServer instance used by the framework."]
// CIL[DOC-RESPONSIBILITY responsibility="Instantiate the shared McpServer with the framework name and version."]
// CIL[DOC-CONTEXT module="mcp" layer="server" related_files=".framework/mcp/index.ts,.framework/mcp/load-env.ts,.framework/mcp/tools/architect.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/graph.ts,.framework/mcp/tools/cil/ingest.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts,.framework/mcp/tools/cil/pipeline.ts,.framework/mcp/tools/cil/project.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search.ts,.framework/mcp/tools/cil/validate.ts,.framework/mcp/tools/kb/index.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="server: McpServer" errors="[]" side_effects="[]"]
// CIL[DOC-MICRO logic_summary="Constructs a new McpServer named 'spine-framework' at version '1.0.0'." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const server = new McpServer({
  name: 'spine-framework',
  version: '1.0.0',
})
// CIL[DOC-VECTOR type="context" content="purpose='Define the configured McpServer instance used by the framework.'; No verified external callers; imports: .framework/mcp/load-env.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/index.ts:server:constant"]

// CIL[BEGIN stable_id="~/.framework/mcp/index.ts:tool_registrations:block" type="block" identity="tool_registrations" parent="none"]
// CIL[DOC-MACRO purpose="Register all imported tool modules with the McpServer."]
// CIL[DOC-RESPONSIBILITY responsibility="Attach CIL, architect, KB, and observability tool handlers to the McpServer."]
// CIL[DOC-CONTEXT module="mcp" layer="registration" related_files=".framework/mcp/index.ts,.framework/mcp/load-env.ts,.framework/mcp/tools/architect.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/graph.ts,.framework/mcp/tools/cil/ingest.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts,.framework/mcp/tools/cil/pipeline.ts,.framework/mcp/tools/cil/project.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search.ts,.framework/mcp/tools/cil/validate.ts,.framework/mcp/tools/kb/index.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="server: McpServer" outputs="server with tool handlers registered" errors="[]" side_effects="mutates the McpServer"]
// CIL[DOC-MICRO logic_summary="Calls register(server) for each imported tool module in turn." notable_decisions="Registration order follows import order."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
contextTools.register(server)
searchTools.register(server)
graphTools.register(server)
validateTools.register(server)
projectTools.register(server)
pipelineTools.register(server)
pipelineOrchestratorTools.register(server)
ingestTools.register(server)
retrievalTools.register(server)
architectTools.register(server)
kbTools.register(server)
observabilityTools.register(server)
// CIL[DOC-VECTOR type="context" content="purpose='Register all imported tool modules with the McpServer.'; No verified external callers; imports: .framework/mcp/load-env.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/index.ts:tool_registrations:block"]

// CIL[BEGIN stable_id="~/.framework/mcp/index.ts:main:function" type="function" identity="main" parent="none"]
// CIL[DOC-MACRO purpose="Start the MCP server after validating required environment variables."]
// CIL[DOC-RESPONSIBILITY responsibility="Verify SPINE_URL and SPINE_API_KEY, create a stdio transport, connect the server, and log startup."]
// CIL[DOC-CONTEXT module="mcp" layer="runtime" related_files=".framework/mcp/index.ts,.framework/mcp/load-env.ts,.framework/mcp/tools/architect.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/graph.ts,.framework/mcp/tools/cil/ingest.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts,.framework/mcp/tools/cil/pipeline.ts,.framework/mcp/tools/cil/project.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search.ts,.framework/mcp/tools/cil/validate.ts,.framework/mcp/tools/kb/index.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="process.env" outputs="stdio transport connection" errors="Missing required environment variables" side_effects="process.exit(1) on validation failure; writes to stderr"]
// CIL[DOC-MICRO logic_summary="Collect missing environment variables; if any are missing, log an error and exit. Otherwise connect the server to stdio and log a startup message." notable_decisions="Fails fast when SPINE_URL or SPINE_API_KEY are unset."]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
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
// CIL[DOC-VECTOR type="context" content="purpose='Start the MCP server after validating required environment variables.'; No verified external callers; imports: .framework/mcp/load-env.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/index.ts:main:function"]

// CIL[BEGIN stable_id="~/.framework/mcp/index.ts:error_handling:block" type="block" identity="error_handling" parent="none"]
// CIL[DOC-MACRO purpose="Catch unhandled fatal errors from main() and terminate the process."]
// CIL[DOC-RESPONSIBILITY responsibility="Wrap main() execution, log any rejection, and exit with a fatal error code."]
// CIL[DOC-CONTEXT module="mcp" layer="error-handling" related_files=".framework/mcp/index.ts,.framework/mcp/load-env.ts,.framework/mcp/tools/architect.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/graph.ts,.framework/mcp/tools/cil/ingest.ts,.framework/mcp/tools/cil/pipeline-orchestrator.ts,.framework/mcp/tools/cil/pipeline.ts,.framework/mcp/tools/cil/project.ts,.framework/mcp/tools/cil/retrieval.ts,.framework/mcp/tools/cil/search.ts,.framework/mcp/tools/cil/validate.ts,.framework/mcp/tools/kb/index.ts,.framework/mcp/tools/observability.ts"]
// CIL[DOC-CONTRACT inputs="main(): Promise<void>" outputs="none" errors="[]" side_effects="process.stderr.write; process.exit(1)"]
// CIL[DOC-MICRO logic_summary="Attaches a catch handler to main() that writes the error to stderr and exits." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
main().catch(err => {
  process.stderr.write(`[spine-framework-mcp] Fatal error: ${err}\n`)
  process.exit(1)
})
// CIL[DOC-VECTOR type="context" content="purpose='Catch unhandled fatal errors from main() and terminate the process.'; No verified external callers; imports: .framework/mcp/load-env.ts,.framework/mcp/tools/cil/context.ts,.framework/mcp/tools/cil/search.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/mcp/index.ts:error_handling:block"]
