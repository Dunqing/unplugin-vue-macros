import { babelParse, walkIdentifiers } from '@vue/compiler-sfc'
import type { CallExpression, Node } from '@babel/types'
import type { ParserPlugin } from '@babel/parser'

export function parseAST(code: string, lang?: string) {
  const plugins: ParserPlugin[] = []
  if (lang === 'ts' || lang === 'tsx') {
    plugins.push('typescript')
  }
  if (lang === 'jsx' || lang === 'tsx') {
    plugins.push('jsx')
  }
  const { program } = babelParse(code, {
    sourceType: 'module',
    plugins,
  })
  return program
}

export function isCallOf(
  node: Node | null | undefined,
  test: string | ((id: string) => boolean)
): node is CallExpression {
  return !!(
    node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    (typeof test === 'string'
      ? node.callee.name === test
      : test(node.callee.name))
  )
}

export function checkInvalidScopeReference(
  node: Node | undefined,
  method: string,
  setupBindings: string[]
) {
  if (!node) return
  walkIdentifiers(node, (id) => {
    if (setupBindings.includes(id.name))
      throw new SyntaxError(
        `\`${method}()\` in <script setup> cannot reference locally ` +
          `declared variables (${id.name}) because it will be hoisted outside of the ` +
          `setup() function.`
      )
  })
}

export function resolveQualifiedType(
  nodes: Node[],
  node: Node,
  qualifier: (node: Node) => boolean
) {
  if (qualifier(node)) return node

  if (node.type === 'TSTypeReference' && node.typeName.type === 'Identifier') {
    const refName = node.typeName.name
    const isQualifiedType = (node: Node): Node | undefined => {
      if (node.type === 'TSInterfaceDeclaration' && node.id.name === refName) {
        return node.body
      } else if (
        node.type === 'TSTypeAliasDeclaration' &&
        node.id.name === refName &&
        qualifier(node.typeAnnotation)
      ) {
        return node.typeAnnotation
      } else if (node.type === 'ExportNamedDeclaration' && node.declaration) {
        return isQualifiedType(node.declaration)
      }
    }
    for (const node of nodes) {
      const qualified = isQualifiedType(node)
      if (qualified) return qualified
    }
  }
}
