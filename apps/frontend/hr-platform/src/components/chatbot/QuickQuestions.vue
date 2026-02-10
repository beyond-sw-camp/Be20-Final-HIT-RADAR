<template>
  <div class="quick-container">
    <div class="questions-section quick">
      <button class="quick-btn" v-for="q in quickQuestions" :key="q.text" @click="$emit('pick', q.text)">
        {{ q.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, computed } from 'vue'

defineEmits(['pick'])

const quickQuestionsData = [
  { text: '연차 이월 기준 알려줘' },
  { text: '휴가 신청 절차 알려줘' },
  { text: '근태 기준 알려줘' },
  { text: '개인정보 변경 절차 알려줘' },
];

const quickQuestions = computed(() => {
  return quickQuestionsData;
});
</script>

<style scoped>
.quick-container {
  /* This container helps stack the sections vertically */
  display: flex;
  flex-direction: column;
  padding: 12px 14px; /* Apply overall padding here */
  border-bottom: 1px solid var(--border);
}

.questions-section {
  margin-top: 10px; /* Space above questions section */
  padding-top: 10px; /* Internal padding */
  border-top: 1px solid #eee; /* Separator line */
}

.questions-section h3 {
  margin-bottom: 10px;
  font-size: 1em;
  color: #555;
}
/* No need for .quick styles here as they are now applied to category-section and questions-section in the template */
</style>

