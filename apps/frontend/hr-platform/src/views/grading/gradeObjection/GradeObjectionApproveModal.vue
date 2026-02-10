<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-header">
        <div>
          <h3 class="modal-title">이의제기 승인 · 등급 수정</h3>
          <p class="subtitle">
            {{ employee.name }} (EMP#{{ employee.empId }})
          </p>
        </div>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label>등급</label>
          <select v-model="form.gradeId" class="select">
            <option disabled :value="null">등급을 선택하세요</option>
            <option
              v-for="g in grades"
              :key="g.gradeId"
              :value="g.gradeId"
            >
              {{ g.gradeName }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>처리 사유 (등급 부여 사유)</label>
          <textarea
            rows="3"
            v-model="form.gradeReason"
            class="textarea"
            placeholder="이의제기를 반영한 최종 등급 부여 사유를 입력하세요"
          />
        </div>

        <div v-if="ruleError" class="rule-error">
          {{ ruleError }}
        </div>

        <div class="hint">
          승인 시 개인 등급은 즉시 수정되며,<br />
          이의제기는 승인 상태로 변경됩니다.
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn ghost" @click="$emit('close')">취소</button>
        <button class="btn primary" @click="submit">승인 처리</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  employee: Object,
  grades: Array,
  rules: Array,
  employees: Array,
})

const emit = defineEmits(['close', 'submit'])

const form = ref({
  gradeId: null,
  gradeReason: '',
})

watch(
  () => props.employee,
  (v) => {
    form.value = {
      gradeId: v?.gradeId ?? null,
      gradeReason: v?.gradeReason ?? '',
    }
  },
  { immediate: true }
)

const ruleError = ref('')

const validateRule = () => {
  ruleError.value = ''
  const rule = props.rules.find(r => r.gradeId === form.value.gradeId)
  if (!rule || rule.maxRatio == null) return ''

  const teamSize = props.employees.length
  const maxAllowed = Math.floor(teamSize * rule.maxRatio / 100)

  const count = props.employees.filter(
    e =>
      e.gradeId === form.value.gradeId &&
      e.empId !== props.employee.empId
  ).length

  return count + 1 > maxAllowed
    ? `${rule.gradeName} 등급은 최대 ${maxAllowed}명까지 가능합니다.`
    : ''
}

const submit = () => {
  if (!form.value.gradeId) {
    alert('등급을 선택하세요')
    return
  }

  if (!form.value.gradeReason.trim()) {
    alert('처리 사유를 입력하세요')
    return
  }

  const err = validateRule()
  if (err) {
    ruleError.value = err
    alert(err)
    return
  }

  emit('submit', {
    gradeId: form.value.gradeId,
    gradeReason: form.value.gradeReason,
  })
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-card {
  width: 480px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
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

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.select,
.textarea {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.rule-error {
  padding: 10px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  font-size: 12px;
}

.hint {
  font-size: 12px;
  color: #6b7280;
}

.modal-footer {
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background: #4f46e5;
  color: #ffffff;
}

.btn.ghost {
  background: #eef2ff;
  color: #4338ca;
}
</style>
