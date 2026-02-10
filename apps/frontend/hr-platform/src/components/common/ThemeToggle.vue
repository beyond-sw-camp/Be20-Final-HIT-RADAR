<template>
  <button class="btn ghost" @click="ui.toggleTheme()">
    {{ ui.theme === 'dark' ? '🌙 Dark' : '☀️ Light' }}
  </button>
</template>

<script setup>
import { useUiStore } from '@/stores/uiStore'
const ui = useUiStore()
</script>
