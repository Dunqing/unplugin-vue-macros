# unplugin-vue-macros [![npm](https://img.shields.io/npm/v/unplugin-vue-macros.svg)](https://npmjs.com/package/unplugin-vue-macros)

[![Unit Test](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/unplugin-vue-macros/actions/workflows/unit-test.yml)

English | [简体中文](./README-zh-CN.md)

Extend macros and syntax sugar in Vue.

## Features

- ✨ Extend macros and syntax sugar in Vue.
- 💚 Supports both Vue 2 and Vue 3 out-of-the-box.
- 🦾 Full TypeScript support.
- ⚡️ Supports Vite, Webpack, Vue CLI, Rollup, esbuild and more, powered by [unplugin](https://github.com/unjs/unplugin).

## Installation

```bash
npm i unplugin-vue-macros -D
```

<details>
<summary>Vite (first-class support)</summary><br>

```ts
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [VueMacros(), Vue()],
})
```

<br></details>

<details>
<summary>Rollup (first-class support)</summary><br>

```ts
// rollup.config.js
import Vue from 'unplugin-vue/rollup'
import VueMacros from 'unplugin-vue-macros/rollup'

export default {
  plugins: [VueMacros(), Vue()], // must be before Vue plugin!
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [
    require('unplugin-vue-macros/esbuild')(), // must be before Vue plugin!
    require('unplugin-vue/esbuild')(),
  ],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-vue-macros/webpack')(), // must be before Vue plugin!
    require('unplugin-vue/webpack')(),
  ],
}
```

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [require('unplugin-vue-macros/webpack')()],
  },
}
```

<br></details>

### TypeScript Support

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-vue-macros/macros-global" /* ... */]
  }
}
```

## Usage

### `defineOptions`

Introduce a macro in `<script setup>`, `defineOptions`,
to use Options API in `<script setup>`, specifically to be able to set `name`, `props`, `emits`
and `render` in one function.

> **Note**: if you only need `defineOptions`, [the standalone version](https://github.com/sxzz/unplugin-vue-macros/tree/main/packages/define-options) is better for you.

If you support this feature, you can go to [RFC Discussion](https://github.com/vuejs/rfcs/discussions/430)
and hit like 👍 or comment. Thanks!

#### Basic Usage

```vue
<script setup lang="ts">
import { useSlots } from 'vue'
defineOptions({
  name: 'Foo',
  inheritAttrs: false,
})
const slots = useSlots()
</script>
```

<details>
<summary>Output</summary>

```vue
<script lang="ts">
export default {
  name: 'Foo',
  inheritAttrs: false,
}
</script>

<script setup>
const slots = useSlots()
</script>
```

</details>

#### JSX in `<script setup>`

```vue
<script setup lang="tsx">
defineOptions({
  render() {
    return <h1>Hello World</h1>
  },
})
</script>
```

<details>
<summary>Output</summary>

```vue
<script lang="tsx">
export default {
  render() {
    return <h1>Hello World</h1>
  },
}
</script>
```

</details>

### `defineModel`

Introduce a macro in `<script setup>`, `defineModel`.
To be able define and change `v-model` props as the same as normal variable.

> **Warning**: [Reactivity Transform](https://vuejs.org/guide/extras/reactivity-transform.html) is required. You should enable it first. Otherwise, it will lose the reactivity connection.

> **Warning**: Assignment expression is only supported in `<script setup>` block. In other words invalid in `<template>`.

#### Basic Usage

```vue
<script setup lang="ts">
let { modelValue } = defineModel<{
  modelValue: string
  count: number
}>()

console.log(modelValue)
modelValue = 'newValue'
count++
</script>
```

<details>
<summary>Output</summary>

```vue
<script setup lang="ts">
const { modelValue, count } = defineProps<{
  modelValue: string
  modelValue: number
}>()

const emit = defineEmits<{
  (evt: 'update:modelValue', value: string): void
  (evt: 'update:count', value: number): void
}>()

console.log(modelValue)
emit('update:modelValue', 'newValue')
emit('update:count', count + 1)
</script>
```

</details>

### `hoistStatic`

If you want to reference a constant declared in `<script setup>`, then this feature may help you.

If you support this feature, please go to [Vue PR](https://github.com/vuejs/core/pull/5752)
and hit like 👍. Thanks!

#### Basic Usage

```vue
<script setup lang="ts">
const name = 'AppFoo'
defineOptions({
  name,
})
</script>
```

<details>
<summary>Output</summary>

```vue
<script lang="ts">
const name = 'AppFoo'
export default {
  name,
}
</script>
```

</details>

#### Magic Comments

```vue
<script setup lang="ts">
const name = /* hoist-static */ fn() // a value that's even not a constant
defineOptions({
  name,
})
</script>
```

<details>
<summary>Output</summary>

```vue
<script lang="ts">
const name = fn()
export default {
  name,
}
</script>
```

</details>

### `setupComponent` (⚠️ experimental)

> **Warning**: Under experimental, use at your risk!

With `defineSetupComponent`, `<script setup>` code can be put in pure JS/TS(X) without [Volar](https://github.com/johnsoncodehk/volar) extension.

#### Basic Usage

```ts
export const App = defineSetupComponent(() => {
  defineProps<{
    foo: string
  }>()

  defineEmits<{
    (evt: 'change'): void
  }>()

  defineOptions({
    name: 'App',
  })

  // ...
})
```

#### Known issues

- [ ] The source map does not correspond properly.
- [ ] The render function cannot refer to variables. However, you can use the first argument of the render function to receive the context.
- [ ] TypeScript support is not yet complete.

### `setupSFC` (⚠️ experimental)

> **Warning**: Under experimental, use at your risk!

> **Note**: `defineOptions` is required. If you're using `setupComponent`, then `defineOptions` cannot be disabled.

`<script setup>` code can be put in pure JS/TS(X) without [Volar](https://github.com/johnsoncodehk/volar) extension.

#### Setup

Using Vite as an example:

```ts
// vite.config.ts
import VueMacros from 'unplugin-vue-macros/vite'
import Vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    VueMacros(),
    Vue({
      include: [/\.vue$/, /setup\.[cm]?[jt]sx?$/], // ⬅️ setupSFC pattern need to be added
    }),
  ],
})
```

#### Basic Usage

```tsx
// Foo.setup.tsx
defineProps<{
  foo: string
}>()

defineEmits<{
  (evt: 'change'): void
}>()

export default () => (
  <div>
    <h1>Hello World</h1>
  </div>
)
```

#### Known issues

- [ ] The source map does not correspond properly in JSX/TSX files.
- [ ] The render function cannot refer to variables. However, you can use the first argument of the render function to receive the context.
- [ ] TypeScript support is not yet complete.

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
