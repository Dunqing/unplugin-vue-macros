import { createUnplugin } from 'unplugin'
import { createFilter } from '@rollup/pluginutils'
import { getPackageInfoSync } from 'local-pkg'
import { transform as transformDefineOptions } from 'unplugin-vue-define-options'
import {
  finalizeContext,
  getTransformResult,
  initContext,
} from '@vue-macros/common'
import { transformDefineModel } from './define-model'
import { transformHoistStatic } from './hoist-static/transfrom'
import { transformCustomMacros } from './define-macro'
import type { Macro } from './define-macro/types'
import type { FilterPattern } from '@rollup/pluginutils'

export interface Options {
  include?: FilterPattern
  exclude?: FilterPattern | undefined
  version?: 2 | 3
  defineOptions?: boolean
  defineModel?: boolean
  hoistStatic?: boolean
  customMacros?: Macro[]
}

export type OptionsResolved = Required<Options>

function resolveOption(options: Options): OptionsResolved {
  let version = options.version
  if (version === undefined) {
    const vuePkg = getPackageInfoSync('vue')
    version = vuePkg ? (+vuePkg.version.slice(0, 1) as 2 | 3) : 3
  }

  return {
    include: [/\.vue$/],
    exclude: undefined,
    defineOptions: true,
    defineModel: true,
    hoistStatic: true,
    customMacros: [],
    ...options,
    version,
  }
}

export default createUnplugin<Options>((userOptions = {}) => {
  const options = resolveOption(userOptions)
  const filter = createFilter(options.include, options.exclude)

  const name = 'unplugin-vue-macros'
  return {
    name,
    enforce: 'pre',

    transformInclude(id) {
      return filter(id)
    },

    transform(code, id) {
      try {
        const { ctx, getMagicString } = initContext(code, id)
        if (options.hoistStatic) transformHoistStatic(ctx)
        if (options.customMacros)
          transformCustomMacros(ctx, options.customMacros)
        if (options.defineOptions) transformDefineOptions(ctx)
        if (options.defineModel) transformDefineModel(ctx, options.version)

        finalizeContext(ctx)
        return getTransformResult(getMagicString(), id)
      } catch (err: unknown) {
        this.error(`${name} ${err}`)
      }
    },
  }
})
