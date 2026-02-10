<template>
  <section class="page">
    <!-- ================= header ================= -->
    <header class="section-title">
      <div class="title-row">
        <div>
          <h2>평가 배정 관리</h2>
          <p>회차 → 평가유형 → 부서 선택 후 평가자를 배정합니다</p>
        </div>
      </div>
    </header>

    <!-- ================= selectors ================= -->
    <div class="assignment-link">
      <span>이미 배정된 평가가 있나요?</span>
      <button @click="goToAssignmentList">
        배정 현황 보러가기 →
      </button>
    </div>

    <!-- Modified Grid with tighter gap and aligned button -->
    <div class="selector-row">
      <div class="selector-grid">
        <select v-model="selectedCycleId" @change="onCycleChange">
          <option value="">회차 선택</option>
          <option v-for="c in cycles" :key="c.cycleId" :value="c.cycleId">
            {{ c.cycleName }}
          </option>
        </select>

        <div class="eval-type-select">
          <select
            v-model="selectedCycleEvalTypeId"
            :disabled="!evalTypes.length"
          >
            <option value="">평가 유형 선택</option>
            <option
              v-for="t in evalTypes"
              :key="t.cycleEvalTypeId"
              :value="t.cycleEvalTypeId"
            >
              {{ t.typeName }}
            </option>
          </select>
        </div>

        <select v-model="selectedDeptId" @change="loadDeptData">
          <option value="">부서 선택</option>
          <option v-for="d in departments" :key="d.deptId" :value="d.deptId">
            {{ d.deptName }}
          </option>
        </select>
      </div>

      <div class="preview-action" v-if="selectedCycleEvalTypeId">
        <button class="btn-preview" @click="openPreview">
          📄 문항지 보러 가기
        </button>
      </div>
    </div>

    <!-- ================= Empty State Guide ================= -->
    <div v-if="!selectedDeptId" class="empty-guide">
      <div class="guide-content">
        <div class="emoji">👆</div>
        <h3>부서를 선택해주세요</h3>
        <p>상단에서 부서를 선택하면<br/>해당 부서의 평가 대상자를 불러옵니다.</p>
      </div>
    </div>

    <!-- ================= evaluator ================= -->
    <div v-if="members.length" class="card">
      <h3>① 평가자 선택</h3>

      <div class="list">
        <label
          v-for="m in members"
          :key="m.empId"
          class="item"
        >
          <input
            type="radio"
            class="custom-check"
            name="evaluator"
            :value="m.empId"
            v-model="evaluatorId"
          />
          <span>{{ m.name }} ({{ m.positionName }})</span>
        </label>
      </div>
    </div>

    <!-- ================= evaluatee ================= -->
    <div v-if="evaluatorId" class="card">
      <h3>② 피평가자 선택</h3>

      <div class="list">
        <label
          v-for="m in members"
          :key="m.empId"
          class="item"
          :class="{ disabled: isAlreadyAssigned(m.empId) }"
        >
          <input
            type="checkbox"
            class="custom-check"
            :value="m.empId"
            v-model="evaluateeIds"
            :disabled="isAlreadyAssigned(m.empId)"
          />

          <span>
            {{ m.name }} ({{ m.positionName }})
            <small v-if="isAlreadyAssigned(m.empId)">
              이미 배정됨
            </small>
          </span>
        </label>
      </div>
    </div>

    <!-- ================= action ================= -->
    <div class="actions" v-if="evaluateeIds.length">
      <button class="primary" @click="submitAssignments">
        평가 배정하기
      </button>
    </div>

    <!-- ================= Preview Modal ================= -->
    <Teleport to="body">
      <div v-if="showPreview" class="modal-backdrop" @click.self="closePreview">
        <div class="modal-card">
          <div class="modal-header">
            <h3>평가 문항지 미리보기</h3>
            <button class="close-btn" @click="closePreview">✕</button>
          </div>
          <div class="modal-body">
            <div v-if="previewSections.length === 0" class="no-questions">
              등록된 문항이 없습니다.
            </div>
            <div
              v-else
              v-for="section in previewSections"
              :key="section.sectionId"
              class="preview-section"
            >
              <h4>{{ section.sectionTitle }}</h4>
              <p class="sec-desc">{{ section.sectionDescription }}</p>

              <div
                v-for="q in section.questions"
                :key="q.questionId"
                class="preview-question"
              >
                <div class="q-title">Q. {{ q.questionContent }}</div>
                <div class="q-type-badge">{{ q.questionType }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </section>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'

import { fetchCycles } from '@/api/cycleApi'
import { fetchCycleEvaluationTypes } from '@/api/cycleEvaluationTypeApi'
import {
  getAllDepartmentsByCompany,
  getDepartmentMembers
} from '@/api/departmentApi'
import {
  createEvaluationAssignments,
  fetchAssignmentsByCycleEvalType
} from '@/api/evaluationAssignmentApi'
import { fetchEvaluationSheet } from '@/api/evaluationSheetApi'

// ================= router =================
const router = useRouter()

const goToAssignmentList = () => {
  router.push('/hr/evaluation/assignment/status')
}

// ================= state =================
const cycles = ref([])
const evalTypes = ref([])
const departments = ref([])
const members = ref([])
const assignments = ref([])

const selectedCycleId = ref('')
const selectedCycleEvalTypeId = ref('')
const selectedDeptId = ref('')

const evaluatorId = ref(null)
const evaluateeIds = ref([])

// Preview State
const showPreview = ref(false)
const previewSections = ref([])

// ================= lifecycle =================
onMounted(async () => {
  const cycleRes = await fetchCycles()
  cycles.value = cycleRes.data ?? []

  // Auto-select the latest cycle
  if (cycles.value.length > 0) {
    const sorted = [...cycles.value].sort((a, b) => b.cycleId - a.cycleId)
    selectedCycleId.value = sorted[0].cycleId
    await onCycleChange()
  }

  const deptRes = await getAllDepartmentsByCompany()
  departments.value = deptRes.data.data.departments ?? []
})

// ================= handlers =================
const onCycleChange = async () => {
  selectedCycleEvalTypeId.value = ''
  selectedDeptId.value = ''
  evalTypes.value = []
  assignments.value = []

  if (!selectedCycleId.value) return

  evalTypes.value =
    (await fetchCycleEvaluationTypes(selectedCycleId.value)).data.data
}

// ================= Preview Handler =================
const openPreview = async () => {
  if (!selectedCycleId.value || !selectedCycleEvalTypeId.value) return

  const targetType = evalTypes.value.find(
    t => t.cycleEvalTypeId === selectedCycleEvalTypeId.value
  )
  if (!targetType) return

  // We need the original evalTypeId, assuming it's available in the response
  // or traverse to find it. The current API 'fetchCycleEvaluationTypes' returns
  // objects that usually contain evalTypeId. Let's check api result structure assumption.
  // Assuming 'evalTypeId' is present in 't'.
  const evalTypeId = targetType.evalTypeId

  try {
    const res = await fetchEvaluationSheet(selectedCycleId.value, evalTypeId)
    previewSections.value = res.data.data ?? []
    showPreview.value = true
  } catch (e) {
    console.error(e)
    alert('문항지를 불러오는데 실패했습니다.')
  }
}

const closePreview = () => {
  showPreview.value = false
  previewSections.value = []
}

// ================= members =================
const loadMembers = async () => {
  evaluatorId.value = null
  evaluateeIds.value = []

  if (!selectedDeptId.value) {
    members.value = []
    return
  }

  members.value =
    (await getDepartmentMembers(selectedDeptId.value)).data.data.employees
}

// ================= assignments =================
const loadAssignments = async () => {
  if (!selectedCycleEvalTypeId.value) {
    assignments.value = []
    return
  }

  assignments.value =
    (await fetchAssignmentsByCycleEvalType(
      selectedCycleEvalTypeId.value
    )).data.data
}

// 👉 평가유형 / 부서 바뀔 때마다 다시 조회
watch(
  [selectedCycleEvalTypeId, selectedDeptId],
  async ([cycleEvalTypeId, deptId]) => {
    if (!cycleEvalTypeId || !deptId) {
      assignments.value = []
      return
    }

    await loadMembers()
    await loadAssignments()
  }
)

// ================= utils =================

// 현재 부서에 해당하는 배정만 필터
const deptAssignments = computed(() =>
  assignments.value.filter(
    a => a.deptId === Number(selectedDeptId.value)
  )
)

const isAlreadyAssigned = (empId) => {
  return deptAssignments.value.some(
    a => a.evaluateeId === empId
  )
}

// ================= submit =================
const submitAssignments = async () => {
  await createEvaluationAssignments(
    selectedCycleEvalTypeId.value,
    {
      evaluatorId: evaluatorId.value,
      evaluateeIds: evaluateeIds.value,
    }
  )

  alert('평가 배정 완료')
  evaluateeIds.value = []

  // 저장 후 배정 다시 로드
  await loadAssignments()
}
</script>


<style scoped>
/* =====================
   PAGE
===================== */
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 40px;
}

/* =====================
   HEADER
===================== */
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.section-title h2 {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.section-title p {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* =====================
   ASSIGNMENT LINK
===================== */
.assignment-link {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
  font-size: 12px;
  color: #6b7280;
}

.assignment-link button {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  cursor: pointer;
}

.assignment-link button:hover {
  text-decoration: underline;
}

/* =====================
   SELECTORS
===================== */
.selector-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px; /* Reduced gap as requested */
  margin-bottom: 28px;
}

.selector-grid select {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #111827;
  transition: all .15s ease;
  width: 100%;
}

.selector-grid select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,.15);
}

.eval-type-select {
  display: flex;
  gap: 6px;
  align-items: center;
}

.eval-type-select select {
  width: 100%; /* Ensure it fills the grid cell */
}

.preview-action {
  display: flex;
  justify-content: center;
  margin-top: 12px;
  margin-bottom: 24px;
}

.btn-preview {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #4f46e5;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 24px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 6px rgba(0,0,0,0.03);
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-preview:hover {
  background: #f8fafc;
  border-color: #c7d2fe;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

/* =====================
   EMPTY GUIDE
===================== */
.empty-guide {
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 16px;
  padding: 60px 0;
  text-align: center;
  margin-bottom: 20px;
}
.guide-content .emoji { font-size: 40px; margin-bottom: 12px; }
.guide-content h3 { font-size: 16px; font-weight: 700; color: #334155; margin-bottom: 8px;}
.guide-content p { font-size: 13px; color: #64748b; line-height: 1.5; }

/* =====================
   CARD
===================== */
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 18px rgba(0,0,0,.05);
}

.card h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
}

/* =====================
   LIST
===================== */
.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

/* =====================
   ITEM
===================== */
.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;   /* ↓ 기존보다 축소 */
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all .15s ease;
}

.item input {
  transform: scale(0.9);   /* ↓ 버튼 크기 축소 */
  accent-color: #6366f1;
}

.item span {
  font-size: 13px;
  font-weight: 500;
}
/* =====================
   DISABLED ITEM
===================== */
.item.disabled {
  opacity: 0.45;
  background: #f1f5f9;
  border-style: dashed;
  pointer-events: none;
}

.item small {
  margin-left: 6px;
  font-size: 11px;
  font-weight: 700;
  color: #ef4444;
}


/* =====================
   ACTIONS
===================== */
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

/* =====================
   PRIMARY BUTTON
===================== */
.primary {
  padding: 10px 22px;
  border-radius: 999px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(79,70,229,.25);
  transition: all .15s ease;
}

.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(79,70,229,.35);
}

.custom-check {
  cursor: pointer;
  width: 16px !important;   /* 원하는 사이즈 고정 */
  height: 16px !important;
  margin: 0;
  accent-color: #6366f1;    /* 포인트 컬러 */
  flex-shrink: 0;           /* 레이아웃에서 찌그러짐 방지 */
  appearance: auto;         /* 브라우저 기본 형태 유지 */
}

/* =====================
   PREVIEW MODAL
===================== */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}
.modal-card {
  background: white;
  width: 800px; /* Widened to show 'full survey' feel */
  max-height: 85vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
}
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h3 { font-size: 16px; font-weight: 700; margin: 0; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; }

.modal-body {
  padding: 24px;
  overflow-y: auto;
}
.no-questions { text-align: center; color: #9ca3af; padding: 40px; }

.preview-section { margin-bottom: 24px; }
.preview-section h4 { font-size: 15px; font-weight: 700; margin-bottom: 6px; }
.sec-desc { font-size: 13px; color: #64748b; margin-bottom: 12px; }

.preview-question {
  background: #f8fafc;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.q-title { font-size: 13px; font-weight: 500; }
.q-type-badge { font-size: 11px; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; }

</style>
