<template>
  <section class="page">
    <!-- ===== Header / Summary ===== -->
    <div class="summary">
      <div class="summary-left">
        <div class="title-row">
          <h2 class="title">개인 등급 부여</h2>
          <span class="pill in-progress">IN PROGRESS</span>
        </div>

        <p class="sub">
          현재 배분 현황 입니다
        </p>

        <div class="meta-row">
          <div class="meta">
            <span class="meta-label">우리팀 등급</span>
            <span class="meta-value badge-grade">{{ teamGrade.name }}</span>
          </div>
          <div class="meta">
            <span class="meta-label">부여 현황</span>
            <span class="meta-value">
              {{ assignedCount }} / {{ employees.length }}명
            </span>
          </div>
          <div class="meta">
            <span class="meta-label">제출 완료</span>
            <span class="meta-value">
              {{ submittedCount }}명
            </span>
          </div>
        </div>
      </div>

      <div class="summary-right">
        <div class="rule-card">
          <div class="rule-head">
            <p class="rule-title">등급 배분 규칙</p>
            <p class="rule-hint">제출 시 규칙 위반은 허용되지 않습니다.</p>
          </div>

          <div class="rule-grid">
            <div class="rule-pill" v-for="r in rules" :key="r.gradeId">
              <span class="rule-grade">{{ r.gradeName }}</span>

              <span class="rule-limit">
              {{ r.maxRatio === null ? '무제한' : `최대 ${r.maxRatio}%` }}
              </span>
              <span class="rule-count"> 현재 {{ gradeCount(r.gradeName) }}명</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Filter Bar ===== -->
    <div class="card">
      <div class="card-head">
        <h4 class="card-title">사원 목록</h4>
      </div>

      <div class="filter-bar">
        <input
          v-model="searchKeyword"
          type="text"
          class="search"
          placeholder="사원명 검색"
        />

        <select v-model="statusFilter" class="select">
          <option value="">전체 상태</option>
          <option value="NONE">미부여</option>
          <option value="DRAFT">작성 중(DRAFT)</option>
          <option value="SUBMITTED">제출됨(SUBMITTED)</option>
          <option value="CONFIRMED">확정(CONFIRMED)</option>
        </select>

        <select v-model="gradeFilter" class="select">
          <option value="">전체 등급</option>
          <option
            v-for="g in gradeOptions"
            :key="g.gradeId"
            :value="g.gradeName"
          >
            {{ g.gradeName }}
          </option>
        </select>
      </div>


      <!-- ===== Table ===== -->
      <table class="table">
        <thead>
        <tr>
          <th>사원</th>
          <th>등급</th>
          <th>부여 사유</th>
          <th>상태</th>
          <th>검증</th>
          <th></th>
        </tr>
        </thead>

        <tbody>
        <tr
          v-for="emp in filteredEmployees"
          :key="emp.empId"
          class="row"
          @click="openDetail(emp)"
        >
          <td class="emp">
            <div class="avatar">{{ emp.name?.slice(0, 1) ?? '?' }}</div>
            <div class="emp-meta">
              <div class="emp-name">{{ emp.name ?? '-' }}</div>
            </div>
          </td>

          <td>
              <span v-if="emp.gradeName" class="grade-badge">
                {{ emp.gradeName }}
              </span>
            <span v-else class="muted">미부여</span>
          </td>

          <td class="reason-cell">
              <span v-if="emp.gradeReason" class="reason-preview">
                {{ emp.gradeReason }}
              </span>
            <span v-else class="muted">-</span>
          </td>

          <td>
              <span class="status" :class="statusClass(emp.gradeStatus)">
                {{ statusText(emp.gradeStatus) }}
              </span>
          </td>

          <td>
              <span v-if="violation(emp)" class="warn">
                {{ violation(emp) }}
              </span>
            <span v-else class="ok">정상</span>
          </td>

          <td class="actions">
            <!-- 작성/수정 가능 -->
            <template v-if="!emp.gradeStatus || emp.gradeStatus === 'DRAFT'">
              <button class="btn ghost" @click.stop="openAssign(emp)">
                {{ emp.individualGradeId ? '수정' : '부여' }}
              </button>

              <button
                v-if="emp.individualGradeId"
                class="btn danger"
                @click.stop="remove(emp)"
              >
                삭제
              </button>

              <button
                v-if="emp.individualGradeId"
                class="btn primary"
                :disabled="!!violation(emp) || !emp.gradeReason"
                @click.stop="submitRow(emp)"
              >
                제출
              </button>
            </template>

            <!-- 제출됨 → 승인 -->
            <template v-else-if="emp.gradeStatus === 'SUBMITTED'">
              <button
                class="btn primary"
                @click.stop="approve(emp)"
              >
                승인
              </button>
            </template>

            <!-- 확정 -->
            <template v-else-if="emp.gradeStatus === 'CONFIRMED'">
              <span class="status confirmed">확정됨</span>
            </template>

            <!-- 기타 -->
            <template v-else>
              <span class="muted">-</span>
            </template>
          </td>
        </tr>

        <tr v-if="!filteredEmployees.length">
          <td colspan="6" class="empty-row">검색 결과가 없습니다.</td>
        </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== Assign / Edit Modal ===== -->
    <IndividualGradeAssignModal
      v-if="showAssignModal && selectedEmp"
      :employee="selectedEmp"
      :grades="gradeOptions"
      :rules="rules"
      :employees="employees"
      @close="closeAssign"
      @saved="applySaved"
      @submitted="applySubmitted"
    />

    <!-- ===== Detail Modal ===== -->
    <IndividualGradeDetailModal
      v-if="showDetailModal && selectedEmp"
      :employee="selectedEmp"
      @close="closeDetail"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import IndividualGradeAssignModal from '@/views/grading/individualGrade/IndividualGradeAssignModal.vue'
import IndividualGradeDetailModal from '@/views/grading/individualGrade/IndividualGradeDetailModal.vue'

import { fetchMyDeptGrade } from '@/api/DeptGradeApi.js'
import { fetchCompanyGrades } from '@/api/gradeApi.js'
import { fetchDistributionPolicies } from '@/api/teamGradeDistributionPolicyApi.js'
import {
  assignIndividualGrade,
  updateIndividualGrade,
  deleteIndividualGrade,
  submitIndividualGrade,
  fetchEmployeeGradeStatusList,
  approveIndividualGrade
} from '@/api/individualGradeApi.js'

const currentCycle = ref(null)

import { fetchCycles } from '@/api/cycleApi.js'

const loadCurrentCycle = async () => {
  const res = await fetchCycles()
  const cycles = res.data.data ?? res.data

  currentCycle.value = cycles.find(
    c => c.status === 'IN_PROGRESS' || c.status === 'IN PROGRESS'
  )
}

/* =========================
 * 기본 컨텍스트
 * ========================= */
const route = useRoute()

const rawCycleId = route.params.cycleId
const cycleId = computed(() => {
  const v = Number(rawCycleId)
  return Number.isNaN(v) ? null : v
})

//승인
const approve = async (emp) => {
  if (!confirm(`${emp.name} 사원의 등급을 승인하시겠습니까?`)) return

  await approveIndividualGrade(emp.individualGradeId)
  await loadEmployees()
}

/* =========================
 * 1. 팀(부서) 등급
 * ========================= */
const teamGrade = ref({ id: null, name: '-' })

const loadMyDeptGrade = async () => {
  try {
    const res = await fetchMyDeptGrade()
    const { gradeId, gradeName } = res.data.data ?? res.data
    teamGrade.value = { id: gradeId, name: gradeName }
  } catch {
    teamGrade.value = { id: null, name: '-' }
  }
}

/* =========================
 * 2. 회사 등급 목록
 * ========================= */
const gradeOptions = ref([])

const loadCompanyGrades = async () => {
  const res = await fetchCompanyGrades()
  const list = res.data.data ?? res.data

  gradeOptions.value = list
    .sort((a, b) => a.gradeOrder - b.gradeOrder)
    .map(g => ({
      gradeId: g.gradeId,
      gradeName: g.gradeName,
    }))
}

/* =========================
 * 3. 등급 배분 규칙
 * ========================= */
const rules = ref([])

const loadDistributionPolicies = async () => {
  if (!teamGrade.value.id) return

  const res = await fetchDistributionPolicies(teamGrade.value.id)
  const policies = res.data.data ?? res.data

  rules.value = gradeOptions.value.map(g => {
    const policy = policies.find(p => p.memberGradeId === g.gradeId)
    return {
      policyId: policy?.policyId ?? null,
      gradeId: g.gradeId,
      gradeName: g.gradeName,
      minRatio: policy?.minRatio ?? null,
      maxRatio: policy?.maxRatio ?? null,
    }
  })
}

/* =========================
 * 4. 사원 개인등급 현황 조회 (핵심)
 * ========================= */
const employees = ref([])

const loadEmployees = async () => {
  if (!currentCycle.value) return

  const res = await fetchEmployeeGradeStatusList(
    currentCycle.value.cycleId
  )

  employees.value = res.data.data.map(e => ({
    empId: e.empId,
    name: e.employeeName,
    employeeNo: e.employeeNo,
    individualGradeId: e.individualGradeId,
    gradeId: e.gradeId,
    gradeName: e.gradeName,
    gradeReason: e.gradeReason,
    gradeStatus: e.gradeStatus,
  }))
}



/* =========================
 * 5. 검색 / 필터
 * ========================= */
const searchKeyword = ref('')
const statusFilter = ref('')
const gradeFilter = ref('')

const filteredEmployees = computed(() =>
  employees.value.filter(e => {
    const name = e.name ?? ''

    const matchName =
      !searchKeyword.value || name.includes(searchKeyword.value)

    const matchStatus =
      statusFilter.value === 'NONE'
        ? !e.gradeStatus
        : !statusFilter.value || e.gradeStatus === statusFilter.value

    const matchGrade =
      !gradeFilter.value || e.gradeName === gradeFilter.value

    return matchName && matchStatus && matchGrade
  })
)


/* =========================
 * 6. 현황 계산
 * ========================= */
const gradeCount = (gradeName) =>
  employees.value.filter(e => e.gradeName === gradeName).length

const assignedCount = computed(() =>
  employees.value.filter(e => !!e.individualGradeId).length
)

const submittedCount = computed(() =>
  employees.value.filter(e =>
    ['SUBMITTED', 'CONFIRMED'].includes(e.gradeStatus)
  ).length
)

/* =========================
 * 7. 배분 규칙 위반 검사
 * ========================= */
const violation = (emp) => {
  if (!emp.gradeName) return ''

  const rule = rules.value.find(r => r.gradeName === emp.gradeName)
  if (!rule || rule.maxRatio == null) return ''

  const teamSize = employees.value.length
  const maxAllowed = Math.floor(teamSize * rule.maxRatio / 100)

  const others = employees.value.filter(
    e => e.gradeName === emp.gradeName && e.empId !== emp.empId
  ).length

  return others + 1 > maxAllowed
    ? `${emp.gradeName} 등급은 최대 ${maxAllowed}명`
    : ''
}

/* =========================
 * 8. 상태 표시
 * ========================= */
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

/* =========================
 * 9. 모달 제어
 * ========================= */
const showAssignModal = ref(false)
const showDetailModal = ref(false)
const selectedEmp = ref(null)

const openAssign = (emp) => {
  selectedEmp.value = emp
  showAssignModal.value = true
}

const closeAssign = () => {
  showAssignModal.value = false
  selectedEmp.value = null
}

const openDetail = (emp) => {
  selectedEmp.value = emp
  showDetailModal.value = true
}

const closeDetail = () => {
  showDetailModal.value = false
  selectedEmp.value = null
}

/* =========================
 * 10. 저장 / 제출 / 삭제
 * ========================= */
const applySaved = async ({ empId, gradeId, gradeReason }) => {
  if (selectedEmp.value?.individualGradeId) {
    // 수정
    await updateIndividualGrade(
      selectedEmp.value.individualGradeId,
      { gradeId, gradeReason }
    )
  } else {
    // 신규
    await assignIndividualGrade({
      cycleId: currentCycle.value.cycleId,
      empId,
      gradeId,
      gradeReason,
    })
  }

  await loadEmployees()
}

const applySubmitted = async ({ empId, gradeId, gradeReason }) => {
  await assignIndividualGrade({
    cycleId: currentCycle.value.cycleId,
    empId,
    gradeId,
    gradeReason,
  })

  const emp = employees.value.find(e => e.empId === empId)
  if (!emp?.individualGradeId) return

  const msg = violation(emp)
  if (msg) return alert(msg)

  await submitIndividualGrade(emp.individualGradeId)
  await loadEmployees()
}


const submitRow = async (emp) => {
  const msg = violation(emp)
  if (msg) return alert(msg)

  await submitIndividualGrade(emp.individualGradeId)
  await loadEmployees()
}

const remove = async (emp) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await deleteIndividualGrade(emp.individualGradeId)
  await loadEmployees()
}

/* =========================
 * 11. 초기 로딩
 * ========================= */
onMounted(async () => {
  await loadCurrentCycle()

  if (!currentCycle.value) {
    alert('진행 중인 평가 회차가 없습니다.')
    return
  }

  await loadMyDeptGrade()
  await loadCompanyGrades()
  await loadDistributionPolicies()
  await loadEmployees()
})
</script>


<style scoped>
.page {
  padding: 24px;
  background: #f9fafb;
}

/* ===== Summary ===== */
.summary {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-left,
.summary-right {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sub {
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
}

.pill.in-progress {
  background: #ecfeff;
  color: #0369a1;
}

.meta-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.meta {
  padding: 12px;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid #eef2f7;
}

.meta-label {
  font-size: 11px;
  color: #6b7280;
}

.meta-value {
  display: block;
  margin-top: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.badge-grade {
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
}

/* ===== Rules ===== */
.rule-card {
  height: 100%;
}

.rule-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.rule-title {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.rule-hint {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.rule-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.rule-pill {
  border: 1px solid #eef2f7;
  background: #f9fafb;
  padding: 12px;
  border-radius: 14px;
  display: grid;
  gap: 4px;
}

.rule-grade {
  font-size: 12px;
  font-weight: 800;
  color: #4338ca;
}

.rule-limit {
  font-size: 12px;
  color: #111827;
  font-weight: 600;
}

.rule-count {
  font-size: 11px;
  color: #6b7280;
}

/* ===== Card ===== */
.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.card-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.card-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.search {
  flex: 1;
  min-width: 280px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  background: #ffffff;
}
.select {
  width: 160px;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  background: #ffffff;
  flex-shrink: 0;
}

.search:focus,
.select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.14);
}

/* ===== Table ===== */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  text-align: left;
  color: #6b7280;
  font-weight: 600;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.table td {
  padding: 14px 0;
  border-bottom: 1px solid #eef2f7;
  vertical-align: middle;
}

.row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.row:hover {
  background: #f8fafc;
}

.emp {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.emp-name {
  font-weight: 700;
  color: #111827;
}

.emp-sub {
  font-size: 11px;
  color: #6b7280;
}

.grade-badge {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 700;
}

.reason-cell {
  max-width: 320px;
}

.reason-preview {
  display: inline-block;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== Status ===== */
.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
}

.status.none {
  background: #f3f4f6;
  color: #6b7280;
}

.status.draft {
  background: #fff7ed;
  color: #c2410c;
}

.status.submitted {
  background: #eff6ff;
  color: #1d4ed8;
}

.status.confirmed {
  background: #ecfdf5;
  color: #047857;
}

/* ===== Validation ===== */
.ok {
  color: #059669;
  font-size: 12px;
  font-weight: 700;
}

.warn {
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
}

/* ===== Actions ===== */
.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
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

.btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.muted {
  color: #9ca3af;
}

.empty-row {
  text-align: center;
  padding: 18px 0;
  color: #9ca3af;
}
</style>
