<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import {
  fetchDeptOptions,
  fetchPositionOptions,
  LEAVE_STATUS_OPTIONS,
} from '@/views/report/script/common.js'
import { fetchBasicSalariesById } from '@/api/salaryApi.js'
import { APPROVAL_OPTIONS, BASIC_OPTIONS, formatComma, getLabel } from '@/views/salary/js/common.js'

const router = useRouter()
const route = useRoute()
const docId = route.params.docId
const submitting = ref(false)
const errorMessage = ref('')

const deptOptions = ref([])
const pointOptions = ref([])
const searchData = reactive(({
  employmentType : '',
  deptId: '',
  comPositionId: '',
  employeeNo: '',
  employeeName : ''
}))

const basicSalaries = ref([])
const salaryApproval = reactive({
  title : ''
  , salaryIncreaseType : ''
  , remark : ''
  , approvedAt : ''
  , approvalStatus : ''
  , writer : ''
  , totalSalary : ''
  , empCount : ''
  , year : ''
})

// 상세 정보
const goDetailPage = (id) => {
  router.push({
    path: `/all/salary/basic/detail/${id}`,
    query: {
      docId: docId,
    },
  })
}
// 목록 이동
const goListPage = () => {
  router.push({ path: '/all/salary/basic' })
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

// 검색
const searchReport = async (payload) => {
  submitting.value = true

  try {
    const result = await fetchBasicSalariesById(docId,payload)
    const data = result.data

    if (data.success) {
      basicSalaries.value = data.data.salaries
      let approval = data.data.salaryApproval
      salaryApproval.title = approval.title
      salaryApproval.salaryIncreaseType = approval.salaryIncreaseType
      salaryApproval.remark = approval.remark
      salaryApproval.approvedAt = approval.approvedAt
      salaryApproval.approvalStatus = approval.approvalStatus
      salaryApproval.writer = approval.writer
      salaryApproval.totalSalary = approval.totalSalary
      salaryApproval.empCount = approval.empCount
      salaryApproval.year = approval.year
    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

function searchBtn() {

  let payload = {
    employmentType: searchData.employmentType,
    deptId: searchData.deptId,
    comPositionId: searchData.comPositionId,
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
  loadDeptOptions()
  loadPositionOptions()
  searchBtn()
})
</script>

<template>
  <div class="sub"><strong>사원별 관리</strong></div>

  <div class="grid">
    <div class="card">
      <div class="approval-card">
        <div class="approval-card-title">
          <div>
            <span><strong>{{ salaryApproval.title}}</strong></span>
            <span class="sub">{{ salaryApproval.approvedAt}}</span>
          </div>
          <span :class="['status-badge', salaryApproval.approvalStatus]">
            {{ getLabel(APPROVAL_OPTIONS, salaryApproval.approvalStatus) }}
          </span>
        </div>

          <div class="approval-card-contents">
            <div class="card-div">
              <span class="card-item"> <strong>연봉 인상 유형 : </strong> {{
                  getLabel(BASIC_OPTIONS, salaryApproval.salaryIncreaseType)
                }}</span>
              <span class="card-item"> <strong>담당자 : </strong>  {{ salaryApproval.writer }}</span>
            </div>
            <div class="card-div">
              <span class="card-item"><strong>총 금액 : </strong> {{ formatComma(salaryApproval.totalSalary, '원') }}</span>
              <span class="card-item"><strong>결재 대상 인원 : </strong>  {{ salaryApproval.empCount }}</span>
            </div>
            <div class="card-div">
              <span class="card-item"> <strong>비고 : </strong>  {{ salaryApproval.remark}}</span>
            </div>
          </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head">
      <div class="search-section">
        <div class="label">재직상태</div>
        <select class="select" v-model="searchData.employmentType">
          <option value="">전체</option>
          <option v-for="item in LEAVE_STATUS_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div class="search-section">
        <div class="label">부서</div>
        <select class="select" v-model="searchData.deptId">
          <option value="">전체</option>
          <option v-for="dept in deptOptions" :key="dept.deptId" :value="dept.deptId">
            {{ dept.deptName }}
          </option>
        </select>
      </div>
      <div class="search-section">
        <div class="label">직위</div>
        <select class="select" v-model="searchData.comPositionId">
          <option value="">전체</option>
          <option v-for="dept in pointOptions" :key="dept.positionId" :value="dept.positionId">
            {{ dept.name }}
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
        <div class="label">사번</div>
        <input class="input"
               type="text"
               v-model="searchData.employeeNo"
               placeholder="사번"
               @keyup.enter="searchBtn"
        />
      </div>

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

  <div class="card">
    <div class="content-empty-state" v-if="!basicSalaries || basicSalaries.length === 0">
      <table class="table">
        <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">재직상태</th>
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직위</th>
          <th style="width: 10%">사번</th>
          <th style="width: 20%">사원명</th>
          <th style="width: 20%">인상사유</th>
        </tr>
        </thead>
      </table>
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>등록된 결재대상이 없습니다.</p>
      </div>
    </div>
    <div class="table-scroll-container" v-else>
    <table class="table">
      <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">재직상태</th>
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직위</th>
          <th style="width: 10%">사번</th>
          <th style="width: 20%">사원명</th>
          <th style="width: 20%">인상사유</th>
        </tr>
      </thead>
      <tbody class="tbl-bd">
        <tr
          class="tbl-bd"
          v-for="item in basicSalaries"
          :key="item.docId"
          :value="item.docId"
          @click="goDetailPage(item.empId)"
        >
          <td>{{ getLabel(LEAVE_STATUS_OPTIONS, item.employmentType) }}</td>
          <td>{{item.deptName}}</td>
          <td >{{item.positionName}}</td>
          <td>{{item.employeeNo}}</td>
          <td>{{item.name}}</td>
          <td>
              <span v-for="type in BASIC_OPTIONS" :key="type.value">
                <template v-if="type.value === item.salaryIncreaseType">
                  {{ type.label }}
                </template>
              </span>
          </td>
        </tr>

      </tbody>
    </table>
    </div>
    <div class="section-btn">
      <button class="btn" @click="goListPage()" type="button">목록</button>
    </div>
  </div>

</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
@import '@/views/salary/style/badge.css';

.card {
  margin-left: 15px;
  margin-right: 15px;
}

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  padding-right: 10px;
}

.approval-card {
  padding: 20px;
}

.approval-card-title {
  display: flex;
  justify-content: space-between;

}
.approval-card-title > div {
  display: flex;
  flex-direction: column;
}
.approval-card-contents {
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-div,
.approval-card-contents > div {
  display: flex;
  flex-direction: row;
  width: 100%;

}

.card-item {
  flex: 1;
  width: 50%;
  font-size: 0.95rem;
  color: #444;
  display: flex;
  align-items: center;
}
.table-scroll-container {
  max-height: 500px; /* 원하는 리스트 높이로 조절 */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}
input {
  font-size: 13px;
}
</style>
