<template>
  <Teleport to="body">
    <div class="modal-backdrop">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">사원 등급 상세</h3>
            <p class="subtitle">{{ employee?.name }} (EMP#{{ employee?.empId }})</p>
          </div>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body">
          <div class="field readonly">
            <label>등급</label>
            <div class="value-box">{{ employee?.gradeName || '미부여' }}</div>
          </div>

          <div class="field readonly">
            <label>상태</label>
            <span class="status" :class="statusClass(employee?.gradeStatus)">
              {{ statusText(employee?.gradeStatus) }}
            </span>
          </div>

          <div class="field readonly">
            <label>부여 사유</label>
            <div class="value-box reason">
              {{ employee?.gradeReason || '-' }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn ghost" @click="$emit('close')">닫기</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script setup>
const props = defineProps({
  employee: Object,
})

const statusText = (s) => ({
  DRAFT: '작성 중',
  SUBMITTED: '제출됨',
  CONFIRMED: '확정',
}[s] ?? '미부여')

const statusClass = (s) => ({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
}[s] ?? 'none')
</script>
<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-card {
  width: 480px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalPop 0.25s ease-out;
}

@keyframes modalPop {
  from { transform: translateY(12px) scale(0.96); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title { font-size: 16px; font-weight: 700; }
.subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
}

.btn-close:hover { color: #111827; }

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12px; color: #6b7280; }

.value-box {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 14px;
}

.value-box.reason { min-height: 60px; white-space: pre-wrap; }

.status {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
}

.status.none { background: #f3f4f6; color: #6b7280; }
.status.draft { background: #fff7ed; color: #c2410c; }
.status.submitted { background: #eff6ff; color: #1d4ed8; }
.status.confirmed { background: #ecfdf5; color: #047857; }

.modal-footer {
  padding: 14px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.btn.ghost { background: #eef2ff; color: #4338ca; }
</style>
