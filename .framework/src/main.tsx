// CIL[BEGIN stable_id="~/.framework/src/main.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/main.tsx"]
// CIL[DOC-MACRO purpose="Initialize the React application root, configure providers, and mount the app into the DOM"]
// CIL[DOC-RESPONSIBILITY responsibility="Import dependencies, create the query client, and render the application root"]
// CIL[DOC-CONTEXT module="main" layer="ui_entry" related_files=".framework/src/App.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/index.css"]
// CIL[DOC-CONTRACT inputs="none" outputs="mounted React root" errors="runtime if #root is missing or providers fail" side_effects="renders into DOM"]
// CIL[DOC-MICRO logic_summary="Imports React, DOM, router, query client, App, auth context and global styles, then creates the query client and mounts the app" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="frontend maintainers"]
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
// CIL[DOC-VECTOR type="context" content="purpose='Initialize the React application root, configure providers, and mount the app into the DOM'; No verified external callers; imports: .framework/src/App.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/index.css"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/main.tsx:module_header:module_header"]

// CIL[BEGIN stable_id="~/.framework/src/main.tsx:queryclient:constant" type="constant" identity="queryclient" parent="~/.framework/src/main.tsx"]
// CIL[DOC-MACRO purpose="Create a configured TanStack Query client for the application"]
// CIL[DOC-RESPONSIBILITY responsibility="Hold the query client instance with default query options"]
// CIL[DOC-CONTEXT module="main" layer="data_fetching" related_files=".framework/src/App.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/index.css,.framework/src/main.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="queryClient instance" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Instantiates QueryClient with retry set to 1 and window focus refetch disabled" notable_decisions=""]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
// CIL[DOC-VECTOR type="context" content="purpose='Create a configured TanStack Query client for the application'; No verified external callers; imports: .framework/src/App.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/index.css"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/main.tsx:queryclient:constant"]

// CIL[BEGIN stable_id="~/.framework/src/main.tsx:render:statement" type="statement" identity="render" parent="~/.framework/src/main.tsx"]
// CIL[DOC-MACRO purpose="Mount the React application to the DOM root"]
// CIL[DOC-RESPONSIBILITY responsibility="Render the application inside the query, router and auth providers"]
// CIL[DOC-CONTEXT module="main" layer="ui_entry" related_files=".framework/src/App.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/index.css,.framework/src/main.tsx"]
// CIL[DOC-CONTRACT inputs="queryClient" outputs="rendered React tree" errors="error if root element is missing" side_effects="mutates DOM"]
// CIL[DOC-MICRO logic_summary="Calls ReactDOM.createRoot on the #root element and renders the provider hierarchy with App" notable_decisions="uses non-null assertion for getElementById"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>,
)
// CIL[DOC-VECTOR type="context" content="purpose='Mount the React application to the DOM root'; No verified external callers; imports: .framework/src/App.tsx,.framework/src/contexts/AuthContext.tsx,.framework/src/index.css"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/main.tsx:render:statement"]
