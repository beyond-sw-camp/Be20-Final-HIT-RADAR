<template>
  <div class="approval-history-display">
    <h3>결재 이력</h3>
    <ul class="history-list">
      <li v-for="history in histories" :key="history.historyId" :class="['history-item', history.actionType ? history.actionType.toLowerCase() : '']">
        <span class="history-date">{{ formatDate(history.actedAt) }}</span>
        <span class="actor-info">{{ history.actorName }} ({{ history.actorId }})</span>
        <span class="action-type">{{ getActionTypeText(history.actionType) }}</span>
        <span v-if="history.reason" class="reason"> (사유: {{ history.reason }})</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  histories: {
    type: Array,
    default: () => [],
  },
});

const getActionTypeText = (type) => {
  switch (type) {
    case 'SUBMITTED': return '상신';
    case 'APPROVED': return '승인';
    case 'REJECTED': return '반려';
    case 'WITHDRAW': return '회수';
    default: return type;
  }
};

const formatDate = (datetime) => {
  if (!datetime) return '';
  const date = new Date(datetime);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.approval-history-display {
  margin-top: 20px;
}

.approval-history-display h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 10px 15px;
  margin-bottom: 10px;
  font-size: 14px;
  color: #555;
  border-left: 4px solid;
}

.history-item.submitted { border-color: #007bff; } /* Blue */
.history-item.approved { border-color: #28a745; } /* Green */
.history-item.rejected { border-color: #dc3545; } /* Red */
.history-item.withdraw { border-color: #ffc107; } /* Yellow */


.history-date {
  font-weight: bold;
  margin-right: 10px;
  min-width: 120px;
}

.actor-info {
  flex-grow: 1;
  margin-right: 10px;
}

.action-type {
  font-weight: 600;
  margin-right: 10px;
}

.reason {
  font-style: italic;
  color: #777;
}
</style>
