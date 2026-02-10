<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'
import { fetchBasicHistoryByMe, fetchCompensationHistory } from '@/api/salaryApi.js'
import { fetchEmployeeDetail } from '@/api/employeeApi.js'
import { LEAVE_STATUS_OPTIONS } from '@/views/report/script/common.js'
import {
  APPROVAL_OPTIONS,
  BASIC_OPTIONS,
  COMPENSATION_OPTIONS,
  formatComma,
  getLabel,
} from '@/views/salary/js/common.js'

const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const errorMessage = ref('')
const empId = route.params.id
const year = route.query.year

const basic = reactive({
  currentSalary: '',
  prevSalary: '',
  title: '',
  increaseRate: '',
  salaryIncreaseType: '',
  year: '',
})
const compensation = ref([])
const employees = reactive({
  name: '',
  employeeNo: '',
  deptName: '',
  positionName: '',
  hireDate: '',
  employmentType: '',
})

const searchData = reactive({
  compensationType: '',
  year: year,
})

const goListPage = () => {
  router.push({ path: '/me/salary/basic' })
}

// 변동보상 히스토리
const compensationHistory = async () => {
  submitting.value = true

  let payload = {
    year: searchData.year,
    type: searchData.compensationType,
  }

  try {
    const result = await fetchCompensationHistory(empId, payload)
    const data = result.data

    if (data.success) {
      compensation.value = data.data.compensationSalaries
    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 기본급 히스토리
const basicHistory = async () => {
  submitting.value = true

  try {
    const result = await fetchBasicHistoryByMe(year)
    const data = result.data

    if (data.success) {
      let history = data.data.salaryHistory
      /*
      * const basic = reactive({
  currentSalary : '',
  prevSalary : '',
  title : '',
  increaseRate : '',
  salaryIncreaseType : '',
})
      *
      * */
      basic.title = history.title
      basic.increaseRate = history.increaseRate
      basic.currentSalary = history.currentSalary
      basic.prevSalary = history.prevSalary
      basic.salaryIncreaseType = getLabel(BASIC_OPTIONS, history.salaryIncreaseType)
      basic.year = history.year
    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 사원정보
const getEmployee = async () => {
  submitting.value = true

  try {
    const result = await fetchEmployeeDetail(empId)
    const data = result.data

    if (data.success) {
      employees.name = data.data.name
      employees.employeeNo = data.data.employeeNo
      employees.deptName = data.data.deptName
      employees.positionName = data.data.positionName
      employees.hireDate = data.data.hireDate
      employees.employmentType = data.data.employmentType
    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}
watch(
  () => [searchData.year, searchData.compensationType],
  () => {
    compensationHistory()
  },
)
onMounted(() => {
  // 사원정보
  getEmployee()
  // 기본급 히스토리
  basicHistory()
  // 변동사항 히스토리
  compensationHistory()
})
</script>

<template>
  <div class="sub"><strong>연봉 상세 조회</strong></div>

  <div class="salary-section">
    <div class="card">
      <h3>사원정보</h3>
      <div class="employee-section">
        <div class="card-content">
          <table class="table">
            <tr>
              <th>이름</th>
              <td>{{ employees.name }}</td>
              <th>사번</th>
              <td>{{ employees.employeeNo }}</td>
            </tr>
            <tr>
              <th>부서</th>
              <td>{{ employees.deptName }}</td>
              <th>직위</th>
              <td>{{ employees.positionName }}</td>
            </tr>
            <tr>
              <th>입사일</th>
              <td>{{ employees.hireDate }}</td>
              <th>재직상태</th>
              <td>{{ getLabel(LEAVE_STATUS_OPTIONS, employees.employmentType) }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>기본급 정보</h3>
      <div class="basic-section">
        <div class="card-history">
          <div class="content-empty-state" v-if="!basic">
            <table class="table-card">
              <thead class="tbl-hd">
              <tr>
                <th style="width: 10%">년도</th>
                <th style="width: 10%">인상사유</th>
                <th style="width: 10%">전 년도 연봉</th>
                <th style="width: 10%">변경 연봉</th>
                <th style="width: 10%">인상률(%)</th>
                <th style="width: 10%">인상금액</th>
              </tr>
              </thead>
            </table>
            <div class="empty-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p>등록된 변동보상 히스토리가 없습니다.</p>
            </div>
          </div>
          <table class="table-card" v-else>
            <tr>
              <th style="width: 10%">년도</th>
              <th style="width: 10%">인상사유</th>
              <th style="width: 10%">전 년도 연봉</th>
              <th style="width: 10%">변경 연봉</th>
              <th style="width: 10%">인상률(%)</th>
              <th style="width: 10%">인상금액</th>
            </tr>
            <tr>
              <td>{{ basic.year }}</td>
              <td>{{ basic.salaryIncreaseType }}</td>
              <td>{{ formatComma(basic.prevSalary)}}</td>
              <td>{{ formatComma(basic.currentSalary) }}</td>
              <td>{{ basic.increaseRate == null ? 0 : basic.increaseRate }}</td>
              <td>{{ formatComma(basic.currentSalary - basic.prevSalary) }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>변동 보상 히스토리</h3>
      <div class="compensation-section">
        <div class="search-box">
          <div class="search">
            <div class="label">종류</div>
            <select class="select" v-model="searchData.compensationType">
              <option value="">전체</option>
              <option v-for="item in COMPENSATION_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="card-history">
          <div class="content-empty-state" v-if="!compensation || compensation.length === 0">
            <table class="table-card">
              <thead class="tbl-hd">
              <tr>
                <th style="width: 10%">년도</th>
                <th style="width: 10%">제목</th>
                <th style="width: 10%">유형</th>
                <th style="width: 10%">비고</th>
                <th style="width: 10%">결재상태</th>
                <th style="width: 10%">결재일</th>
                <th style="width: 10%">금액</th>
                <th style="width: 10%">퍼센트(%)</th>
              </tr>
              </thead>
            </table>
            <div class="empty-content">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p>등록된 변동보상 히스토리가 없습니다.</p>
            </div>
          </div>
          <table class="table-card" v-else>
            <tr>
              <th style="width: 10%">년도</th>
              <th style="width: 10%">제목</th>
              <th style="width: 10%">유형</th>
              <th style="width: 10%">비고</th>
              <th style="width: 10%">결재상태</th>
              <th style="width: 10%">결재일</th>
              <th style="width: 10%">금액</th>
              <th style="width: 10%">퍼센트(%)</th>
            </tr>
            <tr v-for="(item, index) in compensation" :key="index">
              <template v-if="item">
                <td>{{ item.year }}</td>
                <td>{{ item.title }}</td>
                <td>{{ getLabel(COMPENSATION_OPTIONS, item.type) }}</td>
                <td>{{ item.remark }}</td>
                <td>
                  <span :class="['status-badge', item.approvalStatus]">
                    {{ getLabel(APPROVAL_OPTIONS, item.approvalStatus) }}
                  </span>
                </td>
                <td>{{ item.approvedAt }}</td>
                <td>{{ formatComma(item.amount) }}</td>
                <td>{{ item.rate ?? 0 }}</td>
              </template>
            </tr>
          </table>
        </div>
      </div>
    </div>
    <div class="section-btn">
      <button class="btn" @click="goListPage()" type="button">목록</button>
    </div>
  </div>
</template>

<style scoped>
@import '@/views/contents/style/tableCss.css';
@import '@/views/salary/style/salaryTable.css';
@import '@/views/salary/style/badge.css';
.card {
  padding: 15px;
  margin-bottom: 15px;
}
.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  padding-right: 10px;
  margin-bottom: 10px;
}
</style>
