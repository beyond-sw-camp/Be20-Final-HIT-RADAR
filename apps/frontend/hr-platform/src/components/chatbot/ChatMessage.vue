<template>
  <div class="msg" :class="msg.from === 'user' ? 'me' : 'botm'">
    {{ msg.text }}
  </div>
</template>

<script setup>
defineProps({ msg: { type: Object, required: true } })
</script>
