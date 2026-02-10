<template>
  <div class="approval-tracker">
    <!-- Step 1: Temp Save -->
    <div :class="['step-item', getStepStatus(1)]">
      <div class="step-circle">
        <span v-if="getStepStatus(1) === 'completed'" class="icon-check">✔</span>
        <span v-else>1</span>
      </div>
      <span class="step-label">임시저장</span>
    </div>

    <div class="step-line" :class="{ active: currentStep > 1 }"></div>

    <!-- Step 2: Submit (Sangsin) -->
    <div :class="['step-item', getStepStatus(2)]">
      <div class="step-circle">
        <span v-if="getStepStatus(2) === 'completed'" class="icon-check">✔</span>
        <span v-else-if="status === 'IN_PROGRESS'" class="icon-pen">✎</span>
        <span v-else>2</span>
      </div>
      <span class="step-label">상신</span>
    </div>

    <div class="step-line" :class="{ active: currentStep > 2 }"></div>

    <!-- Step 3: Result -->
    <div :class="['step-item', getStepStatus(3)]">
      <div class="step-circle">
        <span v-if="status === 'APPROVED'" class="icon-check">✔</span>
        <span v-else-if="status === 'REJECTED'" class="icon-x">✖</span>
        <span v-else-if="status === 'WITHDRAWN'" class="icon-back">↩</span>
        <span v-else>3</span>
      </div>
      <span class="step-label">{{ resultLabel }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: {
    type: String,
    required: true
  }
});

const resultLabel = computed(() => {
  if (props.status === 'APPROVED') return '승인';
  if (props.status === 'REJECTED') return '반려';
  if (props.status === 'WITHDRAWN') return '회수';
  return '승인/반려';
});

const currentStep = computed(() => {
  switch (props.status) {
    case 'DRAFT':
    case 'TEMP':
      return 1;
    case 'SUBMITTED':
    case 'IN_PROGRESS':
      return 2;
    case 'APPROVED':
    case 'REJECTED':
    case 'WITHDRAWN':
      return 3;
    default:
      return 0;
  }
});

const getStepStatus = (stepIndex) => {
  if (currentStep.value > stepIndex) return 'completed';
  if (currentStep.value === stepIndex) {
    if (stepIndex === 3) {
        if (props.status === 'REJECTED') return 'error';
        if (props.status === 'WITHDRAWN') return 'warning'; // or normal
        if (props.status === 'APPROVED') return 'completed';
    }
    return 'active';
  }
  return 'pending';
};
</script>

<style scoped>
.approval-tracker {
  display: flex;
  align-items: center;
  gap: 4px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #f3f4f6;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.step-label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

/* Active State */
.step-item.active .step-circle {
  background-color: #3b82f6; /* Blue */
  border-color: #3b82f6;
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
.step-item.active .step-label {
  color: #3b82f6;
  font-weight: 700;
}

/* Completed State */
.step-item.completed .step-circle {
  background-color: #10b981; /* Green */
  border-color: #10b981;
  color: #fff;
}
.step-item.completed .step-label {
  color: #10b981;
}

/* Error/Rejected State */
.step-item.error .step-circle {
  background-color: #ef4444; /* Red */
  border-color: #ef4444;
  color: #fff;
}
.step-item.error .step-label {
  color: #ef4444;
}

/* Warning/Withdrawn State */
.step-item.warning .step-circle {
  background-color: #f59e0b; /* Amber/Orange */
  border-color: #f59e0b;
  color: #fff;
}
.step-item.warning .step-label {
  color: #f59e0b;
}

/* Connector Line */
.step-line {
  width: 30px;
  height: 2px;
  background-color: #e5e7eb;
  margin-bottom: 14px; /* Align with circle center (label is ~14px height) */
}

.step-line.active {
  background-color: #10b981; /* Green line for completed paths */
}

/* Icons */
.icon-check, .icon-pen, .icon-x {
  font-size: 12px;
}
</style>
