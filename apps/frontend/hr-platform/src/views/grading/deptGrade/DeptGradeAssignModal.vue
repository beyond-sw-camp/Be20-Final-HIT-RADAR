<template>
  <Teleport to="body">
    <div class="modal-backdrop">
      <div class="modal-card">

        <!-- Header -->
        <div class="modal-header">
          <div>
            <h3 class="modal-title">
              {{ isEdit ? '부서 등급 수정' : '부서 등급 부여' }}
            </h3>
            <p class="subtitle">{{ department.departmentName }}</p>
          </div>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <!-- Body -->
        <div class="modal-body">

          <!-- 등급 선택 -->
          <div class="field">
            <label>등급</label>
            <select v-model="form.gradeId" class="select">
              <option disabled value="">등급을 선택하세요</option>
              <option
                v-for="grade in grades"
                :key="grade.gradeId"
                :value="grade.gradeId"
              >
                {{ grade.gradeName }}
              </option>
            </select>
          </div>

          <!-- 사유 -->
          <div class="field">
            <label>부여 사유</label>
            <textarea
              rows="3"
              v-model="form.gradeReason"
              class="textarea"
              placeholder="등급 부여 사유를 입력하세요"
            />
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn ghost" @click="$emit('close')">취소</button>

          <button class="btn ghost" @click="saveOnly">
            저장
          </button>

        </div>

      </div>
    </div>
  </Teleport>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { assignDeptGrade, updateDeptGrade } from '@/api/DeptGradeApi.js'
import { fetchCompanyGrades } from '@/api/gradeApi.js'

const props = defineProps({
  department: Object,
  cycleId: Number,
  companyId: Number,
  deptGrade: Object, // 수정 시
})

const emit = defineEmits(['close', 'success'])

const isEdit = computed(() => !!props.deptGrade)

const grades = ref([])

const form = ref({
  gradeId: '',
  gradeReason: '',
})

onMounted(async () => {
  // 등급 목록 조회
  const res = await fetchCompanyGrades()
  grades.value =  res.data.data ?? res.data

  // 수정일 경우 기존 값 세팅
  if (isEdit.value) {
    form.value.gradeId = props.deptGrade.gradeId
    form.value.gradeReason = props.deptGrade.gradeReason
  }
})


const saveDraft = async () => {
  if (!form.value.gradeId) {
    alert('등급을 선택하세요')
    return null
  }

  let deptGradeId = null

  if (isEdit.value) {
    await updateDeptGrade(props.deptGrade.deptGradeId, {
      gradeId: form.value.gradeId,
      gradeReason: form.value.gradeReason,
    })
    deptGradeId = props.deptGrade.deptGradeId
  } else {
    // assign API가 id를 안 내려주면 null 유지
    await assignDeptGrade({
      companyId: props.companyId,
      cycleId: props.cycleId,
      departmentId: props.department.departmentId,
      gradeId: form.value.gradeId,
      gradeReason: form.value.gradeReason,
    })
  }

  return deptGradeId
}


const saveOnly = async () => {
  await saveDraft()
  emit('success')
  emit('close')
}

</script>


<style scoped>
/* ===== Backdrop ===== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
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

/* ===== Inputs ===== */
.select,
.textarea {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #f9fafb;
}

.select:focus,
.textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.textarea {
  resize: none;
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
