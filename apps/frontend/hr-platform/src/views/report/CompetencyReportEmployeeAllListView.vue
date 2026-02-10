<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { fetchDeptOptions, fetchPositionOptions } from '@/views/report/script/common.js'
import { fetchReportsByAll } from '@/api/competencyReportApi.js'
const router = useRouter()
const route = useRoute()
const submitting = ref(false)
const errorMessage = ref('')

const deptOptions = ref([])
const pointOptions = ref([])
const reports = ref([])
const param_year = route.query.year
const param_quarter = route.query.quarter
const searchData = reactive({
  year: param_year,
  quarter: param_quarter,
  dept: '',
  position: '',
  employeeNo: '',
  employeeName: '',
})

const goDetailPage = (competencyReportId) => {
  router.push({
    path: `/me/competency/report/detail/${competencyReportId}`,
    query: {
      type: 'all',
      year: route.query.year,
      quarter: route.query.quarter,
    },
  })
}

const goListPage = () => {
  router.push({ path: '/all/competency/report' })
}

// 검색
const searchReport = async (params) => {
  submitting.value = true

  try {
    const result = await fetchReportsByAll(params)
    const data = result.data

    if (data.success) {
      // 저장
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
    errorMessage.value = e.message || '직위 조회 중 오류 발생'
    alert(errorMessage.value)
  }
}
// 검색
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
  searchBtn()
  loadDeptOptions()
  loadPositionOptions()
})
</script>

<template>
  <div class="sub"><strong>역량강화 리포트 사원별 조회</strong></div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <div class="label">부서</div>
          <select class="select" v-model="searchData.dept">
            <option value="">전체</option>
            <option v-for="dept in deptOptions" :key="dept.deptId" :value="dept.deptId">
              {{ dept.deptName }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">직위</div>
          <select class="select" v-model="searchData.position">
            <option value="">전체</option>
            <option v-for="item in pointOptions" :key="item.positionId" :value="item.positionId">
              {{ item.name }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">사번</div>
          <input class="input"
                 type="text"
                 v-model="searchData.employeeNo"
                 placeholder="사번"
                 @keyup.enter="searchBtn"
          />
        </div>

        <div class="search-btn">
          <button class="btn reset" @click="resetSearch()">초기화</button>
          <button class="btn primary search" @click="searchBtn">검색</button>
        </div>
      </div>
      <div class="card-head">
        <div class="search-section">
          <div class="label">사원명</div>
          <input class="input"
                 type="text"
                 v-model="searchData.employeeName"
                 placeholder="사원명"
                 @keyup.enter="searchBtn"
          />
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="content-empty-state" v-if="!reports || reports.length === 0">
      <table class="table">
        <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">회차</th>
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직위</th>
          <th style="width: 10%">사번</th>
          <th style="width: 10%">사원명</th>
          <th style="width: 30%">제목</th>
        </tr>
        </thead>
      </table>
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>등록된 역량강화 리포트가 없습니다.</p>
      </div>
    </div>
    <table class="table" v-else>
      <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">회차</th>
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직위</th>
          <th style="width: 10%">사번</th>
          <th style="width: 10%">사원명</th>
          <th style="width: 30%">제목</th>
        </tr>
      </thead>
      <tbody
        class="tbl-bd"
        v-for="item in reports"
        :key="item.competencyReportId"
        :value="item.competencyReportId"
        @click="goDetailPage(item.competencyReportId)"
      >
        <tr>
          <td>{{ item.year }}</td>
          <td>{{ item.quarter }}</td>
          <td>{{ item.deptName }}</td>
          <td>{{ item.positionName }}</td>
          <td>{{ item.employeeNo }}</td>
          <td>{{ item.employeeName }}</td>
          <td >
            {{ item.cycleName }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="section-btn">
    <button class="btn" @click="goListPage()" type="button">목록</button>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  padding-right: 10px;
}

input {
  font-size: 13px;
}
</style>
