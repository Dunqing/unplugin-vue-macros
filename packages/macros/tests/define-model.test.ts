import { describe, expect, test } from 'vitest'
import { finalizeContext, initContext } from '@vue-macros/common'
import { transformDefineModel } from '../src/define-model'

describe('define-model', async () => {
  const files = import.meta.glob('./fixtures/define-model/**/*.{vue,js,ts}', {
    eager: true,
    as: 'raw',
  })

  for (const [id, code] of Object.entries(files)) {
    test(id.replace(/\\/g, '/'), async () => {
      const version = id.includes('vue2') ? 2 : 3
      const exec = () => {
        const { ctx, getMagicString } = initContext(code, id)
        transformDefineModel(ctx, version)
        finalizeContext(ctx)
        return getMagicString()?.toString()
      }
      if (id.includes('error')) {
        expect(exec).toThrowErrorMatchingSnapshot()
      } else {
        expect(exec()).toMatchSnapshot()
      }
    })
  }
})
