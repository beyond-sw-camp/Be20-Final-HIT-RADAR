<template>
  <section class="page">
    <!-- ===== Back ===== -->
    <button class="back-btn" @click="goBack">
      <span class="icon">←</span>
      <span class="text">평가 배정 관리</span>
    </button>

    <!-- ===== Title ===== -->
    <div class="section-title">
      <div>
        <h1>평가 배정 상태</h1>
        <div class="sub">
          부서별 평가 배정 상태 및 평가자 · 피평가자 연결 구조를 확인합니다.
        </div>
      </div>
    </div>

    <div class="layout">
      <!-- ================= LEFT ================= -->
      <aside class="dept-panel">
        <div class="dept-title">부서</div>

        <ul class="dept-list">
          <li
            v-for="d in departments"
            :key="d.deptId"
            :class="{ active: selectedDepartmentId === d.deptId }"
            @click="selectDepartment(d.deptId)"
          >
            {{ d.deptName }}
            <span class="count">
              {{ deptAssignmentsCount(d.deptId) }}
            </span>
          </li>
        </ul>
      </aside>

      <!-- ================= RIGHT ================= -->
      <section class="content-panel">
        <div v-if="!selectedDepartmentId" class="empty-state">
          <div class="emoji">📊</div>
          <div class="text">
            왼쪽에서 부서를 선택하면<br />
            평가 배정 현황을 확인할 수 있어요
          </div>
        </div>

        <template v-else>
          <!-- ===== Header ===== -->
          <div class="content-header">
            <h2>{{ selectedDeptName }} 평가 배정 현황</h2>

            <div class="summary">
              <span class="chip done">
                배정 완료 {{ assignedCount }}
              </span>
              <span class="chip pending">
                미배정 {{ unassignedCount }}
              </span>
            </div>
          </div>

          <!-- ===== Cards ===== -->
          <div class="assignment-grid">
            <div
              v-for="emp in employees"
              :key="emp.empId"
              class="assignment-card"
              :class="{ unassigned: !hasAssignment(emp.empId) }"
            >
              <div class="employee">
                <div class="name">{{ emp.name }}</div>
                <div class="meta">{{ emp.positionName }}</div>
              </div>

              <div v-if="hasAssignment(emp.empId)" class="assignment-detail">
                <div
                  v-for="a in assignmentsByEvaluator(emp.empId)"
                  :key="`${a.evalTypeId}-${a.evaluateeId}`"
                  class="relation"
                >
                  <div class="type">{{ a.evalTypeName }}</div>

                  <div class="arrow">
                    {{ emp.name }}
                    <span>→</span>
                    {{ a.evaluateeName }}
                  </div>
                </div>
              </div>

              <div v-else class="no-assignment">
                이 평가자는 아직 배정된 평가가 없습니다.
              </div>
            </div>
          </div>
        </template>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import {
  getAllDepartmentsByCompany,
  getDepartmentMembers,
} from '@/api/departmentApi'
import { fetchDeptEvaluationAssignmentDetails } from '@/api/evaluationAssignmentApi'

/* ================= router ================= */
const router = useRouter()
const goBack = () => router.back()

/* ================= state ================= */
const departments = ref([])
const employees = ref([])
const assignments = ref([])

const selectedDepartmentId = ref(null)

/* ================= init ================= */
const deptCounts = ref({})

/* ================= init ================= */
const loadDepartments = async () => {
  const res = await getAllDepartmentsByCompany()
  departments.value = res.data.data.departments

  // Load counts for all departments
  // Note: inefficient for many departments, but necessary as per requirement without backend support
  const promises = departments.value.map(async (d) => {
    try {
      const res = await fetchDeptEvaluationAssignmentDetails(d.deptId)
      const list = res.data.data ?? []
      // Filter for valid assignments (evaluator + evaluatee)
      const validCount = list.filter(a => a.evaluatorId && a.evaluateeId).length
      deptCounts.value[d.deptId] = validCount
    } catch (e) {
      console.error(e)
      deptCounts.value[d.deptId] = 0
    }
  })
  await Promise.all(promises)
}
loadDepartments()

/* ================= handlers ================= */
const selectDepartment = async (deptId) => {
  selectedDepartmentId.value = deptId
  // Reset lists
  employees.value = []
  assignments.value = []

  const [empRes, assignRes] = await Promise.all([
    getDepartmentMembers(deptId),
    fetchDeptEvaluationAssignmentDetails(deptId),
  ])

  employees.value = empRes.data.data.employees
  assignments.value = assignRes.data.data ?? []
  
  // Update count for selected dept to ensure accuracy
  const validCount = assignments.value.filter(a => a.evaluatorId && a.evaluateeId).length
  deptCounts.value[deptId] = validCount
}

/* ================= computed ================= */
const selectedDeptName = computed(() => {
  const d = departments.value.find(d => d.deptId === selectedDepartmentId.value)
  return d?.deptName ?? ''
})

const realAssignments = computed(() =>
  assignments.value.filter(a => a.evaluatorId && a.evaluateeId)
)

const hasAssignment = (empId) =>
  realAssignments.value.some(a => a.evaluatorId === empId)

const assignmentsByEvaluator = (empId) =>
  realAssignments.value.filter(a => a.evaluatorId === empId)

const assignedCount = computed(() =>
  employees.value.filter(e => hasAssignment(e.empId)).length
)

const unassignedCount = computed(() =>
  employees.value.length - assignedCount.value
)

// Now uses the pre-fetched state
const deptAssignmentsCount = (deptId) => deptCounts.value[deptId] ?? 0
</script>


<style scoped>
/* =========================
  Base Layout
========================= */
.page{
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 18px 48px;
}
.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-title h1 {
  font-size: 20px;
  font-weight: 700;
}

/* =========================
  Layout
========================= */
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
}

/* =========================
  Left : Department Panel
========================= */
.dept-panel {
  background: #3a69d6;
  color: #e5e7eb;
  border-radius: 20px;
  padding: 24px 20px;
}

.dept-title {
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 16px;
  color: #ffffff;
}

.dept-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dept-list li {
  padding: 12px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: 0.15s ease;
}

.dept-list li:not(.active):hover {
  background: rgba(255, 255, 255, 0.06);
}

.dept-list li.active {
  background: rgba(255, 255, 255, 0.42);
  color: white;
}

.count {
  font-size: 11px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 10px;
  border-radius: 999px;
}

/* =========================
  Right : Content Panel
========================= */
.content-panel {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

/* =========================
  Empty State
========================= */
.empty-state {
  padding: 120px 0;
  text-align: center;
  color: #9ca3af;
}

.empty-state .emoji {
  font-size: 42px;
  margin-bottom: 16px;
}

.empty-state .text {
  font-size: 14px;
  line-height: 1.6;
}

/* =========================
  Header + Summary
========================= */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.content-header h2 {
  font-size: 22px;
  font-weight: 900;
}

.summary {
  display: flex;
  gap: 10px;
}

.chip {
  font-size: 12px;
  font-weight: 800;
  padding: 6px 14px;
  border-radius: 999px;
}

.chip.done {
  background: #dcfce7;
  color: #166534;
}

.chip.pending {
  background: #fef3c7;
  color: #92400e;
}

/* =========================
  Assignment Grid
========================= */
.assignment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* =========================
  Assignment Card
========================= */
.assignment-card {
  background: #f9fafb;
  border-radius: 20px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  transition: 0.2s ease;
}

.assignment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
}

.assignment-card:not(.unassigned) {
  border-left: 6px solid #6366f1;
}

.assignment-card.unassigned {
  opacity: 0.55;
}

/* =========================
  Employee Header
========================= */
.employee {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e5e7eb;
}

.employee .name {
  font-size: 16px;
  font-weight: 900;
}

.employee .meta {
  font-size: 12px;
  color: #64748b;
}

/* =========================
  Status Badge
========================= */
.status {
  font-size: 11px;
  font-weight: 900;
  padding: 5px 12px;
  border-radius: 999px;
}

.status.done {
  background: #22c55e;
  color: white;
}

.status.pending {
  background: #e5e7eb;
  color: #374151;
}

/* =========================
  Assignment Detail
========================= */
.assignment-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 6px;
}

.assignment-detail::-webkit-scrollbar {
  width: 5px;
}
.assignment-detail::-webkit-scrollbar-track {
  background: transparent;
}
.assignment-detail::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
.assignment-detail::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}

/* =========================
  Relation Card
========================= */
.relation {
  background: white;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* =========================
  Eval Type Badge
========================= */
.type {
  display: inline-block;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  align-self: flex-start;
}

/* =========================
  Arrow (Evaluator → Evaluatee)
========================= */
.arrow {
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.arrow span {
  color: #6366f1;
  font-weight: 900;
}

/* =========================
  Assignment Status
========================= */
.assign-status {
  font-size: 12px;
  font-weight: 800;
}

.assign-status.pending {
  color: #f59e0b;
}

.assign-status.submitted {
  color: #16a34a;
}

.assign-status.none {
  color: #9ca3af;
  font-style: italic;
}

/* =========================
  No Assignment
========================= */
.no-assignment {
  margin-top: 12px;
  padding: 14px;
  background: #f1f5f9;
  border-radius: 14px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;

  padding: 8px 14px;
  border-radius: 999px;

  background: #f1f5f9;
  color: #334155;

  font-size: 13px;
  font-weight: 800;
  cursor: pointer;

  border: none;
  transition: all 0.15s ease;
}

.back-btn:hover {
  background: #e0e7ff;
  color: #4338ca;
  transform: translateX(-2px);
}

.back-btn .icon {
  font-size: 16px;
  font-weight: 900;
}


</style>


