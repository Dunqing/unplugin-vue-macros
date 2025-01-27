import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'
import glob from 'fast-glob'
import Vue from 'unplugin-vue/rollup'
import VueJsx from '@vitejs/plugin-vue-jsx'
import {
  RollupEsbuildPlugin,
  RollupRemoveVueFilePathPlugin,
  rollupBuild,
} from '@vue-macros/test-utils'
import VueSetupSFC from '../src/rollup'
import { SETUP_SFC_REGEX } from '../src/core'

describe('setup-component', async () => {
  test('isSetupSFC', () => {
    expect(SETUP_SFC_REGEX.test('foo.setup.ts')).toBe(true)
    expect(SETUP_SFC_REGEX.test('foo.setup.tsx')).toBe(true)
    expect(SETUP_SFC_REGEX.test('foo.setup.jsx')).toBe(true)
    expect(SETUP_SFC_REGEX.test('foo.setup.js')).toBe(true)
    expect(SETUP_SFC_REGEX.test('foo.setup.mjs')).toBe(true)
    expect(SETUP_SFC_REGEX.test('foo.setup.cts')).toBe(true)

    expect(SETUP_SFC_REGEX.test('foo.ts')).toBe(false)
  })

  describe('fixtures', async () => {
    const root = resolve(__dirname, '..')
    const files = await glob('tests/fixtures/*.{vue,[jt]s?(x)}', {
      cwd: root,
      onlyFiles: true,
    })

    for (const file of files) {
      test(file.replace(/\\/g, '/'), async () => {
        const filepath = resolve(root, file)

        const code = await rollupBuild(filepath, [
          VueSetupSFC(),
          Vue({
            include: [/\.setup\.[jt]sx?/],
          }),
          VueJsx() as any,
          RollupRemoveVueFilePathPlugin(),
          RollupEsbuildPlugin({
            target: 'esnext',
          }),
        ])
        expect(code).toMatchSnapshot()
      })
    }
  })
})
