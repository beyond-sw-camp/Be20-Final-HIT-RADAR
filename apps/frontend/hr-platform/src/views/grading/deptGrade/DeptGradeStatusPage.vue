<template>
  <section class="dept-grade-page">

    <!-- ===== Cycle Card ===== -->
    <div class="cycle-card" v-if="currentCycle">
      <div class="cycle-left">
        <h2 class="cycle-title">{{ currentCycle.cycleName }}</h2>
        <p class="cycle-period">
          {{ formatDate(currentCycle.startDate) }} ~ {{ formatDate(currentCycle.endDate) }}
        </p>
      </div>

      <span class="pill in-progress">IN PROGRESS</span>
    </div>

    <div v-else class="empty">
      진행 중인 평가 회차가 없습니다.
    </div>

    <!-- ===== Dept Grade Table Card ===== -->
    <div class="grade-card" v-if="deptGrades.length">
      <h4 class="section-title">부서 등급 부여 현황</h4>
      <!-- ===== Filter Bar ===== -->
      <div class="filter-bar">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="부서명 검색"
          class="search-input"
        />

        <select v-model="statusFilter" class="status-select">
          <option value="">전체 상태</option>
          <option value="NONE">미부여</option>
          <option value="DRAFT">작성 중</option>
          <option value="SUBMITTED">제출됨</option>
          <option value="CONFIRMED">확정</option>
        </select>
      </div>
      <table class="grade-table">
        <thead>
        <tr>
          <th>부서</th>
          <th>등급</th>
          <th>부여 사유</th>
          <th>상태</th>
          <th></th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="dept in filteredDeptGrades" :key="dept.departmentId">
          <td class="dept-name">{{ dept.departmentName }}</td>
          <td>
            <span v-if="dept.gradeName" class="grade-pill">
              {{ dept.gradeName }}
            </span>
            <span v-else class="muted">미부여</span>
          </td>

          <td class="reason">
            {{ dept.gradeReason || '-' }}
          </td>

          <td>
            <span
              class="status-pill"
              :class="statusClass(dept.gradeStatus)"
            >
              {{ statusText(dept.gradeStatus) }}
            </span>
          </td>

          <td class="actions">
            <button
              v-if="!dept.deptGradeId"
              class="btn primary"
              @click="openAssignModal(dept)"
            >
              등급 부여
            </button>

            <template v-else-if="!dept.gradeStatus || dept.gradeStatus === 'DRAFT'">
              <button class="btn ghost" @click="openEditModal(dept)">수정</button>
              <button class="btn danger" @click="removeDeptGrade(dept.deptGradeId)">삭제</button>
              <button class="btn primary" @click="submitDeptGrade(dept.deptGradeId)">제출</button>
            </template>

            <span v-else class="muted">-</span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

  </section>

  <DeptGradeAssignModal
    v-if="showModal"
    :department="selectedDept"
    :deptGrade="editTarget"
    :cycleId="currentCycle.cycleId"
    :companyId="Number(auth.user.companyId)"
    @close="showModal = false"
    @success="loadDeptGrades"
  />

</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchCycles } from '@/api/cycleApi.js'
import {
  fetchDeptGradeStatusList,
  deleteDeptGrade,
  submitDeptGrade as submitDeptGradeApi,
} from '@/api/DeptGradeApi.js'

import DeptGradeAssignModal from '@/views/grading/deptGrade/DeptGradeAssignModal.vue'
import { useAuthStore } from '@/stores/authStore.js'

const auth = useAuthStore()
const searchKeyword = ref('')
const statusFilter = ref('')

const filteredDeptGrades = computed(() => {
  return deptGrades.value.filter(dept => {
    const matchName =
      !searchKeyword.value ||
      dept.departmentName.includes(searchKeyword.value)

    let matchStatus = true
    if (statusFilter.value === 'NONE') {
      matchStatus = !dept.gradeStatus
    } else if (statusFilter.value) {
      matchStatus = dept.gradeStatus === statusFilter.value
    }

    return matchName && matchStatus
  })
})

/* ===== Modal State ===== */
const showModal = ref(false)
const selectedDept = ref(null)
const editTarget = ref(null)

/* ===== Page State ===== */
const currentCycle = ref(null)
const deptGrades = ref([])

/* ===== Modal Open ===== */
const openAssignModal = (dept) => {
  selectedDept.value = dept
  editTarget.value = null
  showModal.value = true
}

const openEditModal = (dept) => {
  selectedDept.value = dept
  editTarget.value = dept
  showModal.value = true
}

/* ===== Load ===== */
onMounted(async () => {
  await loadCurrentCycle()
  if (currentCycle.value) {
    await loadDeptGrades()
  }
})

const loadCurrentCycle = async () => {
  const res = await fetchCycles()
  const cycles = res.data
  currentCycle.value = cycles.find(
    c => c.status === 'IN_PROGRESS' || c.status === 'IN PROGRESS'
  )
}

const loadDeptGrades = async () => {
  const res = await fetchDeptGradeStatusList(currentCycle.value.cycleId)
  deptGrades.value = res.data.data ?? res.data
}

/* ===== Actions ===== */
const removeDeptGrade = async (deptGradeId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return
  await deleteDeptGrade(deptGradeId)
  await loadDeptGrades()
}

const submitDeptGrade = async (deptGradeId) => {
  if (!confirm('제출 후에는 수정이 제한됩니다. 제출하시겠습니까?')) return
  await submitDeptGradeApi(deptGradeId)
  await loadDeptGrades()
}

/* ===== UI Utils ===== */
const statusText = (status) => {
  if (!status) return '미부여'
  return {
    DRAFT: '작성 중',
    SUBMITTED: '제출됨',
    CONFIRMED: '확정',
  }[status]
}

const statusClass = (status) => ({
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  CONFIRMED: 'confirmed',
}[status])

const formatDate = (date) => new Date(date).toLocaleDateString()
</script>


<style scoped>
.dept-grade-page {
  padding: 24px;
}

/* ===== Cycle Card ===== */
.cycle-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cycle-title {
  font-size: 18px;
  font-weight: 600;
}

.cycle-period {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.pill {
  padding: 6px 14px;
  font-size: 11px;
  border-radius: 999px;
  font-weight: 500;
}

.pill.in-progress {
  background: #ecfeff;
  color: #0369a1;
}

/* ===== Card ===== */
.grade-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
}

/* ===== Table ===== */
.grade-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.grade-table th {
  text-align: left;
  color: #6b7280;
  font-weight: 500;
  padding-bottom: 12px;
}

.grade-table td {
  padding: 14px 0;
  border-bottom: 1px solid #e5e7eb;
}

.dept-name {
  font-weight: 500;
}

.grade-pill {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
}

.reason {
  max-width: 360px;
  color: #374151;
}

/* ===== Status ===== */
.status-pill {
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

/* ===== Buttons ===== */
.actions {
  display: flex;
  gap: 6px;
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
  color: white;
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

.muted {
  color: #9ca3af;
  font-size: 12px;
}

/* ===== Filter Bar ===== */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.status-select {
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  background: #ffffff;
}

</style>
