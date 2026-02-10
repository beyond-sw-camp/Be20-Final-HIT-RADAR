<template>
  <Teleport to="body">
    <div class="modal-backdrop">
      <div class="modal-card">
        <!-- ===== Header ===== -->
        <div class="modal-header">
          <div>
            <h3 class="modal-title">
              {{ isEdit ? '이의제기 승인 · 등급 수정' : ' 등급 부여' }}
            </h3>
            <p class="subtitle">
              {{ employee?.name }} (EMP#{{ employee?.empId }})
            </p>
          </div>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <!-- ===== Body ===== -->
        <div class="modal-body">
          <!-- Grade -->
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

          <!-- Reason -->
          <div class="field">
            <label>등급 부여 사유</label>
            <textarea
              rows="3"
              v-model="form.gradeReason"
              class="textarea"
              placeholder="이의제기 내용을 반영하여 등급 부여 사유를 입력하세요"
            />
          </div>

          <!-- Rule Error -->
          <div v-if="ruleError" class="rule-error">
            {{ ruleError }}
          </div>

          <!-- Hint -->
          <div class="hint">
             등급과 사유는 필수이며,<br />
            등급 배분 규칙을 초과할 수 없습니다.
          </div>
        </div>

        <!-- ===== Footer ===== -->
        <div class="modal-footer">
          <button class="btn ghost" @click="$emit('close')">취소</button>

          <button class="btn ghost" @click="save">
            저장
          </button>

          <button class="btn primary" @click="submit">
            제출
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'


const props = defineProps({
  employee: Object,   // { empId, name, gradeId, gradeReason, individualGradeId }
  grades: Array,      // [{ gradeId, gradeName }]
  rules: Array,       // [{ gradeId, gradeName, maxRatio }]
  employees: Array,   // 전체 사원 목록 (배분 규칙 검증용)
})

const emit = defineEmits(['close', 'saved', 'submitted'])

/*  Edit 여부 (기존 등급 존재)*/
const isEdit = computed(() => !!props.employee?.individualGradeId)


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
  if (!form.value.gradeId) return ''

  const rule = props.rules?.find(r => r.gradeId === form.value.gradeId)
  if (!rule || rule.maxRatio == null) return ''

  const teamSize = props.employees.length
  const maxAllowed = Math.floor(teamSize * rule.maxRatio / 100)

  const others = props.employees.filter(
    e =>
      e.gradeId === form.value.gradeId &&
      e.empId !== props.employee.empId
  ).length

  if (others + 1 > maxAllowed) {
    return `${rule.gradeName} 등급은 최대 ${maxAllowed}명까지 부여할 수 있습니다.`
  }

  return ''
}

watch(
  () => [form.value.gradeId, props.employees],
  () => {
    ruleError.value = validateRule()
  },
  { deep: true }
)


const submit = async () => {
  if (!form.value.gradeId) {
    alert('등급을 선택하세요')
    return
  }

  if (!form.value.gradeReason || !form.value.gradeReason.trim()) {
    alert('등급 부여 사유를 입력해야 합니다')
    return
  }

  const err = validateRule()
  if (err) {
    ruleError.value = err
    alert(err)
    return
  }

  await emit('submitted', {
    empId: props.employee.empId,
    gradeId: form.value.gradeId,
    gradeReason: form.value.gradeReason,
  })
}

const save = () => {
  if (!form.value.gradeId) {
    alert('등급을 선택하세요')
    return
  }

  emit('saved', {
    empId: props.employee.empId,
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

.select, .textarea {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #f9fafb;
}

.select:focus, .textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.textarea { resize: none; }

.rule-error {
  padding: 10px 12px;
  border-radius: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 700;
}

.hint {
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #eef2f7;
  padding: 10px 12px;
  border-radius: 12px;
}

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

.btn.primary { background: #4f46e5; color: #ffffff; }
.btn.primary:hover { background: #4338ca; }
.btn.ghost { background: #eef2ff; color: #4338ca; }
</style>
