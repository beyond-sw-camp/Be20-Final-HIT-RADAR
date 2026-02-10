<template>
  <div class="modal-backdrop">
    <div class="modal-card">

      <!-- Header -->
      <div class="modal-header">
        <div>
          <h3 class="modal-title">부서 등급 상세</h3>
          <p class="subtitle">{{ dept.departmentName }}</p>
        </div>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="field readonly">
          <label>등급</label>
          <div class="value-box">
            {{ dept.gradeName || '미부여' }}
          </div>
        </div>

        <div class="field readonly">
          <label>상태</label>
          <span
            class="status-pill"
            :class="statusClass(dept.gradeStatus)"
          >
            {{ statusText(dept.gradeStatus) }}
          </span>
        </div>

        <div class="field readonly">
          <label>부여 사유</label>
          <div class="value-box reason">
            {{ dept.gradeReason || '-' }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn ghost" @click="$emit('close')">
          닫기
        </button>

        <button
          v-if="dept.gradeStatus === 'SUBMITTED'"
          class="btn primary"
          @click="approve"
        >
          승인
        </button>
      </div>

    </div>
  </div>
</template>
<script setup>
import { approveDeptGrade } from '@/api/DeptGradeApi.js'

const props = defineProps({
  dept: Object,
})

const emit = defineEmits(['close', 'approved'])

const approve = async () => {
  if (!confirm('해당 부서 등급을 승인하시겠습니까?')) return
  await approveDeptGrade(props.dept.deptGradeId)
  emit('approved')
  emit('close')
}

const statusText = (status) => ({
  DRAFT: '작성 중',
  SUBMITTED: '제출됨',
  CONFIRMED: '확정',
}[status] ?? '미부여')

const statusClass = (status) => ({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
}[status])
</script>
<style>
/* ===== Backdrop ===== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

/* ===== Modal Card ===== */
.modal-card {
  width: 480px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalPop 0.25s ease-out;
}

@keyframes modalPop {
  from {
    transform: translateY(12px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* ===== Header ===== */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
}

.btn-close:hover {
  color: #111827;
}

/* ===== Body ===== */
.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  color: #6b7280;
}

/* readonly 값 */
.value-box {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 14px;
}

.value-box.reason {
  min-height: 60px;
  white-space: pre-wrap;
}

/* ===== Status ===== */
.status-pill {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
}

.status-pill.draft {
  background: #fff7ed;
  color: #c2410c;
}

.status-pill.submitted {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-pill.confirmed {
  background: #ecfdf5;
  color: #047857;
}

/* ===== Footer ===== */
.modal-footer {
  padding: 14px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== Buttons ===== */
.btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.btn.primary {
  background: #4f46e5;
  color: #ffffff;
}

.btn.primary:hover {
  background: #4338ca;
}

.btn.ghost {
  background: #eef2ff;
  color: #4338ca;
}

</style>
