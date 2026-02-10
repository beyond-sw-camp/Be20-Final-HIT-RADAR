<template>
  <section class="cycle-page">
    <h2 class="page-title">평가 회차 관리</h2>

    <!-- ================== 회차 등록 ================== -->
    <BaseCard>
      <h4 class="section-title">회차 등록</h4>

      <div class="form">
        <div class="field-row">
          <div class="field">
            <label>분기</label>
            <select v-model="form.quarter" class="select">
              <option value="Q1">1분기</option>
              <option value="Q2">2분기</option>
              <option value="Q3">3분기</option>
              <option value="Q4">4분기</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>회차명</label>
          <input v-model="form.cycleName" placeholder="예: 2026 상반기 평가" />
        </div>

        <div class="field-row">
          <div class="field">
            <label>시작일</label>
            <input type="datetime-local" v-model="form.startDate" />
          </div>

          <div class="field">
            <label>종료일</label>
            <input type="datetime-local" v-model="form.endDate" />
          </div>
        </div>

        <div class="actions">
          <button class="btn-primary" @click="submit">회차 생성</button>
        </div>
      </div>
    </BaseCard>

    <!-- ================== 필터 ================== -->
    <div class="filter-bar">
      <input v-model="filters.keyword" placeholder="회차명 검색" />

      <select v-model="filters.year">
        <option value="">전체 연도</option>
        <option v-for="y in yearOptions" :key="y" :value="y">
          {{ y }}
        </option>
      </select>

      <select v-model="filters.status">
        <option value="">전체 상태</option>
        <option value="DRAFT">작성 중</option>
        <option value="IN_PROGRESS">진행 중</option>
        <option value="CLOSED">종료</option>
        <option value="APPROVED">확정</option>
      </select>
    </div>

    <!-- ================== 회차 목록 ================== -->
    <BaseCard class="mt">
      <h4 class="section-title">회차 목록</h4>

      <table class="table" v-if="filteredCycles.length">
        <thead>
        <tr>
          <th>회차명</th>
          <th>기간</th>
          <th>상태</th>
          <th>담당자</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="cycle in filteredCycles" :key="cycle.cycleId"
            class="row-click"
            @click="router.push(`/cycles/${cycle.cycleId}`)">
          <td class="cycle-name">{{ cycle.cycleName }}</td>
          <td>
            {{ formatDate(cycle.startDate) }} ~
            {{ formatDate(cycle.endDate) }}
          </td>
          <td>
              <span class="badge" :class="statusClass(cycle.status)">
                {{ statusLabel(cycle.status) }}
              </span>
          </td>
          <td>{{ cycle.empId }}</td>
        </tr>
        </tbody>
      </table>

      <p v-else class="hint">조건에 맞는 회차가 없습니다.</p>
    </BaseCard>

    <div v-if="toast.show" class="toast">
      {{ toast.message }}
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { createCycle, fetchCycles } from '@/api/cycleApi'
import router from '@/router/index.js'

const cycles = ref([])

const form = ref({
  quarter: 'Q1',
  cycleName: '',
  startDate: '',
  endDate: '',
})

const filters = ref({
  keyword: '',
  year: '',
  status: '',
})

const toast = ref({
  show: false,
  message: '',
})

const showToast = (msg) => {
  toast.value.message = msg
  toast.value.show = true
  setTimeout(() => (toast.value.show = false), 2500)
}

const formatDate = (dateTime) => {
  return dateTime.replace('T', ' ').slice(0, 16)
}

const loadCycles = async () => {
  const res = await fetchCycles()
  cycles.value = res.data
}

const validate = () => {
  const { cycleName, startDate, endDate } = form.value
  if (!cycleName) return '회차명을 입력하세요'
  if (!startDate || !endDate) return '기간을 입력하세요'
  if (startDate > endDate) return '시작일은 종료일보다 늦을 수 없습니다'
  return null
}

const submit = async () => {
  const error = validate()
  if (error) {
    showToast(error)
    return
  }

  const year = form.value.startDate.slice(0, 4)

  await createCycle({
    ...form.value,
    year,
    startDate: form.value.startDate + ':00',
    endDate: form.value.endDate + ':00',
  })

  showToast('회차가 생성되었습니다')

  form.value = {
    quarter: 'Q1',
    cycleName: '',
    startDate: '',
    endDate: '',
  }

  loadCycles()
}

const statusLabel = (status) => {
  switch (status) {
    case 'DRAFT': return '작성 중'
    case 'IN_PROGRESS': return '진행 중'
    case 'CLOSED': return '종료'
    case 'APPROVED': return '확정'
    default: return status
  }
}

const statusClass = (status) => {
  switch (status) {
    case 'DRAFT': return 'draft'
    case 'IN_PROGRESS': return 'in-progress'
    case 'CLOSED': return 'closed'
    case 'APPROVED': return 'approved'
    default: return ''
  }
}

const yearOptions = computed(() => {
  const years = cycles.value.map(c => c.startDate.slice(0, 4))
  return [...new Set(years)].sort()
})

const filteredCycles = computed(() => {
  return cycles.value.filter(cycle => {
    const matchKeyword =
      !filters.value.keyword ||
      cycle.cycleName.includes(filters.value.keyword)

    const matchYear =
      !filters.value.year ||
      cycle.startDate.startsWith(filters.value.year)

    const matchStatus =
      !filters.value.status ||
      cycle.status === filters.value.status

    return matchKeyword && matchYear && matchStatus
  })
})

onMounted(loadCycles)
</script>

<style scoped>


.page-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  /*max-width: 1100px;*/
  margin: 15px auto;
  padding: 0 clamp(12px, 3vw, 24px);
}

.form {
  /*max-width: 1100px;*/
  margin: 0 auto 12px;
  padding: 0 clamp(12px, 3vw, 24px);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
}

input,
select {
  height: 34px;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.btn-primary {
  background: #4f46e5;
  color: white;
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.filter-bar {
 /* max-width: 1100px;*/
  margin: 16px auto 12px;
  padding: 12px;
  display: flex;
  gap: 8px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.table {
  /*max-width: 1100px;*/
  width: 95%;
  margin: 0 auto 12px;
  border-collapse: collapse;
}

.table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.table th,
.table td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.table tbody tr:hover {
  background: #f3f4f6;
}

.cycle-name {
  font-weight: 600;
  color: #111827;
}

.badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badge.draft {
  background: #f3f4f6;
  color: #374151;
}

.badge.in-progress {
  background: #e0f2fe;
  color: #0369a1;
}

.badge.closed {
  background: #fee2e2;
  color: #991b1b;
}

.badge.approved {
  background: #e0e7ff;
  color: #3730a3;
}

.mt {
  margin-top: 20px;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: white;
  padding: 12px 20px;
  border-radius: 14px;
}

.hint {
  text-align: center;
  padding: 24px;
  color: #6b7280;
  font-size: 13px;
}
</style>
