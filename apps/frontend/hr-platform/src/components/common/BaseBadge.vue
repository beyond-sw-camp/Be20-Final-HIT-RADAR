<template>
  <span class="badge" :class="tone">
    <span class="dot"></span>
    <slot />
  </span>
</template>

<script setup>
defineProps({
  tone: { type: String, default: '' }, // good | warn | bad
})
</script>
