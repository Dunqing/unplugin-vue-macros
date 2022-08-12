import { MagicString } from 'vue/compiler-sfc'
import { addToScript, analyzeComponent, parseSFC } from './vue'
import type { ComponentInfo, SFCCompiled } from './vue'

export interface TransformContext {
  code: string
  id: string

  s: MagicString
  sfc: SFCCompiled

  component: ComponentInfo

  scriptCode: {
    prepend: string
    append: string
  }
}

export const initContext = (code: string, id: string) => {
  let s: MagicString | undefined
  let sfc: SFCCompiled | undefined
  let component: ComponentInfo | undefined

  const ctx: TransformContext = {
    code,
    id,

    scriptCode: {
      prepend: '',
      append: '',
    },

    get component() {
      return component || (component = analyzeComponent(ctx))
    },

    get s() {
      return s || (s = new MagicString(code))
    },
    set s(_s) {
      s = _s
    },

    get sfc() {
      return sfc || (sfc = parseSFC(code, id))
    },
    set sfc(_sfc) {
      sfc = _sfc
    },
  }

  return {
    ctx,
    getMagicString() {
      return s
    },
    getSFC() {
      return sfc
    },
  }
}

export const finalizeContext = (ctx: TransformContext) => {
  addToScript(ctx)
}
