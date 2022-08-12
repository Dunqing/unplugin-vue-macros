import { compileScript, parse } from '@vue/compiler-sfc'
import { isCallOf, parseAST, resolveQualifiedType } from './ast'
import { DEFINE_PROPS } from './constants'
import type { Node, TSInterfaceBody, TSTypeLiteral } from '@babel/types'
import type { TransformContext } from './context'
import type { SFCDescriptor, SFCScriptBlock } from '@vue/compiler-sfc'

export type _SFCScriptBlock = Omit<
  SFCScriptBlock,
  'scriptAst' | 'scriptSetupAst'
>

export type SFCCompiled = Omit<SFCDescriptor, 'script' | 'scriptSetup'> & {
  script?: _SFCScriptBlock | null
  scriptSetup?: _SFCScriptBlock | null
  scriptCompiled: SFCScriptBlock
  descriptor: SFCDescriptor
}

export const parseSFC = (code: string, id: string): SFCCompiled => {
  const { descriptor } = parse(code, {
    filename: id,
  })

  let scriptCompiled: SFCScriptBlock | undefined
  return {
    descriptor,
    ...descriptor,
    get scriptCompiled() {
      if (scriptCompiled) return scriptCompiled
      return (scriptCompiled = compileScript(descriptor, {
        id,
      }))
    },
  }
}

export const addToScript = (ctx: TransformContext) => {
  const { scriptCode } = ctx
  if (scriptCode.prepend.length + scriptCode.append.length === 0) {
    return
  }

  const { sfc, s } = ctx
  const { script, scriptSetup } = sfc
  if (script) {
    if (scriptCode.prepend) {
      s.appendRight(script.loc.start.offset, scriptCode.prepend)
      script.content = scriptCode.prepend + script.content
    }
    if (scriptCode.append) {
      s.appendRight(script.loc.end.offset, scriptCode.append)
      script.content = script.content + scriptCode.append
    }
  } else {
    const lang = scriptSetup?.attrs.lang
    const attrs = lang ? ` lang="${lang}"` : ''
    const content = `${scriptCode.prepend}\n${scriptCode.append}`
    s.prependLeft(0, `<script${attrs}>${content}</script>\n`)
    sfc.script = {
      type: 'script',
      content,
      attrs: scriptSetup?.attrs || {},
      loc: undefined as any,
    }
  }
}

export const getSFCLang = (sfc: SFCDescriptor) =>
  (sfc.scriptSetup || sfc.script)?.lang

export interface ComponentInfoObject {
  type: 'object'
  map: Record<string, string>
}
export interface ComponentInfoTSUnknown {
  type: 'ts-unknown'
  map: string
}

export interface ComponentInfoTSObject {
  type: 'ts-object'
  map: Record<string, string>
}
export interface ComponentInfoUnknown {
  type: 'unknown'
  code: string
}

export interface ComponentInfo {
  options?: ComponentInfoObject | ComponentInfoUnknown | undefined
  props?:
    | ComponentInfoObject
    | ComponentInfoUnknown
    | ComponentInfoTSObject
    | ComponentInfoTSUnknown
    | undefined
  emits?:
    | ComponentInfoObject
    | ComponentInfoUnknown
    | ComponentInfoTSObject
    | ComponentInfoTSUnknown
    | undefined
  expose?: ComponentInfoObject | ComponentInfoUnknown | undefined
}

export const analyzeComponent = (ctx: TransformContext): ComponentInfo => {
  const { sfc } = ctx
  const { scriptSetup } = sfc
  if (!scriptSetup) return {}

  let hasDefinePropsCall = false
  let props: ComponentInfo['props'] | undefined
  let propsTypeDecl: TSInterfaceBody | TSTypeLiteral | undefined

  const program = parseAST(scriptSetup.content, getSFCLang(sfc.descriptor))

  const snipNode = (node: Node): string =>
    scriptSetup.content.slice(node.start!, node.end!)

  function processDefineProps(node: Node) {
    if (!isCallOf(node, DEFINE_PROPS)) return false

    hasDefinePropsCall = true
    if (node.arguments[0])
      props = {
        type: 'unknown',
        code: snipNode(node.arguments[0]),
      }

    const typeDeclRaw = node.typeParameters?.params?.[0]
    if (typeDeclRaw) {
      const typeDecl = resolveQualifiedType(
        program.body,
        typeDeclRaw,
        (node) => node.type === 'TSTypeLiteral'
      ) as TSTypeLiteral | TSInterfaceBody | undefined

      // not expected
      if (!typeDecl) return true

      propsTypeDecl = typeDecl
      console.log(typeDecl)
    }

    return true
  }

  for (const stmt of program.body) {
    if (stmt.type === 'ExpressionStatement') {
      processDefineProps(stmt.expression)
    } else if (stmt.type === 'VariableDeclaration' && !stmt.declare) {
      for (const decl of stmt.declarations) {
        if (decl.init) {
          processDefineProps(decl.init)
        }
      }
    }
  }

  return Object.freeze({
    props,
  })
}
