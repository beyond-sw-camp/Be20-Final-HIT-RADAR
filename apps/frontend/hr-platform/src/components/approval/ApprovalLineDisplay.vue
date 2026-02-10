<template>
  <div class="approval-line-display">
    <h3>결재선</h3>
    <ul class="line-steps">
      <li v-for="step in steps" :key="step.stepOrder" :class="['step-item', step.status.toLowerCase()]">
        <span class="step-order">{{ step.stepOrder }}</span>
        <span class="approver-info">{{ step.approverName }} ({{ step.approverId }})</span>
        <span class="step-status">{{ getStatusText(step.status) }}</span>
        <span v-if="step.actedAt" class="acted-at">{{ formatDate(step.actedAt) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  steps: {
    type: Array,
    default: () => [],
  },
});

const getStatusText = (status) => {
  switch (status) {
    case 'WAITING': return '대기';
    case 'PENDING': return '진행중';
    case 'APPROVED': return '승인';
    case 'REJECTED': return '반려';
    case 'CANCELED': return '취소됨';
    default: return status;
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
.approval-line-display {
  margin-top: 20px;
}

.approval-line-display h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.line-steps {
  list-style: none;
  padding: 0;
  margin: 0;
}

.step-item {
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

.step-item.waiting { border-color: #6c757d; } /* Grey */
.step-item.pending { border-color: #007bff; } /* Blue */
.step-item.approved { border-color: #28a745; } /* Green */
.step-item.rejected { border-color: #dc3545; } /* Red */
.step-item.canceled { border-color: #ffc107; } /* Yellow */


.step-order {
  font-weight: bold;
  margin-right: 10px;
  min-width: 25px;
}

.approver-info {
  flex-grow: 1;
  margin-right: 10px;
}

.step-status {
  font-weight: 600;
  margin-right: 10px;
}

.acted-at {
  font-size: 12px;
  color: #777;
}
</style>
