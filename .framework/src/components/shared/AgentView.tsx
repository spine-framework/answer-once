// CIL[BEGIN stable_id="~/.framework/src/components/shared/AgentView.tsx:module_header:module_header" type="module_header" identity="module_header" parent="none"]
// CIL[DOC-MACRO purpose="React component for rendering agent/developer API call examples and live response data for Spine endpoints"]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the module header, imports, and default export for the AgentView shared component"]
// CIL[DOC-CONTEXT module="shared" layer="presentation" related_files=".framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Imports React, hooks, and lucide-react icons; no active logic at module level" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developer"]


import React, { useState, useEffect } from 'react'
import { Code, Terminal, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

// CIL[DOC-VECTOR type="context" content="purpose='React component for rendering agent/developer API call examples and live response data for Spine endpoints'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/AgentView.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/AgentView.tsx:agentviewprops:interface" type="interface" identity="agentviewprops" parent="~/.framework/src/components/shared/AgentView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Type definition for the AgentView component props"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the shape of data, endpoint, method, query, body, and title props"]
// CIL[DOC-CONTEXT module="shared" layer="presentation" related_files=".framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="AgentViewProps interface" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Optional method, query, body, and title fields extend required data and endpoint fields" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface AgentViewProps {
  data: any
  endpoint: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  query?: Record<string, any>
  body?: any
  title?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Type definition for the AgentView component props'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/AgentView.tsx:agentviewprops:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/AgentView.tsx:agentview:function" type="function" identity="agentview" parent="~/.framework/src/components/shared/AgentView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Render an expandable panel with cURL, fetch, Spine CLI examples and the JSON response"]
// CIL[DOC-RESPONSIBILITY responsibility="Build command strings from props and present copyable code blocks"]
// CIL[DOC-CONTEXT module="shared" layer="presentation" related_files=".framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-CONTRACT inputs="data, endpoint, method, query, body, title" outputs="JSX collapsible AgentView panel" errors="none" side_effects="writes to navigator.clipboard and sets a 2s copied timer"]
// CIL[DOC-MICRO logic_summary="Computes base URL, full URL, curl/fetch/cli snippets; toggles open state and copy feedback" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function AgentView({
  data,
  endpoint,
  method = 'GET',
  query,
  body,
  title = 'Agent View'
}: AgentViewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const baseUrl = window.location.origin
  const fullUrl = `${baseUrl}${endpoint}${query ? '?' + new URLSearchParams(query).toString() : ''}`

  const curlCmd = `curl -X ${method} \\
  ${method !== 'GET' ? `-H "Content-Type: application/json" \\
  ` : ''}${baseUrl}${endpoint}${query ? '?' + new URLSearchParams(query).toString() : ''}${method !== 'GET' && body ? ` \\
  -d '${JSON.stringify(body, null, 2)}'` : ''}`

  const fetchCode = `fetch('${baseUrl}${endpoint}${query ? '?' + new URLSearchParams(query).toString() : ''}', {
  method: '${method}',${method !== 'GET' ? `
  headers: { 'Content-Type': 'application/json' },` : ''}${method !== 'GET' && body ? `
  body: JSON.stringify(${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')})` : ''}
})
  .then(r => r.json())
  .then(data => console.log(data))`

  const cliCmd = `spine ${endpoint.replace('/.netlify/functions/', '').replace(/\//g, ' ')} ${query?.id || query?.slug || ''}${method === 'POST' && body ? ` --data '${JSON.stringify(body)}'` : ''}${method === 'PATCH' && body ? ` --update '${JSON.stringify(body)}'` : ''}${method === 'DELETE' ? ' --delete' : ''}`

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="mt-6 border border-gray-200 rounded-lg bg-gray-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-700">{title}</span>
          <span className="text-xs text-gray-500">(for agents & developers)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span className="font-mono font-bold">{method}</span>
              <span className="font-mono">{endpoint}</span>
              {query && (
                <span className="text-blue-600">
                  with query: {JSON.stringify(query)}
                </span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Code className="w-4 h-4" />
                  Response JSON
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(data, null, 2), 'json')}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  {copied === 'json' ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  {copied === 'json' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-auto max-h-64 font-mono">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">cURL</div>
                  <button
                    onClick={() => handleCopy(curlCmd, 'curl')}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copied === 'curl' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'curl' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-auto max-h-32 font-mono">
                  {curlCmd}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-700">JavaScript Fetch</div>
                  <button
                    onClick={() => handleCopy(fetchCode, 'fetch')}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copied === 'fetch' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'fetch' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-gray-800 text-gray-100 p-3 rounded text-xs overflow-auto max-h-32 font-mono">
                  {fetchCode}
                </pre>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Terminal className="w-4 h-4" />
                  Spine CLI
                </div>
                <button
                    onClick={() => handleCopy(cliCmd, 'cli')}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {copied === 'cli' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'cli' ? 'Copied!' : 'Copy'}
                  </button>
              </div>
              <pre className="bg-green-900 text-green-100 p-3 rounded text-xs overflow-auto font-mono">
                {cliCmd}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render an expandable panel with cURL, fetch, Spine CLI examples and the JSON response'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/AgentView.tsx:agentview:function"]

// CIL[BEGIN stable_id="~/.framework/src/components/shared/AgentView.tsx:default:function" type="function" identity="default" parent="~/.framework/src/components/shared/AgentView.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Default export of the AgentView component"]
// CIL[DOC-RESPONSIBILITY responsibility="Export AgentView as the module default for convenient imports"]
// CIL[DOC-CONTEXT module="shared" layer="presentation" related_files=".framework/src/components/shared/AgentView.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="AgentView default export" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Re-exports AgentView as the module default" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export default AgentView
// CIL[DOC-VECTOR type="context" content="purpose='Default export of the AgentView component'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/shared/AgentView.tsx:default:function"]
