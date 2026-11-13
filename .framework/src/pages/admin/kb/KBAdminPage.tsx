
import { useParams, useNavigate } from 'react-router-dom'
import { KBArticleList } from '../../../components/kb/KBArticleList'
import { KBArticleEditor } from '../../../components/kb/KBArticleEditor'

const KB_TYPE_SLUGS = ['kb-spine-admin', 'kb-spine-internal', 'kb-spine-public', 'kb-account']


interface KBAdminPageProps {
  mode?: 'view' | 'edit' | 'new'
}


export function KBAdminPage({ mode = 'view' }: KBAdminPageProps) {
  const { typeSlug, id } = useParams<{ typeSlug: string; id: string }>()
  const navigate = useNavigate()

  const isList = mode === 'view' && !id

  if (isList) {
    return (
      <>
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
