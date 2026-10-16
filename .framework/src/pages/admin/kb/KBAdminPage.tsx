// CIL[BEGIN stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-MACRO purpose="Renders the admin knowledge base page with article list and editor."]
// CIL[DOC-RESPONSIBILITY responsibility="Provide the top-level React component for managing KB articles and categories."]
// CIL[DOC-CONTEXT module="admin/kb" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/kb/KBArticleList.tsx"]
// CIL[DOC-CONTRACT inputs="URL parameters (typeSlug, id) and mode prop" outputs="JSX for list or editor view" errors="None" side_effects="Programmatic navigation via react-router"]
// CIL[DOC-MICRO logic_summary="Imports subcomponents and conditionally renders the list or editor based on mode and id." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
// CIL[DOC-AUDIENCE audience="admin-ui"]

import { useParams, useNavigate } from 'react-router-dom'
import { KBArticleList } from '../../../components/kb/KBArticleList'
import { KBArticleEditor } from '../../../components/kb/KBArticleEditor'
import { PageInstructions } from '../../../components/admin/PageInstructions'
// CIL[DOC-VECTOR type="context" content="purpose='Renders the admin knowledge base page with article list and editor.'; No verified external callers; imports: .framework/src/components/kb/KBArticleList.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/admin/PageInstructions.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:module_header:module_header"]
// CIL[BEGIN stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:kb_type_slugs:constant" type="constant" identity="KB_TYPE_SLUGS" parent="~/.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the allowed knowledge base type slugs."]
// CIL[DOC-RESPONSIBILITY responsibility="Enumerate valid KB categories used by the admin page and article list."]
// CIL[DOC-CONTEXT module="admin/kb" layer="data" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/kb/KBArticleList.tsx,.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-CONTRACT inputs="None" outputs="Array of type slug strings" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Static string array enumerating valid knowledge base categories." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]

const KB_TYPE_SLUGS = ['kb-spine-admin', 'kb-spine-internal', 'kb-spine-public', 'kb-account']
// CIL[DOC-VECTOR type="context" content="purpose='Defines the allowed knowledge base type slugs.'; No verified external callers; imports: .framework/src/components/kb/KBArticleList.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/admin/PageInstructions.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:kb_type_slugs:constant"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:KBAdminPageProps:interface" type="interface" identity="KBAdminPageProps" parent="~/.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-MACRO purpose="Defines the props accepted by the KBAdminPage component."]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the optional mode prop for view/edit/new state."]
// CIL[DOC-CONTEXT module="admin/kb" layer="interface" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/kb/KBArticleList.tsx,.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-CONTRACT inputs="None" outputs="Type definition for KBAdminPageProps" errors="None" side_effects="None"]
// CIL[DOC-MICRO logic_summary="Optional mode union type supporting view, edit, and new modes." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
interface KBAdminPageProps {
  mode?: 'view' | 'edit' | 'new'
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the props accepted by the KBAdminPage component.'; No verified external callers; imports: .framework/src/components/kb/KBArticleList.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/admin/PageInstructions.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:KBAdminPageProps:interface"]


// CIL[BEGIN stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:kbadminpage:function" type="function" identity="KBAdminPage" parent="~/.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-MACRO purpose="Displays the knowledge base article list or editor based on route mode and id."]
// CIL[DOC-RESPONSIBILITY responsibility="Render the admin KB page and route user actions to the appropriate editor/list views."]
// CIL[DOC-CONTEXT module="admin/kb" layer="page" related_files=".framework/src/components/admin/PageInstructions.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/kb/KBArticleList.tsx,.framework/src/pages/admin/kb/KBAdminPage.tsx"]
// CIL[DOC-CONTRACT inputs="mode prop and URL params typeSlug/id" outputs="JSX with KBArticleList or KBArticleEditor" errors="None" side_effects="Navigates using useNavigate"]
// CIL[DOC-MICRO logic_summary="Determines list mode from the mode prop and absence of id, then renders list or editor with navigation callbacks." notable_decisions="[]"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stability="stable"]
export function KBAdminPage({ mode = 'view' }: KBAdminPageProps) {
  const { typeSlug, id } = useParams<{ typeSlug: string; id: string }>()
  const navigate = useNavigate()

  const isList = mode === 'view' && !id

  if (isList) {
    return (
      <>
        <PageInstructions
        description="Manage knowledge base articles, categories, and their lifecycle."
        sections={[
          { title: 'What this page is for', content: 'This page lists the articles and categories for the selected knowledge base type and provides the editor for creating or updating content.' },
          { title: 'How to read this page', content: 'In list mode you see existing records and can filter or select one. In edit or new mode the article editor shows the content fields and save controls for the selected type slug.' },
          { title: 'How to create / edit / delete', content: 'Click New to create an article, select an existing record to view it, click Edit to change it, and use the editor\'s delete action to remove it.' },
          { title: 'Important notes', content: 'Knowledge base records are typed by slug (kb-spine-admin, kb-spine-internal, kb-spine-public, kb-account). Make sure you are editing under the correct category.' },
        ]}
      />
        <KBArticleList
          typeSlugs={KB_TYPE_SLUGS}
          typeName="Knowledge Base"
          onSelect={(record) => navigate(`/spine-framework/admin/kb/${record.type_slug}/${record.id}`)}
          onNew={() => navigate(`/spine-framework/admin/kb/${typeSlug}/new`)}
          onEdit={(record) => navigate(`/spine-framework/admin/kb/${record.type_slug}/${record.id}/edit`)}
        />
      </>
    )
  }

  return (
    <>
      <PageInstructions
        description="Manage knowledge base articles, categories, and their lifecycle."
        sections={[
          { title: 'What this page is for', content: 'This page lists the articles and categories for the selected knowledge base type and provides the editor for creating or updating content.' },
          { title: 'How to read this page', content: 'In list mode you see existing records and can filter or select one. In edit or new mode the article editor shows the content fields and save controls for the selected type slug.' },
          { title: 'How to create / edit / delete', content: 'Click New to create an article, select an existing record to view it, click Edit to change it, and use the editor\'s delete action to remove it.' },
          { title: 'Important notes', content: 'Knowledge base records are typed by slug (kb-spine-admin, kb-spine-internal, kb-spine-public, kb-account). Make sure you are editing under the correct category.' },
        ]}
      />
      <KBArticleEditor
        typeSlug={typeSlug}
        mode={mode}
        articleId={mode === 'new' ? null : id}
        onBack={() => navigate(`/spine-framework/admin/kb/${typeSlug}`)}
        onSave={(record) => navigate(`/spine-framework/admin/kb/${typeSlug}/${record?.id || id || ''}`)}
        onEdit={(articleId) => navigate(`/spine-framework/admin/kb/${typeSlug}/${articleId}/edit`)}
        onCancel={() => navigate(`/spine-framework/admin/kb/${typeSlug}`)}
        onDelete={() => navigate(`/spine-framework/admin/kb/${typeSlug}`)}
      />
    </>
  )
}
// CIL[DOC-VECTOR type="context" content="purpose='Displays the knowledge base article list or editor based on route mode and id.'; No verified external callers; imports: .framework/src/components/kb/KBArticleList.tsx,.framework/src/components/kb/KBArticleEditor.tsx,.framework/src/components/admin/PageInstructions.tsx"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/src/pages/admin/kb/KBAdminPage.tsx:kbadminpage:function"]
