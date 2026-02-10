<template>
  <button class="btn" :class="variant" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: '' }, // '' | 'primary' | 'ghost'
})
</script>
