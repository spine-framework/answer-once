import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import ts from 'typescript'

const STABLE_ID_PREFIX = '~'

function toCanonicalPath(repoRoot, absolutePath) {
  const rel = absolutePath.startsWith(repoRoot) ? absolutePath.slice(repoRoot.length) : absolutePath
  const normalized = rel.replace(/\\/g, '/').replace(/^\/+/, '')
  return normalized ? `${STABLE_ID_PREFIX}/${normalized}` : `${STABLE_ID_PREFIX}/`
}

function collapseBlankLines(lines) {
  const result = []
  let lastBlank = false
  for (const line of lines) {
    const isBlank = line.trim() === ''
    if (isBlank && lastBlank) continue
    result.push(line)
    lastBlank = isBlank
  }
  return result
}

function stripCilMarkers(lines) {
  return lines.filter(line => {
    const trimmed = line.trim()
    return !trimmed.match(/^\/\/\s*CIL\[(BEGIN|END)/) &&
           !trimmed.match(/^--\s*CIL\[(BEGIN|END)/) &&
           !trimmed.match(/^#\s*CIL\[(BEGIN|END)/) &&
           !trimmed.match(/^<!--\s*CIL\[(BEGIN|END)/)
  })
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  const map = {
    '.ts': 'typescript',
    '.tsx': 'typescriptreact',
    '.js': 'javascript',
    '.jsx': 'javascriptreact',
    '.sql': 'sql',
  }
  return map[ext] || 'unknown'
}

function proposeAstChunks(content, canonicalPath, language) {
  const proposals = []
  if (!['typescript', 'typescriptreact', 'javascript', 'javascriptreact'].includes(language)) {
    return proposals
  }

  const scriptKind =
    language === 'typescript' ? ts.ScriptKind.TS :
    language === 'typescriptreact' ? ts.ScriptKind.TSX :
    language === 'javascript' ? ts.ScriptKind.JS :
    ts.ScriptKind.JSX

  const sourceFile = ts.createSourceFile(canonicalPath, content, ts.ScriptTarget.Latest, true, scriptKind)

  const imports = sourceFile.statements.filter(s => ts.isImportDeclaration(s))
  let headerEnd = 1
  if (imports.length > 0) {
    headerEnd = sourceFile.getLineAndCharacterOfPosition(imports[imports.length - 1].getEnd()).line + 1
  }
  proposals.push({
    name: 'module_header',
    type: 'module_header',
    stable_id: `${canonicalPath}:module_header:module_header`,
    line_start: 1,
    line_end: headerEnd,
  })

  function addSymbol(name, type, node) {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1
    proposals.push({
      name,
      type,
      stable_id: `${canonicalPath}:${name.toLowerCase()}:${type}`,
      line_start: start,
      line_end: end,
    })
  }

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isFunctionDeclaration(node) && node.name) addSymbol(node.name.text, 'function', node)
    else if (ts.isClassDeclaration(node) && node.name) addSymbol(node.name.text, 'class', node)
    else if (ts.isInterfaceDeclaration(node) && node.name) addSymbol(node.name.text, 'interface', node)
    else if (ts.isTypeAliasDeclaration(node) && node.name) addSymbol(node.name.text, 'type', node)
    else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          addSymbol(decl.name.text, 'constant', node)
          break
        }
      }
    }
  })

  return proposals
}

function processFile(absolutePath, repoRoot) {
  const content = fs.readFileSync(absolutePath, 'utf-8')
  const lines = content.split('\n')
  const stripped = stripCilMarkers(lines)
  const cleaned = collapseBlankLines(stripped)

  const language = detectLanguage(absolutePath)
  const canonicalPath = toCanonicalPath(repoRoot, absolutePath)
  const relPath = canonicalPath.slice(2)

  const proposals = proposeAstChunks(cleaned.join('\n'), canonicalPath, language)
  if (proposals.length === 0) {
    return { file_path: relPath, markers: [], hash: null, skipped: true }
  }

  // Build new content with markers
  const insertions = []
  for (const p of proposals) {
    const beginLine = `// CIL[BEGIN stable_id="${p.stable_id}" type="${p.type}" identity="${p.name}" parent="none"]`
    const endLine = `// CIL[END stable_id="${p.stable_id}"]`
    insertions.push({ line: p.line_start, text: beginLine })
    insertions.push({ line: p.line_end + 1, text: endLine })
  }

  insertions.sort((a, b) => b.line - a.line)
  for (const ins of insertions) {
    const idx = ins.line - 1
    cleaned.splice(idx, 0, ins.text)
  }

  const withBlanks = []
  for (let i = 0; i < cleaned.length; i++) {
    const line = cleaned[i]
    withBlanks.push(line)
    if (line.startsWith('// CIL[END') || line.startsWith('-- CIL[END') || line.startsWith('# CIL[END')) {
      if (i + 1 < cleaned.length && (cleaned[i + 1].startsWith('// CIL[BEGIN') || cleaned[i + 1].startsWith('-- CIL[BEGIN') || cleaned[i + 1].startsWith('# CIL[BEGIN'))) {
        withBlanks.push('')
      }
    }
  }

  const newContent = withBlanks.join('\n')
  fs.writeFileSync(absolutePath, newContent, 'utf-8')

  const hash = fs.readFileSync(absolutePath)
  const fileHash = crypto.createHash('sha256').update(hash).digest('hex')

  const markers = proposals.map(p => ({
    stable_id: p.stable_id,
    chunk_id: p.stable_id,
    type: p.type,
    identity: p.name,
    parent: 'none',
    start_line: p.line_start,
    end_line: p.line_end,
  }))

  return { file_path: relPath, markers, hash: fileHash, skipped: false }
}

const repoRoot = process.argv[2]
const files = process.argv.slice(3)
if (!repoRoot || files.length === 0) {
  console.error('Usage: node fix-cil-markers.mjs <repoRoot> <file1> [file2] ...')
  process.exit(1)
}

for (const file of files) {
  const absolutePath = path.resolve(repoRoot, file)
  const result = processFile(absolutePath, repoRoot)
  console.log(JSON.stringify(result))
}
