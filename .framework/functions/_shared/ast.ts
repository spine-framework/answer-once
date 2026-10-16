// CIL[BEGIN stable_id="~/.framework/functions/_shared/ast.ts:module_header:module_header" type="module_header" identity="module_header" parent="~/.framework/functions/_shared/ast.ts"]
// CIL[DOC-MACRO purpose="Provides the TypeScript compiler API import for AST identity extraction"]
// CIL[DOC-RESPONSIBILITY responsibility="Declare the typescript dependency and serve as the module-level CIL header"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/ast.ts" layer="shared" related_files=".framework/functions/_shared/ast.ts"]
// CIL[DOC-CONTRACT inputs="" outputs="" errors="" side_effects=""]
// CIL[DOC-MICRO logic_summary="Imports the entire typescript namespace as ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
// CIL[DOC-AUDIENCE audience="cil pipeline"]
import * as ts from 'typescript'
// CIL[DOC-VECTOR type="context" content="purpose='Provides the TypeScript compiler API import for AST identity extraction'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/ast.ts:module_header:module_header"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/ast.ts:IdentityProposal:interface" type="interface" identity="IdentityProposal" parent="~/.framework/functions/_shared/ast.ts"]
// CIL[DOC-MACRO purpose="Defines the shape of an extracted code identity proposal"]
// CIL[DOC-RESPONSIBILITY responsibility="Model an identity proposal with identity, type, parent, line range and text"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/ast.ts" layer="shared" related_files=".framework/functions/_shared/ast.ts"]
// CIL[DOC-CONTRACT inputs="none (structural interface)" outputs="none (structural interface)" errors="none" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Simple TypeScript interface describing a proposed chunk identity"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
export interface IdentityProposal {
  identity: string
  type: string
  parent: string
  line_start: number
  line_end: number
  text: string
}
// CIL[DOC-VECTOR type="context" content="purpose='Defines the shape of an extracted code identity proposal'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/ast.ts:IdentityProposal:interface"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/ast.ts:isCapitalized:function" type="function" identity="isCapitalized" parent="~/.framework/functions/_shared/ast.ts"]
// CIL[DOC-MACRO purpose="Check whether a string begins with an uppercase letter"]
  // CIL[DOC-STABILITY stability="internal"]
  // CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
  // CIL[DOC-CONTEXT module="ast" layer="functions" related_files=".framework/functions/_shared/ast.ts"]
// CIL[DOC-RESPONSIBILITY responsibility="Determine capitalization of an identifier to classify React components"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="boolean" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Returns true when the first character is the same as its uppercase form"]
function isCapitalized(name: string): boolean {
  return name.length > 0 && name[0] === name[0].toUpperCase()
}
// CIL[END stable_id="~/.framework/functions/_shared/ast.ts:isCapitalized:function"]


// CIL[DOC-VECTOR type="context" content="purpose='Check whether a string begins with an uppercase letter'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[BEGIN stable_id="~/.framework/functions/_shared/ast.ts:isHook:function" type="function" identity="isHook" parent="~/.framework/functions/_shared/ast.ts"]
// CIL[DOC-MACRO purpose="Validation function for identifying React Hook names"]
// CIL[DOC-RESPONSIBILITY responsibility="Decide if a string is a valid React hook name by convention"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/ast.ts" layer="shared" related_files=".framework/functions/_shared/ast.ts"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-CONTRACT inputs="name: string" outputs="boolean" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Checks if the name starts with 'use', has length greater than 3, and the fourth character is uppercase"]
// CIL[DOC-STABILITY stable]
function isHook(name: string): boolean {
  return name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()
}
// CIL[END stable_id="~/.framework/functions/_shared/ast.ts:isHook:function"]
// CIL[DOC-VECTOR type="context" content="purpose='Validation function for identifying React Hook names'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/ast.ts:lineOf:function" type="function" identity="lineOf" parent="~/.framework/functions/_shared/ast.ts"]
// CIL[DOC-MACRO purpose="Compute the 1-based line number of a TypeScript AST node"]
// CIL[DOC-RESPONSIBILITY responsibility="Convert a node's start position to a human-readable line number"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/ast.ts" layer="shared" related_files=".framework/functions/_shared/ast.ts"]
// CIL[DOC-CONTRACT inputs="sourceFile: ts.SourceFile, node: ts.Node" outputs="number" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Uses sourceFile.getLineAndCharacterOfPosition and adds 1"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
function lineOf(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1
}
// CIL[DOC-VECTOR type="context" content="purpose='Compute the 1-based line number of a TypeScript AST node'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/ast.ts:lineOf:function"]


// CIL[BEGIN stable_id="~/.framework/functions/_shared/ast.ts:extractIdentities:function" type="function" identity="extractIdentities" parent="~/.framework/functions/_shared/ast.ts"]
// CIL[DOC-MACRO purpose="Extract candidate code identities from a TypeScript source file"]
// CIL[DOC-RESPONSIBILITY responsibility="Walk the TypeScript AST and build a list of IdentityProposal objects for CIL chunking"]
// CIL[DOC-CONTEXT module=".framework/functions/_shared/ast.ts" layer="shared" related_files=".framework/functions/_shared/ast.ts"]
// CIL[DOC-CONTRACT inputs="sourceFile: ts.SourceFile, fileStableId: string" outputs="IdentityProposal[]" errors="" side_effects="none"]
// CIL[DOC-MICRO logic_summary="Traverses declarations, class members, interfaces, type aliases, variable statements and export assignments; determines types using isHook, isCapitalized; increments anonymousCounter for default exports"]
// CIL[DOC-CONFIDENCE pass="second" score="0.90" flags="none"]
// CIL[DOC-STABILITY stable]
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
// CIL[DOC-VECTOR type="context" content="purpose='Extract candidate code identities from a TypeScript source file'; No verified external callers; imports: none"]
// CIL[DOC-VECTOR type="blast_radius" content="No direct caller data from CIL graph; local impact only"]
// CIL[DOC-VECTOR type="configuration" content="No environment or build configuration dependencies identified"]
// CIL[DOC-VECTOR type="constraint" content="Standard runtime; no special invariants documented"]
// CIL[DOC-VECTOR type="implementation_pattern" content="" status="pending_human_input"]
// CIL[DOC-VECTOR type="user_journey" content="" status="pending_human_input"]
// CIL[END stable_id="~/.framework/functions/_shared/ast.ts:extractIdentities:function"]
