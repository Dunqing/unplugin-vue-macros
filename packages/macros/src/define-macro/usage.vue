<script setup lang="ts">
import { defineVModel } from './runtime'

defineVModel<string>('modelValue')
</script>

<template>
  <div>
    <slot />
  </div>
</template>
