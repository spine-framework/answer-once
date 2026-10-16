// CIL[BEGIN stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:module_header:module_header"]
// CIL[DOC-MACRO purpose="Declare dependencies and set up the RichTextEditor module"]
// CIL[DOC-RESPONSIBILITY responsibility="Import and expose all required libraries, components, and utilities"]
// CIL[DOC-CONTEXT module="RichTextEditor" layer="ui" related_files=".framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="none" errors="none" side_effects="loads module dependencies"]
// CIL[DOC-MICRO logic_summary="Imports DOMPurify, marked, TipTap, lowlight, language definitions, React hooks, icons, and the cn utility" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="developers"]







import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { createLowlight } from 'lowlight'
import typescript from 'highlight.js/lib/languages/typescript'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import bash from 'highlight.js/lib/languages/bash'
import sql from 'highlight.js/lib/languages/sql'
import { useEffect, useMemo } from 'react'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Code2,
  Minus,
} from 'lucide-react'
import { cn } from '@core/lib/utils'
// CIL[DOC-VECTOR type="context" content="purpose='Declare dependencies and set up the RichTextEditor module'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:lowlight_setup:setup"]
// CIL[DOC-MACRO purpose="Create and configure the lowlight syntax highlighter"]
// CIL[DOC-RESPONSIBILITY responsibility="Register language parsers with lowlight for code block highlighting"]
// CIL[DOC-CONTEXT module="RichTextEditor" layer="ui" related_files=".framework/src/components/ui/RichTextEditor.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="none" outputs="lowlight: Lowlight" errors="none" side_effects="registers TypeScript, JavaScript, JSON, Bash, and SQL language parsers in the lowlight instance"]
// CIL[DOC-MICRO logic_summary="Creates a lowlight instance and registers five language parsers for code block syntax highlighting" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
const lowlight = createLowlight()
lowlight.register('typescript', typescript)
lowlight.register('javascript', javascript)
lowlight.register('json', json)
lowlight.register('bash', bash)
lowlight.register('sql', sql)
// CIL[DOC-VECTOR type="context" content="purpose='Create and configure the lowlight syntax highlighter'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:lowlight_setup:setup"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:toHtml:function"]
// CIL[DOC-MACRO purpose="Convert raw markdown or HTML text to HTML"]
// CIL[DOC-RESPONSIBILITY responsibility="Return a string of HTML, parsing markdown only when input does not already look like HTML"]
// CIL[DOC-CONTEXT module="RichTextEditor" layer="ui" related_files=".framework/src/components/ui/RichTextEditor.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="raw: string | undefined" outputs="html: string" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Trims the input, tests for HTML-like tags, and either returns the source or parses markdown synchronously" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function toHtml(raw: string | undefined): string {
  const source = (raw ?? '').trim()
  if (!source) return ''
  const likelyHtml = /<\/?(?:h[1-6]|p|div|ul|ol|li|pre|code|br|span|strong|em|a|table|tr|td|th|thead|tbody|blockquote)\b/i.test(source)
  return likelyHtml ? source : (marked.parse(source, { async: false }) as string)
}
// CIL[DOC-VECTOR type="context" content="purpose='Convert raw markdown or HTML text to HTML'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:toHtml:function"]


// CIL[BEGIN stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:RichTextEditorProps:interface"]
// CIL[DOC-MACRO purpose="Declare props for the RichTextEditor component"]
// CIL[DOC-RESPONSIBILITY responsibility="Define the typed prop contract for editor configuration"]
// CIL[DOC-CONTEXT module="RichTextEditor" layer="ui" related_files=".framework/src/components/ui/RichTextEditor.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="value: string, onChange?: (html: string) => void, placeholder?: string, readonly?: boolean, className?: string, minHeight?: string" outputs="N/A" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="TypeScript interface describing optional and required props for RichTextEditor" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface RichTextEditorProps {
  value: string
  onChange?: (html: string) => void
  placeholder?: string
  readonly?: boolean
  className?: string
  minHeight?: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Declare props for the RichTextEditor component'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:RichTextEditorProps:interface"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:ToolbarButton:component"]
// CIL[DOC-MACRO purpose="Render a single formatting toolbar button"]
// CIL[DOC-RESPONSIBILITY responsibility="Display a styled button that invokes a formatting command when clicked"]
// CIL[DOC-CONTEXT module="RichTextEditor" layer="ui" related_files=".framework/src/components/ui/RichTextEditor.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="onClick: () => void, active?: boolean, title: string, children: React.ReactNode" outputs="JSX.Element" errors="none" side_effects="invokes onClick when clicked"]
// CIL[DOC-MICRO logic_summary="Renders a styled button with active state and onMouseDown preventDefault for TipTap integration" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={cn(
        'p-1.5 rounded text-sm transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Render a single formatting toolbar button'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:ToolbarButton:component"]

// CIL[BEGIN stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:RichTextEditor:component"]
// CIL[DOC-MACRO purpose="Rich text editor component with formatting toolbar and readonly preview"]
// CIL[DOC-RESPONSIBILITY responsibility="Initialize a TipTap editor, render a formatting toolbar, and display sanitized HTML output"]
// CIL[DOC-CONTEXT module="RichTextEditor" layer="ui" related_files=".framework/src/components/ui/RichTextEditor.tsx,.framework/src/lib/utils.ts"]
// CIL[DOC-CONTRACT inputs="props: RichTextEditorProps" outputs="JSX.Element" errors="none" side_effects="calls onChange on edits, syncs content and editable state via effects, renders sanitized HTML in readonly mode"]
// CIL[DOC-MICRO logic_summary="Sanitizes initial HTML, creates a TipTap editor with StarterKit and lowlight, syncs content and readonly state, and renders a toolbar or read-only preview" notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write something…',
  readonly = false,
  className,
  minHeight = '300px',
}: RichTextEditorProps) {
  const htmlValue = useMemo(() => DOMPurify.sanitize(toHtml(value)), [value])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder }),
    ],
    content: htmlValue,
    editable: !readonly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== htmlValue) {
      editor.commands.setContent(htmlValue, false)
    }
  }, [htmlValue, editor])

  useEffect(() => {
    if (editor) editor.setEditable(!readonly)
  }, [readonly, editor])

  if (readonly) {
    return (
      <div
        className={cn(
          'prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed',
          'prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:rounded prose-pre:text-xs',
          'prose-code:bg-muted prose-code:px-1 prose-code:rounded prose-code:text-xs prose-code:font-mono',
          className
        )}
        // Sanitize before injecting: `value` may be rich-text HTML or legacy
        // markdown stored in records, and must never execute scripts/handlers
        // for readers (stored-XSS defense).
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlValue) }}
      />
    )
  }

  return (
    <div className={cn('border border-border rounded-md overflow-hidden', className)}>
      {editor && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-border bg-muted/30">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold"
          >
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic"
          >
            <Italic size={14} />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 size={14} />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <List size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Ordered list"
          >
            <ListOrdered size={14} />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline code"
          >
            <Code size={14} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code block"
          >
            <Code2 size={14} />
          </ToolbarButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
            title="Horizontal rule"
          >
            <Minus size={14} />
          </ToolbarButton>
        </div>
      )}
      <EditorContent
        editor={editor}
        className={cn(
          'px-3 py-2 text-sm focus-within:outline-none',
          '[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[var(--editor-min-height)]',
          '[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-border [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:text-xs [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:overflow-x-auto',
          '[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-xs [&_.ProseMirror_code]:font-mono',
          '[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0',
          '[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5',
          '[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5',
          '[&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:mb-2',
          '[&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-3 [&_.ProseMirror_h3]:mb-1',
          '[&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-muted-foreground',
          '[&_.ProseMirror_hr]:border-border [&_.ProseMirror_hr]:my-4'
        )}
        style={{ '--editor-min-height': minHeight } as React.CSSProperties}
      />
    </div>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Rich text editor component with formatting toolbar and readonly preview'; No verified external callers; imports: .framework/src/lib/utils.ts"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/components/ui/RichTextEditor.tsx:RichTextEditor:component"]