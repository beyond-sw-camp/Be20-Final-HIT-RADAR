<template>
  <section class="page">
    <div class="section-title">
      <div>
        <h1>평가 결과 조회</h1>
        <div class="sub">
          회차 · 부서 · 사원 · 평가유형을 선택하여 평가 결과를 확인합니다.
        </div>
      </div>
    </div>

    <div class="layout">
      <aside class="filter-card">
        <label>평가 회차</label>
        <select v-model="selectedCycleId">
          <option disabled value="">평가 회차 선택</option>
          <option
            v-for="c in cycles"
            :key="c.cycleId"
            :value="c.cycleId"
          >
            {{ c.cycleName }} - {{ cycleStatusLabel(c.status) }}
          </option>
        </select>
        <h3 class="filter-title">대상 선택</h3>

        <label>부서</label>
        <select v-model="selectedDeptId">
          <option disabled value="">부서 선택</option>
          <option
            v-for="d in departments"
            :key="d.deptId"
            :value="d.deptId"
          >
            {{ d.deptName }}
          </option>
        </select>

        <label>사원</label>
        <select v-model="selectedEmployeeId" :disabled="!selectedDeptId">
          <option disabled value="">사원 선택</option>
          <option
            v-for="e in employees"
            :key="e.empId"
            :value="e.empId"
          >
            {{ e.name }}
          </option>
        </select>

        <label>평가 유형</label>
        <div class="eval-type-list">
          <button
            v-for="t in evalTypes"
            :key="t.evalTypeId"
            :class="{ active: selectedEvalTypeId === t.evalTypeId }"
            @click="!t.disabled && (selectedEvalTypeId = t.evalTypeId)"
            :disabled="!selectedCycleId || !selectedEmployeeId || t.disabled"
          >
            {{ t.typeName }}
          </button>
        </div>
      </aside>

      <section class="result-panel">
        <div v-if="!selectedEvalTypeId" class="empty-state">
          <div class="empty-icon">📊</div>
          <div class="empty-title">평가 결과 리포트</div>
        </div>

        <template v-else>
          <div class="result-header">
            <div>
              <h2>{{ result.cycleName }}</h2>
              <div class="sub">{{ result.evalTypeName }}</div>
            </div>
          </div>

          <div
            v-for="q in result.questions"
            :key="q.questionId"
            class="question-card"
          >
            <div class="question-header">
              <span class="q-tag">Q</span>
              <span class="q-title">{{ q.questionContent }}</span>
              <span class="q-type">{{ q.questionType }}</span>
            </div>

            <div v-if="q.questionType === 'RATING'" class="rating-distribution">
              <div class="rating-summary">
                <span class="avg">{{ averageScore(q.responses) }}</span>
                <span class="avg-label">평균 점수</span>
              </div>

              <div class="rating-bars">
                <div
                  v-for="item in ratingDistribution(q.responses)"
                  :key="item.score"
                  class="rating-row"
                >
                  <div class="score-label">{{ item.score }}점</div>
                  <div class="bar-track">
                    <div
                      class="bar-fill"
                      :style="{ width: item.percent + '%' }"
                    />
                  </div>
                  <div class="bar-meta">
                    {{ item.percent }}% · {{ item.count }}명
                  </div>
                </div>
              </div>
            </div>

            <div v-if="q.questionType === 'SUBJECTIVE'" class="subjective-box">
              <blockquote v-for="(r, i) in q.responses" :key="i">
                {{ r.textAnswer }}
              </blockquote>
            </div>

            <div v-if="q.questionType === 'OBJECTIVE'" class="objective-box">
              <span class="option-pill">
                {{ q.responses[0]?.optionContent }}
              </span>
            </div>
          </div>
        </template>
      </section>
    </div>
  </section>
</template>


<script setup>
import { ref, watch, onMounted } from 'vue'
import { fetchCycleEvaluationTypes } from '@/api/cycleEvaluationTypeApi'
import { fetchEvaluateeEvaluationResult } from '@/api/evaluationResponseApi'
import { fetchCycles } from '@/api/cycleApi'
import {
  getAllDepartmentsByCompany,
  getDepartmentMembers
} from '@/api/departmentApi'

/* ===============================
State
=============================== */
const selectedCycleId = ref('')
const selectedDeptId = ref('')
const selectedEmployeeId = ref('')
const selectedEvalTypeId = ref('')

const cycles = ref([])
const departments = ref([])
const employees = ref([])
const evalTypes = ref([])

const result = ref({
  cycleId: null,
  cycleName: '',
  evalTypeId: null,
  evalTypeName: '',
  questions: [],
})

/* ===============================
초기 로딩
=============================== */
onMounted(async () => {
  const cycleRes = await fetchCycles()
  const list = cycleRes.data ?? []

  cycles.value = list.filter(
    c => c.status === 'IN_PROGRESS' || c.status === 'CLOSED'
  )

  const deptRes = await getAllDepartmentsByCompany()
  departments.value = deptRes.data.data.departments
})

/* ===============================
회차 변경 시 초기화
=============================== */
watch(selectedCycleId, () => {
  selectedDeptId.value = ''
  selectedEmployeeId.value = ''
  selectedEvalTypeId.value = ''

  employees.value = []
  evalTypes.value = []
  result.value.questions = []
})

/* ===============================
부서 변경 시 사원 조회 (실제 API)
=============================== */
watch(selectedDeptId, async (deptId) => {
  selectedEmployeeId.value = ''
  selectedEvalTypeId.value = ''

  if (!deptId) {
    employees.value = []
    return
  }

  const res = await getDepartmentMembers(deptId)
  employees.value = res.data.data.employees

  evalTypes.value = []
  result.value.questions = []
})

/* ===============================
사원 선택 → 평가유형 조회
=============================== */
watch(selectedEmployeeId, async (employeeId) => {
  selectedEvalTypeId.value = ''
  result.value.questions = []

  if (!employeeId || !selectedCycleId.value) return

  const res = await fetchCycleEvaluationTypes(selectedCycleId.value)
  const types = res.data?.data ?? []

  evalTypes.value = types.map(t => ({
    ...t,
    disabled: false,
  }))
})

/* ===============================
평가유형 선택 → 결과 조회
=============================== */
watch(selectedEvalTypeId, async (evalTypeId) => {
  if (!evalTypeId || !selectedEmployeeId.value) return

  const resultRes = await fetchEvaluateeEvaluationResult(
    selectedEmployeeId.value,
    selectedCycleId.value,
    evalTypeId
  )

  const data = resultRes.data?.data
  if (!data) {
    result.value.questions = []
    return
  }

  result.value.cycleId = data.cycleId
  result.value.cycleName = data.cycleName
  result.value.evalTypeId = data.evalTypeId
  result.value.evalTypeName = data.evalTypeName
  result.value.questions = data.questions ?? []
})

/* ===============================
Utils
=============================== */
const averageScore = (responses) => {
  if (!responses || !responses.length) return '-'
  const sum = responses.reduce((a, r) => a + r.score, 0)
  return (sum / responses.length).toFixed(1)
}

const ratingDistribution = (responses) => {
  if (!responses || !responses.length) return []

  const total = responses.length
  const map = {}

  responses.forEach(r => {
    map[r.score] = (map[r.score] || 0) + 1
  })

  return Object.entries(map).map(([score, count]) => ({
    score,
    count,
    percent: Math.round((count / total) * 100),
  }))
}

const cycleStatusLabel = (status) => {
  if (status === 'IN_PROGRESS') return '진행 중'
  if (status === 'CLOSED') return '종료'
  return status
}
</script>




<style scoped>
/* ===============================
   Layout
=============================== */
.layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 28px;
}

/* ===============================
   LEFT : Filter Card
=============================== */
.filter-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 16px;
  border: 1px solid #e5e7eb;
}

.filter-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #111827;
}

.filter-card label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  margin-top: 10px;
}

.filter-card select {
  width: 100%;
  margin-top: 6px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  background: #ffffff;
}

.filter-card select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* 평가 유형 버튼 */
.eval-type-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.eval-type-list button {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  text-align: left;
}

.eval-type-list button:hover {
  background: #f1f5f9;
}

.eval-type-list button.active {
  background: #eef2ff;
  border-color: #6366f1;
  color: #4338ca;
}

.eval-type-list button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hint {
  margin-top: 14px;
  font-size: 11px;
  color: #9ca3af;
  line-height: 1.5;
}

/* ===============================
   RIGHT : Result Panel
=============================== */
.result-panel {
  min-height: 420px;
}

/* Empty State */
.empty-state {
  height: 100%;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #e5e7eb;
  border-radius: 16px;
  background: #fafafa;
  text-align: center;
}

.empty-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.empty-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.empty-desc {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.5;
}

/* ===============================
   Result Header
=============================== */
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 18px;
}

.result-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.result-header .sub {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.report-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
}

/* ===============================
   Question Card
=============================== */
.question-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
}

.question-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
}

.q-tag {
  background: #6366f1;
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
}

.q-title {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.q-type {
  font-size: 10px;
  color: #6b7280;
}

/* ===============================
   RATING
=============================== */
.rating-summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 12px;
}

.rating-summary .avg {
  font-size: 26px;
  font-weight: 800;
  color: #4338ca;
}

.rating-summary .avg-label {
  font-size: 12px;
  color: #6b7280;
}

.rating-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-row {
  display: grid;
  grid-template-columns: 40px 1fr 70px;
  align-items: center;
  gap: 10px;
}

.score-label {
  font-size: 11px;
  color: #374151;
  text-align: right;
}

.bar-track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #818cf8);
  transition: width 0.3s ease;
}

.bar-meta {
  font-size: 11px;
  color: #6b7280;
}

/* ===============================
   SUBJECTIVE
=============================== */
.subjective-box blockquote {
  background: #f9fafb;
  border-left: 3px solid #6366f1;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 8px;
}

/* ===============================
   OBJECTIVE
=============================== */
.option-pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0369a1;
  font-size: 12px;
  font-weight: 600;
}
</style>
