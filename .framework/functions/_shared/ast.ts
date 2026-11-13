import * as ts from 'typescript'


export interface IdentityProposal {
  identity: string
  type: string
  parent: string
  line_start: number
  line_end: number
  text: string
}


function isCapitalized(name: string): boolean {
  return name.length > 0 && name[0] === name[0].toUpperCase()
}


function isHook(name: string): boolean {
  return name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()
}


function lineOf(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
}


export function extractIdentities(sourceFile: ts.SourceFile, fileStableId: string): IdentityProposal[] {
  const proposals: IdentityProposal[] = []

  proposals.push({
    identity: 'module_header',
    type: 'module_header',
    parent: fileStableId,
    line_start: 1,
    line_end: sourceFile.getLineAndCharacterOfPosition(sourceFile.getFullStart() + sourceFile.getFullWidth()).line + 1,
    text: sourceFile.text,
  })

  proposals.push({
    identity: 'file',
    type: 'file',
    parent: 'none',
    line_start: 1,
    line_end: sourceFile.getLineAndCharacterOfPosition(sourceFile.getFullStart() + sourceFile.getFullWidth()).line + 1,
    text: sourceFile.text,
  })

  let anonymousCounter = 0

  function visit(node: ts.Node, parentId: string) {
    const startLine = lineOf(sourceFile, node)
    const endLine = lineOf(sourceFile, node) + sourceFile.text.slice(node.getStart(), node.getEnd()).split('\n').length - 1
    const text = sourceFile.text.slice(node.getStart(), node.getEnd())

    if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.text
      const type = isHook(name) ? 'hook' : isCapitalized(name) ? 'component' : 'function'
      proposals.push({ identity: name, type, parent: parentId, line_start: startLine, line_end: endLine, text })
      ts.forEachChild(node, child => visit(child, `${parentId}:${name}:${type}`))
      return
    }

    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text
      const classId = `${parentId}:${className}:class`
      proposals.push({ identity: className, type: 'class', parent: parentId, line_start: startLine, line_end: endLine, text })
      node.members.forEach(member => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = ts.isIdentifier(member.name) ? member.name.text : ts.isStringLiteral(member.name) ? member.name.text : String(member.name.getText(sourceFile))
          proposals.push({
            identity: `${className}.${methodName}`,
            type: 'method',
            parent: classId,
            line_start: lineOf(sourceFile, member),
            line_end: lineOf(sourceFile, member) + text.slice(member.getStart(), member.getEnd()).split('\n').length - 1,
            text: sourceFile.text.slice(member.getStart(), member.getEnd()),
          })
        }
      })
      return
    }

    if (ts.isInterfaceDeclaration(node) && node.name) {
      proposals.push({ identity: node.name.text, type: 'interface', parent: parentId, line_start: startLine, line_end: endLine, text })
      return
    }

    if (ts.isTypeAliasDeclaration(node) && node.name) {
      proposals.push({ identity: node.name.text, type: 'type', parent: parentId, line_start: startLine, line_end: endLine, text })
      return
    }

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) {
          const name = decl.name.text
          const isConst = Boolean(node.declarationList.flags & ts.NodeFlags.Const)
          let type = isConst ? 'constant' : 'variable'
          if (decl.initializer) {
            if (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer)) {
              type = isHook(name) ? 'hook' : isCapitalized(name) ? 'component' : 'function'
            }
          }
          proposals.push({ identity: name, type, parent: parentId, line_start: startLine, line_end: endLine, text })
        }
      }
      return
    }

    if (ts.isExportAssignment(node)) {
      anonymousCounter += 1
      proposals.push({ identity: 'default', type: 'function', parent: parentId, line_start: startLine, line_end: endLine, text })
      return
    }

    ts.forEachChild(node, child => visit(child, parentId))
  }

  visit(sourceFile, fileStableId)
  return proposals
}
