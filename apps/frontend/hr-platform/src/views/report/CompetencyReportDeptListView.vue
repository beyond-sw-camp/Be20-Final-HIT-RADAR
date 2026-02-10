<script setup>
import { useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { fetchReportsByDept } from '@/api/competencyReportApi.js'
import { fetchDeptOptions, fetchPositionOptions } from '@/views/report/script/common.js'
import { YEAR_OPTIONS, QUARTER_OPTIONS } from '@/views/report/script/common.js'

const router = useRouter()
const submitting = ref(false)
const errorMessage = ref('')

const years = ref([])
const deptOptions = ref([])
const pointOptions = ref([])
const reports = ref([])

const searchData = reactive({
  year: '',
  quarter: '',
  dept: '',
  position: '',
  employeeNo: '',
  employeeName: '',
})

const goDetailPage = (competencyReportId) => {
  router.push({
    path: `/me/competency/report/detail/${competencyReportId}`,
    query: {
      type: 'dept',
    }
  })
}

// 검색
const searchReport = async (payload) => {
  submitting.value = true
  try {
    const result = await fetchReportsByDept(payload)
    const data = result.data

    if (data.success) {
      reports.value = data.data.reports
    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 부서 로딩
const loadDeptOptions = async () => {
  try {
    deptOptions.value = await fetchDeptOptions()
  } catch (e) {
    errorMessage.value = e.message || '부서 조회 중 오류 발생'
    alert(errorMessage.value)
  }
}

// 직위 로딩
const loadPositionOptions = async () => {
  try {
    pointOptions.value = await fetchPositionOptions()
  } catch (e) {
    errorMessage.value = e.message || '부서 조회 중 오류 발생'
    alert(errorMessage.value)
  }
}

function searchBtn() {

  let payload = {

    year: searchData.year,
    quarter: searchData.quarter,
    deptId: searchData.dept,
    comPositionId: searchData.position,
    employeeNo: searchData.employeeNo,
    employeeName: searchData.employeeName,
  }

  // 검색
  searchReport(payload)
}

// 초기화
const resetSearch = () => {
  Object.keys(searchData).forEach((key) => {
    searchData[key] = ''
  })
}

onMounted(() => {
  years.value = YEAR_OPTIONS()
  loadDeptOptions()
  loadPositionOptions()
  searchBtn()
})
</script>

<template>
  <div class="sub"><strong>역량강화 리포트 조회</strong></div>

  <div class="card">
    <div class="card-head">
      <div class="search-section">
        <div class="label">년도</div>
        <select class="select" v-model="searchData.year">
          <option value="">전체</option>
          <option v-for="item in years" :key="item" :value="item">
            {{ item }}
          </option>
        </select>
      </div>

      <div class="label">분기</div>
      <select class="select" v-model="searchData.quarter">
        <option value="">전체</option>
        <option v-for="item in QUARTER_OPTIONS" :key="item.value" :value="item.value">
          {{ item.label }}
        </option>
      </select>
      <div class="search-section">
        <div class="label">부서</div>
        <select class="select" v-model="searchData.dept">
          <option value="">전체</option>
          <option v-for="dept in deptOptions" :key="dept.deptId" :value="dept.deptId">
            {{ dept.deptName }}
          </option>
        </select>
      </div>

      <div class="search-btn">
        <button class="btn reset" @click="resetSearch()">초기화</button>
        <button class="btn primary search" @click="searchBtn">검색</button>
      </div>
    </div>
    <div class="card-head">
      <div class="search-section">
        <div class="label">직위</div>
        <select class="select" v-model="searchData.position">
          <option value="">전체</option>
          <option v-for="dept in pointOptions" :key="dept.positionId" :value="dept.positionId">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <div class="search-section">
        <div class="label">사번</div>
        <input class="input"
               type="text"
               v-model="searchData.employeeNo"
               placeholder="사번"
        />
      </div>

      <div class="search-section">
        <div class="label">사원명</div>
        <input class="input"
               type="text"
               v-model="searchData.employeeName"
               placeholder="사원명"
        />
      </div>
    </div>
  </div>

  <div class="card">
    <table class="table">
      <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">회차</th>
          <th style="width: 30%">제목</th>
          <th style="width: 10%">담당자</th>
        </tr>
      </thead>
      <tbody
        class="tbl-bd"
        v-for="item in reports"
        :key="item.competencyReportId"
        :value="item.competencyReportId"
      >
        <tr >
          <td>2025</td>
          <td>1</td>
          <td @click="goDetailPage(item.competencyReportId)">
            2025년 1분기 역량강화 리포트
          </td>
          <td>김사원</td>
        </tr>

      </tbody>
      <tr >
        <td>2025</td>
        <td>1</td>
        <td @click="goDetailPage(2025)"
        >
          2025년 1분기 역량강화 리포트</td>
        <td>김사원</td>
      </tr>
    </table>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
</style>
