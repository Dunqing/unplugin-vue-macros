import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import glob from 'fast-glob'
import { RollupToStringPlugin, rollupBuild } from '@vue-macros/test-utils'
import VueMacros from '../src/rollup'

describe('mixed', async () => {
  const root = resolve(__dirname, '..')
  const files = await glob('tests/fixtures/mixed/**/*.{vue,js,ts}', {
    cwd: root,
    onlyFiles: true,
  })

  for (const file of files) {
    it(file.replace(/\\/g, '/'), async () => {
      const filepath = resolve(root, file)
      const version = filepath.includes('vue2') ? 2 : 3

      const code = await rollupBuild(filepath, [
        VueMacros({
          version,
        }),
        RollupToStringPlugin(),
      ])
      expect(code).toMatchSnapshot()
    })
  }
})
