// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-MACRO purpose="Pass 2 file/folder selection UI for CIL projects"]
// CIL[DOC-RESPONSIBILITY responsibility="Let users visually select discovered files and folders for a CIL project"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts"]
// CIL[DOC-CONTRACT inputs="project_id from URL" outputs="Updated selected_paths for the project" errors="Project not found, selection save failed" side_effects="Calls /api/cil-ingest?action=select"]
// CIL[DOC-MICRO logic_summary="Fetch discovered files from the project file_statuses map, render a tri-state tree with checkboxes, and submit the selected file set." notable_decisions=["Folders recursively select/deselect all descendant files.","Status is inferred from project.data.file_statuses."]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="experimental"]
// CIL[DOC-AUDIENCE audience="developer"]

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiFetch } from '@core/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@core/components/ui/card'
import { Button } from '@core/components/ui/button'
import { Checkbox } from '@core/components/ui/checkbox'
import { Skeleton } from '@core/components/ui/skeleton'
import { ChevronRight, ChevronDown, Folder, FileCode2, Save } from 'lucide-react'
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:module_header:module_header"]


// CIL[DOC-VECTOR type="context" content="purpose='Pass 2 file/folder selection UI for CIL projects'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="TypeScript interface describing the CIL project record shape"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the typed contract for CIL project data used by the file selection page"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="CILProject type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares CILProject with id, title, description, and a data object containing repo_path and file_statuses." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:CILProject:interface" type="interface" identity="CILProject" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
interface CILProject {
  id: string
  title: string
  description: string
  data: {
    repo_path: string
    file_statuses: Record<string, string>
    [key: string]: any
  }
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:CILProject:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='TypeScript interface describing the CIL project record shape'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Recursive tree node type for file and folder paths"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the shape of tree nodes used to render the selectable file tree"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="none" outputs="TreeNode type definition" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Declares a TreeNode with name, path, type, and a recursive children array." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:TreeNode:interface" type="interface" identity="TreeNode" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
interface TreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children: TreeNode[]
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:TreeNode:interface"]
// CIL[DOC-VECTOR type="context" content="purpose='Recursive tree node type for file and folder paths'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Build a sorted nested tree from a flat list of file paths"]
// CIL[DOC-RESPONSIBILITY responsibility="Transform an array of file paths into a hierarchical TreeNode structure grouped by path segments"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="filePaths: string[], rootName: string" outputs="TreeNode root containing nested files and folders" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Sorts paths, splits each by '/', and creates nested children on demand, sorting folders before files." notable_decisions="["Sorts children by type (folders first) and then by name"]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:buildTree:function" type="function" identity="buildTree" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
function buildTree(filePaths: string[], rootName: string): TreeNode {
  const root: TreeNode = { name: rootName, path: '', type: 'folder', children: [] }

  const sortedPaths = [...filePaths].sort()
  for (const fullPath of sortedPaths) {
    const parts = fullPath.split('/')
    let current = root
    let built = ''
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      built = built ? `${built}/${part}` : part
      const isFile = i === parts.length - 1
      const existing = current.children.find(c => c.name === part)
      if (existing) {
        current = existing
      } else {
        const child: TreeNode = {
          name: part,
          path: built,
          type: isFile ? 'file' : 'folder',
          children: [],
        }
        current.children.push(child)
        current.children.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'folder' ? -1 : 1))
        current = child
      }
    }
  }

  return root
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:buildTree:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Build a sorted nested tree from a flat list of file paths'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Collect all file paths under a tree node"]
// CIL[DOC-RESPONSIBILITY responsibility="Recursively flatten a node and its children into a list of file paths"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="node: TreeNode" outputs="string[] of all descendant file paths" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="If the node is a file, returns its path; otherwise returns flatMap of child paths." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:allFilePaths:function" type="function" identity="allFilePaths" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
function allFilePaths(node: TreeNode): string[] {
  if (node.type === 'file') return [node.path]
  return node.children.flatMap(allFilePaths)
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:allFilePaths:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Collect all file paths under a tree node'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Determine the checked state of a tree node against a selection set"]
// CIL[DOC-RESPONSIBILITY responsibility="Compute whether a node is checked, indeterminate, or unchecked based on descendant file selection"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="node: TreeNode, selected: Set<string>" outputs="'checked' | 'indeterminate' | 'unchecked'" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="For files, checks membership in selected. For folders, compares selected descendant count to total descendants." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:nodeCheckState:function" type="function" identity="nodeCheckState" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
function nodeCheckState(node: TreeNode, selected: Set<string>): 'checked' | 'indeterminate' | 'unchecked' {
  if (node.type === 'file') {
    return selected.has(node.path) ? 'checked' : 'unchecked'
  }
  const paths = allFilePaths(node)
  if (paths.length === 0) return 'unchecked'
  const selectedCount = paths.filter(p => selected.has(p)).length
  if (selectedCount === 0) return 'unchecked'
  if (selectedCount === paths.length) return 'checked'
  return 'indeterminate'
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:nodeCheckState:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Determine the checked state of a tree node against a selection set'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Render a file or folder label with icon and expand chevron"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a node name with an appropriate icon and folder expand/collapse chevron"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="name: string, isFolder: boolean, expanded: boolean" outputs="JSX.Element label" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Renders a folder with chevron and folder icon when isFolder is true, otherwise a file icon followed by the name." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:FileNameNode:component" type="component" identity="FileNameNode" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
function FileNameNode({ name, isFolder, expanded }: { name: string; isFolder: boolean; expanded: boolean }) {
  return (
    <span className="flex items-center gap-2">
      {isFolder ? (
        <>
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
          <Folder className="h-4 w-4 text-indigo-500" />
        </>
      ) : (
        <FileCode2 className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="text-sm">{name}</span>
    </span>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:FileNameNode:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render a file or folder label with icon and expand chevron'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Render a selectable, recursively expandable tree row"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a tree node with a tri-state checkbox, expand/collapse behavior, and recursive child rendering"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="node: TreeNode, selected: Set<string>, expanded: Set<string>, onToggle: (node: TreeNode) => void, onToggleExpand: (path: string) => void, depth?: number" outputs="JSX.Element" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Computes the checkbox state, renders the label with indentation, and conditionally renders children." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:TreeNodeRow:component" type="component" identity="TreeNodeRow" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
function TreeNodeRow({
  node,
  selected,
  expanded,
  onToggle,
  onToggleExpand,
  depth = 0,
}: {
  node: TreeNode
  selected: Set<string>
  expanded: Set<string>
  onToggle: (node: TreeNode) => void
  onToggleExpand: (path: string) => void
  depth?: number
}) {
  const checkState = nodeCheckState(node, selected)
  const isFolder = node.type === 'folder'
  const hasChildren = isFolder && node.children.length > 0
  const isExpanded = expanded.has(node.path) || depth === 0

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-2 py-1 hover:bg-muted/40 rounded px-1"
        style={{ paddingLeft: `${depth * 12}px` }}
      >
        <Checkbox
          checked={checkState === 'checked' ? true : checkState === 'indeterminate' ? 'indeterminate' : false}
          onCheckedChange={() => onToggle(node)}
        />
        <div
          className="flex-1 cursor-pointer"
          onClick={() => isFolder && hasChildren ? onToggleExpand(node.path) : undefined}
        >
          <FileNameNode name={node.name} isFolder={isFolder} expanded={isExpanded} />
        </div>
      </div>
      {isFolder && isExpanded && hasChildren && (
        <div>
          {node.children.map(child => (
            <TreeNodeRow
              key={child.path}
              node={child}
              selected={selected}
              expanded={expanded}
              onToggle={onToggle}
              onToggleExpand={onToggleExpand}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:TreeNodeRow:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Render a selectable, recursively expandable tree row'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]

// CIL[DOC-MACRO purpose="Main page component for CIL file and folder selection"]
// CIL[DOC-RESPONSIBILITY responsibility="Load the CIL project, render a tri-state file tree, and submit the selected file set"]
// CIL[DOC-CONTEXT module=".framework/src/pages/admin/cil" layer="admin-ui" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/ui/button.tsx,.framework/src/components/ui/card.tsx,.framework/src/components/ui/checkbox.tsx,.framework/src/components/ui/skeleton.tsx,.framework/src/lib/api.ts,.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
// CIL[DOC-CONTRACT inputs="project_id from URL" outputs="Updated selected_paths for the project" errors="Project not found, selection save failed" side_effects="Calls /api/cil-ingest?action=select and navigates to the dashboard"]
// CIL[DOC-MICRO logic_summary="Fetches the project, builds the tree, manages selected and expanded sets, renders the tree and instructions, and saves the selection." notable_decisions="["Tree root is derived from repo_path basename","All files under a folder are selected/deselected together"]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:CILFileSelectPage:component" type="component" identity="CILFileSelectPage" parent="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx"]
export default function CILFileSelectPage() {
  const { id: projectId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const appPath = (path: string) => '/spine-framework/admin' + (path.startsWith('/') ? path : '/' + path)

  const [project, setProject] = useState<CILProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await apiFetch(`/api/cil-project?action=get&id=${projectId}`)
      const result = await res.json()
      const projectData = result?.project || result?.data?.project
      setProject(projectData)
      const statuses: Record<string, string> = projectData?.data?.file_statuses || {}
      const initialSelected = new Set<string>(
        Object.entries(statuses).filter(([_, status]) => status === '1-selected').map(([path]) => path)
      )
      setSelected(initialSelected)
      setExpanded(new Set())
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { load() }, [load])

  const filePaths = useMemo(() => {
    if (!project) return []
    return Object.keys(project.data.file_statuses || {})
  }, [project])

  const tree = useMemo(() => {
    const rootName = project?.data?.repo_path ? project.data.repo_path.split('/').pop() || 'root' : 'root'
    return buildTree(filePaths, rootName)
  }, [filePaths, project])

  const handleToggle = useCallback((node: TreeNode) => {
    const paths = allFilePaths(node)
    setSelected(prev => {
      const next = new Set(prev)
      const allSelected = paths.every(p => next.has(p))
      if (allSelected) {
        paths.forEach(p => next.delete(p))
      } else {
        paths.forEach(p => next.add(p))
      }
      return next
    })
  }, [])

  const handleToggleExpand = useCallback((path: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  const handleSave = useCallback(async () => {
    if (!projectId) return
    setSaving(true)
    try {
      await apiFetch('/api/cil-ingest?action=select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          selected_paths: Array.from(selected),
        }),
      })
      navigate(appPath(`/cil/${projectId}/dashboard`))
    } finally {
      setSaving(false)
    }
  }, [projectId, selected, navigate, appPath])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Select Files</h1>
          <p className="text-sm text-muted-foreground">{project.title} — choose files and folders for CIL processing</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => navigate(appPath(`/cil/${projectId}/dashboard`))}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <span className="animate-pulse">Saving…</span> : <><Save className="h-4 w-4 mr-1" /> Save Selection</>}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Discovered Files</CardTitle>
          <p className="text-xs text-muted-foreground">{filePaths.length} discovered • {selected.size} selected</p>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto border-t pt-3">
          <TreeNodeRow
            node={tree}
            selected={selected}
            expanded={expanded}
            onToggle={handleToggle}
            onToggleExpand={handleToggleExpand}
          />
        </CardContent>
      </Card>
    </div>
  )
}
// CIL[END stable_id="~/.framework/src/pages/admin/cil/CILFileSelectPage.tsx:CILFileSelectPage:component"]
// CIL[DOC-VECTOR type="context" content="purpose='Main page component for CIL file and folder selection'; No verified external callers; imports: .framework/src/lib/api.ts,.framework/src/components/ui/card.tsx,.framework/src/components/ui/button.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
