<script setup>
import { useRouter } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'
import { fetchCompensationSalaries, fetchCompensationSalarySummary } from '@/api/salaryApi.js'
import {
  APPROVAL_OPTIONS,
  COMPENSATION_OPTIONS,
  formatComma,
  getDateFormatter,
  getLabel,
  getToday,
  getYear,
} from '@/views/salary/js/common.js'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'
const submitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const currentYear = getYear()
const year = ref(getYear())
const years = ref([])

const compensation = ref([])
const compensationSummary = reactive({
  totalBonus: '',
  totalIncentive: '',
  totalPerformance: '',
  totalAllowance: '',
  totalCompensation: '',
  totalAmount: '',
  startDate: '',
  endDate: '',
})
const goCompensationCreate = () => {
  // router.push({ path:'/all/salary/compensation/create'})

  router.push({
    path: '/all/salary/create',
    query: {
      type: 'compensation',
      year : year.value,
    },
  })
}

// 검색
const searchSalaries = async () => {
  submitting.value = true

  let payload = {
    year: year.value,
  }

  try {
    const result = await fetchCompensationSalaries(payload)
    const data = result.data

    if (data.success) {
      // 저장
      compensation.value = data.data.salaryApprovals
    }
  } catch (e) {
    errorMessage.value = e.message || '기본급 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// fetchCompensationSalarySummary
// 변동 보상 요약
const getCompensationSummary = async () => {
  submitting.value = true

  let payload = {
    endDate: getToday(),
  }

  try {
    const result = await fetchCompensationSalarySummary(payload)
    const data = result.data

    if (data.success) {
      // 저장
      let salary = data.data.compensationSalary

      compensationSummary.totalBonus = salary.totalBonus
      compensationSummary.totalIncentive = salary.totalIncentive
      compensationSummary.totalPerformance = salary.totalPerformance
      compensationSummary.totalAllowance = salary.totalAllowance
      compensationSummary.totalCompensation = salary.totalCompensation
      compensationSummary.totalAmount = salary.totalAmount
      compensationSummary.startDate = getDateFormatter(data.data.startDate)
      compensationSummary.endDate = getDateFormatter(data.data.endDate)
    }
  } catch (e) {
    errorMessage.value = e.message || '기본급 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}
watch(year, () => {
  searchSalaries()
})
onMounted(() => {
  searchSalaries()
  getCompensationSummary()
  years.value = YEAR_OPTIONS()
})

const goDetailPage = (docId) => {
  router.push(`/all/salary/compensation/employee/${docId}`)
}
</script>

<template>
  <div class="sub"><strong>변동보상 조회</strong></div>
  <div class="search">

  </div>
  <div class="card">
    <div class="dashboard-box">
      <div class="dashboard-box-header">
        <div class="dashboard-box-title">
          <span class="title">{{ year }}년 변동보상 관리</span>
          <span class="sub-title">
            {{ year + "년 01월 01일" }} ~ {{  currentYear === year ? compensationSummary.endDate : year + "년12월31일" }}</span
          >
        </div>
        <div class="dashboard-select-box">
          <select class="select" v-model="year">
            <option v-for="item in years" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
          <button class="btn primary"
                  @click="goCompensationCreate()"
          >
            등록하기
          </button>
        </div>
      </div>

      <div class="dashboard-box-body">
        <div class="amount-box">
          <span class="title">총 금액</span>
          <span class="content-font">{{
            formatComma(
              compensationSummary.totalBonus +
                compensationSummary.totalIncentive +
                compensationSummary.totalPerformance +
                compensationSummary.totalAllowance,
              '원',
            )
          }}</span>
        </div>
        <div class="compensation-box">
          <span class="title">총 상여금</span>
          <span class="content-font">{{ formatComma(compensationSummary.totalBonus, '원') }}</span>
        </div>
        <div class="compensation-box">
          <span class="title">총 인센티브</span>
          <span class="content-font">{{
            formatComma(compensationSummary.totalIncentive, '원')
          }}</span>
        </div>
        <div class="compensation-box">
          <span class="title">총 성과금</span>
          <span class="content-font">{{
            formatComma(compensationSummary.totalPerformance, '원')
          }}</span>
        </div>
        <div class="compensation-box">
          <span class="title">기타수당</span>
          <span class="content-font">{{
            formatComma(compensationSummary.totalAllowance, '원')
          }}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="card">
    <div class="card-bd">
      <div class="content-empty-state" v-if="!compensation || compensation.length === 0">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width: 10%">일자</th>
            <th style="width: 10%">변동보상유형</th>
            <th style="width: 20%">제목</th>
            <th style="width: 10%">총금액</th>
            <th style="width: 10%">인원</th>
            <th style="width: 10%">결재여부</th>
            <th style="width: 10%">비고</th>
            <th style="width: 10%">결재일</th>
            <th style="width: 10%">담당자</th>
          </tr>
          </thead>
        </table>
        <div class="empty-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>등록된 변동보상이 없습니다.</p>
        </div>
      </div>

      <div class="table-scroll-container" v-else>
        <table class="table">
        <thead class="tbl-hd">
          <tr>
            <th style="width: 10%">일자</th>
            <th style="width: 10%">변동보상유형</th>
            <th style="width: 20%">제목</th>
            <th style="width: 10%">총금액</th>
            <th style="width: 10%">인원</th>
            <th style="width: 10%">결재여부</th>
            <th style="width: 10%">비고</th>
            <th style="width: 10%">결재일</th>
            <th style="width: 10%">담당자</th>
          </tr>
        </thead>
        <tbody class="tbl-bd">
          <tr v-for="item in compensation"
              :key="item.docId"
              @click="goDetailPage(item.docId)"
          >
            <td>{{ item.year }}</td>
            <td>
              <span v-for="type in COMPENSATION_OPTIONS" :key="type.value">
                <template v-if="type.value === item.compensationType">
                  {{ type.label }}
                </template>
              </span>
            </td>
            <td >{{ item.title }}</td>
            <td>{{ formatComma(item.totalSalary) }}</td>
            <td>{{ item.empCount }}</td>
            <td>
              <span :class="['status-badge', item.approvalStatus]">
                {{ getLabel(APPROVAL_OPTIONS, item.approvalStatus) }}
              </span>
            </td>
            <td>{{ item.remark }}</td>
            <td>{{ item.approvedAt }}</td>
            <td>{{ item.writer }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/views/salary/style/salary.css';
@import '@/views/salary/style/badge.css';
.card {
  margin-top: 10px;
  padding: 20px;
}

.search {
  display: flex;
  justify-content: end;
  align-items: center;
  padding-bottom: 10px;
}

.search select {
  width: 10%;
}
.dashboard-select-box {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  gap: 10px;           /* 셀렉트 박스와 버튼 사이의 간격 */
}
.table-scroll-container {
  max-height: 500px; /* 원하는 리스트 높이로 조절 */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}
.dashboard-select-box select {
  width: 100px;
}

</style>
