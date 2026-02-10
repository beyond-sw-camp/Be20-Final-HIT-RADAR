<template>
  <div class="policy-list-item">
    <div class="item-content">
      <div class="item-title">{{ document.title }}</div>
      <div class="item-category">{{ document.category }}</div>
    </div>
    <div class="item-actions">
      <button class="btn small" @click="emit('view', document)">보기</button>
      <button class="btn small btn-info" @click="emit('edit', document)">수정</button>
      <button class="btn small danger" @click="emit('delete', document.id)">삭제</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  document: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['view', 'edit', 'delete']);
</script>

<style scoped>
.policy-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.policy-list-item:hover {
  background-color: #f5f5f5;
}

.item-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  align-items: flex-start; /* Ensure text is left-aligned within its column */
}

.item-actions {
  display: flex;
  gap: 5px;
  white-space: nowrap; /* Keep buttons on one line */
  align-items: center;
}

/* Base button styles are likely global or from a shared component */
/* Redundant button styles might be removed if inherited from global/BaseButton */
</style>