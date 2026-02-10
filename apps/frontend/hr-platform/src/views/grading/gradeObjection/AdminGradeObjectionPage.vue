<template>
  <section class="page">
    <div class="header">
      <h2 class="title">이의제기 관리</h2>
      <p class="sub">
        평가 회차별로 부서 사원들의 개인 등급 이의제기를 검토하고 처리합니다.
      </p>
    </div>

    <div class="card">
      <h4 class="card-title">평가 회차 선택</h4>
      <select v-model="selectedCycleId" @change="loadAllData">
        <option value="">회차를 선택하세요</option>
        <option
          v-for="cycle in cycles"
          :key="cycle.cycleId"
          :value="cycle.cycleId"
        >
          {{ cycle.cycleName }}
        </option>
      </select>
    </div>

    <div class="card" v-if="selectedCycleId">
      <h4 class="card-title">이의제기 목록</h4>

      <table class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>사원</th>
          <th>개인 등급</th>
          <th>등급 부여 사유</th>
          <th>이의제기 사유</th>
          <th>상태</th>
          <th>처리 결과</th>
          <th></th>
        </tr>
        </thead>

        <tbody>
        <tr
          v-for="obj in objections"
          :key="obj.objectionId"
          class="row-click"
          @click="goDetail(obj.objectionId)"
        >
          <td>{{ obj.objectionId }}</td>
          <td>{{ obj.employeeName }}</td>
          <td>
            <span class="grade-badge">{{ obj.gradeName }}</span>
          </td>
          <td class="reason">{{ obj.gradeReason }}</td>
          <td class="reason">{{ obj.objectionReason }}</td>
          <td>
            <span
              class="status"
              :class="obj.objectionStatus.toLowerCase()"
            >
              {{ statusText(obj.objectionStatus) }}
            </span>
          </td>
          <td>
            <span v-if="obj.objectionResult">{{ obj.objectionResult }}</span>
            <span v-else class="muted">-</span>
          </td>
          <td class="actions">
            <template v-if="obj.objectionStatus === 'REVIEWING'">
              <button
                class="btn approve"
                @click.stop="openApproveModal(obj)"
              >
                승인
              </button>
              <button
                class="btn reject"
                @click.stop="openRejectModal(obj)"
              >
                반려
              </button>
            </template>
            <span v-else class="muted">처리 완료</span>
          </td>
        </tr>

        <tr v-if="!objections.length">
          <td colspan="8" class="empty-row">
            이의제기 내역이 없습니다.
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </section>

  <div v-if="showRejectModal" class="modal-backdrop">
    <div class="modal">
      <h4 class="modal-title">이의제기 반려</h4>
      <textarea
        v-model="rejectReason"
        class="textarea"
        placeholder="반려 사유를 입력하세요"
      />
      <div class="modal-actions">
        <button class="btn ghost" @click="closeRejectModal">취소</button>
        <button class="btn primary" @click="submitReject">반려 처리</button>
      </div>
    </div>
  </div>

  <GradeObjectionApproveModal
    v-if="showApproveModal"
    :employee="selectedEmployee"
    :grades="grades"
    :rules="gradeRules"
    :employees="employees"
    @submit="handleApproveSubmit"
    @close="showApproveModal = false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

import GradeObjectionApproveModal from '@/views/grading/gradeObjection/GradeObjectionApproveModal.vue'

import { fetchCycles } from '@/api/cycleApi.js'
import {
  fetchGradeObjectionsByDepartment,
  acceptGradeObjection,
  rejectGradeObjection,
} from '@/api/gradeObjectionApi.js'
import {
  fetchEmployeeGradeStatusList,
  approveIndividualGradeByObjection,
} from '@/api/individualGradeApi.js'
import { fetchCompanyGrades } from '@/api/gradeApi.js'
import { fetchDistributionPolicies } from '@/api/teamGradeDistributionPolicyApi.js'
import { fetchMyDeptGrade } from '@/api/DeptGradeApi.js'

import { useRouter } from 'vue-router'
const router = useRouter()
const goDetail = (objectionId) => {
  router.push(`/hr/objections/${objectionId}`)
}
const cycles = ref([])
const selectedCycleId = ref('')
const objections = ref([])
const employees = ref([])
const gradeMap = ref(new Map())

const showApproveModal = ref(false)
const selectedEmployee = ref(null)
const selectedObjection = ref(null)

const showRejectModal = ref(false)
const rejectReason = ref('')

const grades = ref([])
const gradeRules = ref([])
const teamGradeId = ref(null)

const loadCycles = async () => {
  const res = await fetchCycles()
  const list = res.data.data ?? res.data

  cycles.value = list

  if (list.length > 0) {
    selectedCycleId.value = list[list.length - 1].cycleId
    await loadAllData()
  }
}

const loadCompanyGrades = async () => {
  const res = await fetchCompanyGrades()
  grades.value = (res.data.data ?? res.data)
    .sort((a, b) => a.gradeOrder - b.gradeOrder)
    .map(g => ({ gradeId: g.gradeId, gradeName: g.gradeName }))
}

const loadDeptGradeRules = async () => {
  const deptRes = await fetchMyDeptGrade()
  teamGradeId.value = deptRes.data.data.gradeId

  const ruleRes = await fetchDistributionPolicies(teamGradeId.value)
  const policies = ruleRes.data.data ?? ruleRes.data

  gradeRules.value = grades.value.map(g => {
    const p = policies.find(r => r.memberGradeId === g.gradeId)
    return {
      gradeId: g.gradeId,
      gradeName: g.gradeName,
      maxRatio: p?.maxRatio ?? null,
    }
  })
}

const loadEmployees = async () => {
  const res = await fetchEmployeeGradeStatusList(selectedCycleId.value)
  employees.value = res.data.data ?? res.data

  gradeMap.value.clear()
  employees.value.forEach(e => {
    if (e.individualGradeId) {
      gradeMap.value.set(e.individualGradeId, e)
    }
  })
}

const loadObjections = async () => {
  const res = await fetchGradeObjectionsByDepartment()
  const raw = res.data.data ?? res.data

  objections.value = raw.map(o => {
    const grade = gradeMap.value.get(o.individualGradeId) || {}
    return {
      ...o,
      gradeName: grade.gradeName ?? '-',
      gradeReason: grade.gradeReason ?? '-',
      employeeName: grade.employeeName ?? '-',
    }
  })
}

const loadAllData = async () => {
  if (!selectedCycleId.value) return
  await loadEmployees()
  await loadObjections()
}

const openApproveModal = (obj) => {
  selectedObjection.value = obj
  selectedEmployee.value = {
    empId: obj.employeeId,
    name: obj.employeeName,
    gradeId: obj.gradeId,
    gradeReason: obj.gradeReason,
    individualGradeId: obj.individualGradeId,
  }
  showApproveModal.value = true
}

const handleApproveSubmit = async ({ gradeId, gradeReason }) => {
  try {
    const individualGradeId = selectedEmployee.value.individualGradeId

    await approveIndividualGradeByObjection(
      individualGradeId,
      { gradeId, gradeReason }
    )

    await acceptGradeObjection(
      selectedObjection.value.objectionId,
      gradeReason
    )

    alert('이의제기가 승인되고 등급이 변경되었습니다.')
    showApproveModal.value = false
    await loadAllData()
  } catch (e) {
    console.error(e)
    alert('처리 중 오류가 발생했습니다.')
  }
}

const openRejectModal = (obj) => {
  selectedObjection.value = obj
  rejectReason.value = ''
  showRejectModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
}

const submitReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('반려 사유를 입력하세요')
    return
  }

  await rejectGradeObjection(
    selectedObjection.value.objectionId,
    rejectReason.value
  )

  alert('반려 처리되었습니다.')
  closeRejectModal()
  await loadObjections()
}

const statusText = (s) => ({
  REVIEWING: '검토 중',
  ACCEPTED: '승인됨',
  REJECTED: '반려됨',
}[s] ?? s)

onMounted(async () => {
  await loadCycles()
  await loadCompanyGrades()
  await loadDeptGradeRules()
})
</script>


<style scoped>
.page {
  padding: 24px;
}

/* ===== Header ===== */
.header {
  margin-bottom: 20px;
  border-radius: 18px;
}

.title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: #111827;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

/* ===== Card ===== */
.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #111827;
}

/* ===== Select ===== */
select {
  width: 280px;
  height: 36px;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
}

/* ===== Table ===== */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.table th {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid #e5e7eb;
  color: #6b7280;
  font-weight: 600;
}

.table td {
  padding: 12px 8px;
  border-bottom: 1px solid #eef2f7;
  vertical-align: top;
}

.reason {
  max-width: 280px;
  line-height: 1.4;
  color: #374151;
}

/* ===== Grade ===== */
.grade-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #eef2ff;
  color: #3730a3;
}

/* ===== Status ===== */
.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.status.reviewing {
  background: #eff6ff;
  color: #1d4ed8;
}

.status.accepted {
  background: #ecfdf5;
  color: #047857;
}

.status.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

/* ===== Actions ===== */
.actions {
  display: flex;
  gap: 8px;
}

/* ===== Buttons ===== */
.btn {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.btn.approve {
  background: #ecfdf5;
  color: #047857;
}

.btn.reject {
  background: #fee2e2;
  color: #b91c1c;
}

.btn.primary {
  background: #4f46e5;
  color: #ffffff;
}

.btn.ghost {
  background: #f3f4f6;
  color: #374151;
}

.btn:hover {
  opacity: 0.9;
}

/* ===== Empty ===== */
.empty-row {
  text-align: center;
  padding: 20px 0;
  color: #9ca3af;
}

.muted {
  color: #9ca3af;
}

/* ===== Modal ===== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  width: 420px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #111827;
}

.textarea {
  width: 100%;
  min-height: 100px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 10px;
  font-size: 13px;
  resize: none;
}

.textarea:focus {
  outline: none;
  border-color: #6366f1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
.row-click {
  cursor: pointer;
  transition: background 0.15s ease;
}

.row-click:hover {
  background: #f8fafc;
}

</style>
