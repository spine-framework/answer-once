// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]

// CIL[DOC-MACRO purpose="Provide the CIL graph visualization page for exploring file and chunk call graphs."]
// CIL[DOC-RESPONSIBILITY responsibility="Render an interactive React Flow graph, switch view modes, and display node details."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="rendered admin page" errors="none" side_effects="fetches graph data from API, updates browser UI state"]
// CIL[DOC-MICRO logic_summary="Imports dependencies and PageInstructions component for the admin CIL graph page." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-ui-developers"]

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:module_header:module_header"]
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type Connection,
  MarkerType,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import dagre from 'dagre'
import { apiFetch } from '@core/lib/api'
import { Button } from '@core/components/ui/button'
import { Badge } from '@core/components/ui/badge'
import { Skeleton } from '@core/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@core/components/ui/select'
import { RefreshCw, ChevronRight, ZoomIn, Layers } from 'lucide-react'



// CIL[DOC-VECTOR type="context" content="purpose='Provide the CIL graph visualization page for exploring file and chunk call graphs.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Define the default width for graph nodes."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a constant node width used by layout and rendering."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="NODE_WIDTH numeric constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the NODE_WIDTH constant value." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:NODE_WIDTH:constant" type="constant" identity="NODE_WIDTH" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
const NODE_WIDTH  = 180
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:NODE_WIDTH:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Define the default width for graph nodes.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Define the default height for graph nodes."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a constant node height used by layout and rendering."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="NODE_HEIGHT numeric constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the NODE_HEIGHT constant value." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:NODE_HEIGHT:constant" type="constant" identity="NODE_HEIGHT" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
const NODE_HEIGHT = 60
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:NODE_HEIGHT:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Define the default height for graph nodes.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Define the default width for file nodes in the graph."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a constant file node width used by layout and rendering."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="FILE_WIDTH numeric constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the FILE_WIDTH constant value." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:FILE_WIDTH:constant" type="constant" identity="FILE_WIDTH" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
const FILE_WIDTH  = 200
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:FILE_WIDTH:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Define the default width for file nodes in the graph.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[DOC-MACRO purpose="Define the default height for file nodes in the graph."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a constant file node height used by layout and rendering."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="FILE_HEIGHT numeric constant" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares the FILE_HEIGHT constant value." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:FILE_HEIGHT:constant" type="constant" identity="FILE_HEIGHT" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
const FILE_HEIGHT = 40
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:FILE_HEIGHT:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Define the default height for file nodes in the graph.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Define the allowed graph view modes."]
// CIL[DOC-RESPONSIBILITY responsibility="Constrain the viewMode state to files, chunks, or mixed display."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="ViewMode union type" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a union type of three possible view modes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:ViewMode:type" type="type" identity="ViewMode" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
type ViewMode = 'files' | 'chunks' | 'mixed'
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:ViewMode:type"]
// CIL[DOC-VECTOR type="context" content="purpose='Define the allowed graph view modes.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Apply a directed graph layout to React Flow nodes and edges."]
// CIL[DOC-RESPONSIBILITY responsibility="Compute x/y positions for nodes using dagre and return positioned nodes with unchanged edges."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="nodes: Node[], edges: Edge[]" outputs="{ nodes: Node[], edges: Edge[] }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Builds a dagre graph, sets node sizes, runs the layout, and maps each node to a centered position." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:layoutGraph:function" type="function" identity="layoutGraph" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
function layoutGraph(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 80 })

  for (const node of nodes) {
    g.setNode(node.id, { width: node.data?.isFile ? FILE_WIDTH : NODE_WIDTH, height: node.data?.isFile ? FILE_HEIGHT : NODE_HEIGHT })
  }
  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  const positionedNodes = nodes.map(node => {
    const pos = g.node(node.id)
    const w = node.data?.isFile ? FILE_WIDTH : NODE_WIDTH
    const h = node.data?.isFile ? FILE_HEIGHT : NODE_HEIGHT
    return { ...node, position: { x: pos.x - w / 2, y: pos.y - h / 2 } }
  })

  return { nodes: positionedNodes, edges }
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:layoutGraph:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Apply a directed graph layout to React Flow nodes and edges.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]





// CIL[DOC-MACRO purpose="Map chunk types to display colors for the graph legend and nodes."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide a color palette used by nodeColor and the graph legend."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="Record<string, string> of chunk type colors" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a lookup table of chunk type to hex color values." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:CHUNK_TYPE_COLORS:constant" type="constant" identity="CHUNK_TYPE_COLORS" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
const CHUNK_TYPE_COLORS: Record<string, string> = {
  function:  '#6366F1', 
  class:     '#8B5CF6', 
  interface: '#10B981', 
  type:      '#06B6D4', 
  component: '#F59E0B', 
  hook:      '#EC4899', 
  route:     '#EF4444', 
  config:    '#64748B', 
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:CHUNK_TYPE_COLORS:constant"]
// CIL[DOC-VECTOR type="context" content="purpose='Map chunk types to display colors for the graph legend and nodes.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




// CIL[DOC-MACRO purpose="Resolve the display color for a graph node based on its data."]
// CIL[DOC-RESPONSIBILITY responsibility="Return a color string for React Flow nodes and the MiniMap."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="node: Node" outputs="hex color string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Chooses a dark slate color for files, a muted gray for dead code, or the chunk type color lookup." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:nodeColor:function" type="function" identity="nodeColor" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
function nodeColor(node: Node): string {
  if (node.data?.isFile) return '#1E293B'
  if (node.data?.is_dead_code) return '#94A3B8'
  return CHUNK_TYPE_COLORS[node.data?.chunk_type as string] || '#6366F1'
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:nodeColor:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Resolve the display color for a graph node based on its data.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




// CIL[DOC-MACRO purpose="Describe the shape of the CIL project graph payload."]
// CIL[DOC-RESPONSIBILITY responsibility="Type the file and chunk nodes plus import and call edges returned by the graph API."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="ProjectGraph interface definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Defines nested file and chunk node arrays and import/call edge arrays with optional metadata." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:ProjectGraph:interface" type="interface" identity="ProjectGraph" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
interface ProjectGraph {
  nodes: {
    files: any[]
    chunks: any[]
  }
  edges: {
    imports: { source_id: string; target_id: string; metadata?: any }[]
    calls: { source_id: string; target_id: string; metadata?: any }[]
  }
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:ProjectGraph:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Describe the shape of the CIL project graph payload.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[DOC-MACRO purpose="Build React Flow nodes and edges from a CIL project graph."]
// CIL[DOC-RESPONSIBILITY responsibility="Convert project graph files, chunks, imports, and calls into React Flow elements."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="graph: ProjectGraph, viewMode: ViewMode" outputs="{ nodes: Node[], edges: Edge[] }" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Creates file and chunk nodes with styles and adds import/call edges for the selected view mode, then runs layoutGraph." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:buildFlowGraph:function" type="function" identity="buildFlowGraph" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
function buildFlowGraph(graph: ProjectGraph, viewMode: ViewMode): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  if (viewMode === 'files' || viewMode === 'mixed') {
    for (const file of graph.nodes.files) {
      nodes.push({
        id: file.id,
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: file.file_path.split('/').pop() || file.file_path,
          isFile: true,
          file_path: file.file_path,
          language: file.language,
          chunk_count: file.chunk_count,
          is_dead_code: file.is_dead_code,
        },
        style: {
          background: file.is_dead_code ? '#64748B' : '#0F172A',
          color: '#F8FAFC',
          border: `2px solid ${file.is_dead_code ? '#475569' : '#334155'}`,
          borderRadius: '6px',
          fontSize: '11px',
          fontFamily: 'monospace',
          padding: '6px 10px',
          width: FILE_WIDTH,
        },
      })
    }

    for (const imp of graph.edges.imports) {
      edges.push({
        id: `imp-${imp.source_id}-${imp.target_id}`,
        source: imp.source_id,
        target: imp.target_id,
        type: 'smoothstep',
        style: { stroke: '#334155', strokeWidth: 1.5, strokeDasharray: '4,3' },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#334155' },
        label: imp.metadata?.symbols?.slice(0, 2).join(', ') || '',
        labelStyle: { fontSize: 9, fill: '#94A3B8' },
      })
    }
  }

  if (viewMode === 'chunks' || viewMode === 'mixed') {
    for (const chunk of graph.nodes.chunks) {
      const color = chunk.is_dead_code ? '#94A3B8' : (CHUNK_TYPE_COLORS[chunk.chunk_type] || '#6366F1')
      nodes.push({
        id: chunk.id,
        type: 'default',
        position: { x: 0, y: 0 },
        data: {
          label: chunk.chunk_name,
          isFile: false,
          chunk_type: chunk.chunk_type,
          file_path: chunk.file_path,
          doc_confidence: chunk.doc_confidence,
          boundary_confidence: chunk.boundary_confidence,
          is_dead_code: chunk.is_dead_code,
          stored_hash: chunk.stored_hash,
        },
        style: {
          background: color + '22',
          color: '#1E293B',
          border: `2px solid ${color}`,
          borderRadius: '8px',
          fontSize: '11px',
          fontFamily: 'monospace',
          padding: '8px 12px',
          width: NODE_WIDTH,
          opacity: chunk.is_dead_code ? 0.5 : 1,
        },
      })
    }

    for (const call of graph.edges.calls) {
      edges.push({
        id: `call-${call.source_id}-${call.target_id}`,
        source: call.source_id,
        target: call.target_id,
        type: 'smoothstep',
        style: { stroke: '#6366F1', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, width: 12, height: 12, color: '#6366F1' },
        label: call.metadata?.callee_name || '',
        labelStyle: { fontSize: 9, fill: '#6366F1' },
      })
    }
  }

  return layoutGraph(nodes, edges)
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:buildFlowGraph:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Build React Flow nodes and edges from a CIL project graph.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]




// CIL[DOC-MACRO purpose="Render the inspector panel for a selected graph node."]
// CIL[DOC-RESPONSIBILITY responsibility="Show file or chunk metadata and provide a link to the chunk contract view."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="node: Node | null, projectId: string" outputs="JSX detail panel" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Displays placeholder text when no node is selected, or file/chunk details including badges and an Open Contract link." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:NodeDetailPanel:component" type="component" identity="NodeDetailPanel" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
function NodeDetailPanel({
  node,
  projectId,
}: {
  node: Node | null
  projectId: string
}) {
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  if (!node) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        Click a node to inspect it
      </div>
    )
  }

  const d = node.data as any

  if (d.isFile) {
    return (
      <div className="p-3 space-y-2 text-xs">
        <div className="font-mono font-bold truncate" title={d.file_path}>{d.file_path}</div>
        <div className="text-muted-foreground">{d.language} · {d.chunk_count ?? '?'} chunks</div>
        {d.is_dead_code && <Badge variant="destructive" className="text-xs">Dead Code</Badge>}
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2 text-xs">
      <div className="font-mono font-bold">{d.label}</div>
      <div className="text-muted-foreground truncate">{d.file_path}</div>
      <div className="flex gap-1 flex-wrap">
        <Badge variant="secondary" className="text-xs">{d.chunk_type}</Badge>
        {d.is_dead_code && <Badge variant="destructive" className="text-xs">Dead</Badge>}
        {d.doc_confidence === 'human_verified' && <Badge variant="default" className="text-xs bg-green-600">Verified</Badge>}
        {d.doc_confidence === 'ai_generated' && <Badge variant="outline" className="text-xs">AI Docs</Badge>}
        {!d.stored_hash && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">No Hash</Badge>}
      </div>
      <a
        href={appPath(`/cil/${projectId}/chunks/${node.id}`)}
        className="block text-indigo-600 hover:underline font-medium"
      >
        Open Contract →
      </a>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:NodeDetailPanel:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render the inspector panel for a selected graph node.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]



// CIL[DOC-MACRO purpose="Render the main CIL graph exploration page for a selected project."]
// CIL[DOC-RESPONSIBILITY responsibility="Fetch and display the project call graph, manage view mode, selection, and loading state."]
// CIL[DOC-CONTEXT module="admin-cil-graph" layer="ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/badge.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/select.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILGraphPage.tsx"]
// CIL[DOC-CONTRACT inputs="none (uses useParams project id and component state)" outputs="JSX page with React Flow canvas, controls, and inspector" errors="none" side_effects="fetches graph and project data from API, updates React state"]
// CIL[DOC-MICRO logic_summary="Loads graph data, builds React Flow elements, renders view mode selector and inspector, and handles node selection." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:CILGraphPage:component" type="component" identity="CILGraphPage" parent="~/.framework/src/pages/admin/cil/CILGraphPage.tsx"]
export default function CILGraphPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('chunks')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [stats, setStats] = useState({ files: 0, chunks: 0, imports: 0, calls: 0 })
  const [projectTitle, setProjectTitle] = useState('')

  const loadGraph = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const [graphRes, projectRes] = await Promise.all([
        apiFetch(`/api/cil-graph?action=get_project_graph&project_id=${projectId}`),
        apiFetch(`/api/cil-project?action=get&id=${projectId}`),
      ])
      const graphData = await graphRes.json()
      const projectData = await projectRes.json()

      const graph: ProjectGraph = graphData?.data || graphData
      const project = projectData?.project || projectData?.data?.project

      if (project?.title) setProjectTitle(project.title)

      const { nodes: flowNodes, edges: flowEdges } = buildFlowGraph(graph, viewMode)
      setNodes(flowNodes)
      setEdges(flowEdges)
      setStats({
        files: graph.nodes.files.length,
        chunks: graph.nodes.chunks.length,
        imports: graph.edges.imports.length,
        calls: graph.edges.calls.length,
      })
    } catch {
    } finally {
      setLoading(false)
    }
  }, [projectId, viewMode])

  useEffect(() => { loadGraph() }, [loadGraph])

  const onConnect = useCallback(
    (params: Connection) => setEdges(eds => addEdge(params, eds)),
    [setEdges]
  )

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background shrink-0 gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href={appPath('/cil')} className="hover:underline">Code Intelligence</a>
          <ChevronRight className="h-3 w-3" />
          <a href={appPath(`/cil/${projectId}/ingest`)} className="hover:underline">{projectTitle || 'Project'}</a>
          <ChevronRight className="h-3 w-3" />
          <span>Graph</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-mono">{stats.files} files</span>
            <span>·</span>
            <span className="font-mono">{stats.chunks} chunks</span>
            <span>·</span>
            <span className="font-mono">{stats.calls} calls</span>
            <span>·</span>
            <span className="font-mono">{stats.imports} imports</span>
          </div>

          <Select value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <Layers className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chunks">Chunks</SelectItem>
              <SelectItem value="files">Files</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={loadGraph} className="h-7 text-xs">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      {}
      <div className="flex flex-1 min-h-0">
        <div className="flex-1">
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <ZoomIn className="h-10 w-10 mx-auto opacity-20" />
                <p>No {viewMode === 'files' ? 'files' : 'chunks'} found.</p>
                <p className="text-xs">Run Pass 1 + Pass 2 ingestion first.</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_evt, node) => setSelectedNode(node)}
              fitView
              fitViewOptions={{ padding: 0.15 }}
              minZoom={0.1}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#E2E8F0" gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeColor={nodeColor}
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                pannable
                zoomable
              />

              {}
              <Panel position="bottom-left">
                <div className="bg-background/90 backdrop-blur border rounded-lg p-2 text-xs space-y-1 shadow-sm">
                  {Object.entries(CHUNK_TYPE_COLORS).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color + '44', border: `1.5px solid ${color}` }} />
                      <span className="text-muted-foreground">{type}</span>
                    </div>
                  ))}
                  {viewMode !== 'chunks' && (
                    <div className="flex items-center gap-1.5 pt-1 border-t">
                      <div className="w-3 h-3 rounded-sm shrink-0 bg-slate-900" />
                      <span className="text-muted-foreground">file</span>
                    </div>
                  )}
                </div>
              </Panel>
            </ReactFlow>
          )}
        </div>

        {}
        <div className="w-56 border-l bg-muted/30 shrink-0 overflow-y-auto">
          <div className="p-2 border-b bg-background">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Inspector</p>
          </div>
          <NodeDetailPanel node={selectedNode} projectId={projectId!} />
        </div>
      </div>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILGraphPage.tsx:CILGraphPage:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render the main CIL graph exploration page for a selected project.'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/button.tsx,.framework/src/components/ui/badge.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
