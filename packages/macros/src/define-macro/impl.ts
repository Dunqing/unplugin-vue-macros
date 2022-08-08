import type { Node, TSType } from '@babel/types'

export interface ComponentInfo {
  options: string
  props?: Record<string, undefined | string>
  emits?: Record<string, undefined | string>
  expose?: string
}

export interface MacroContext {
  id: string
  code: string
  component: ComponentInfo
  args: Node[]
  typeArgs: TSType[]
  getStringFromNode: (node: Node) => string
}

export interface CustomMacro {
  name: string
  processor: (ctx: MacroContext) => ComponentInfo
}
