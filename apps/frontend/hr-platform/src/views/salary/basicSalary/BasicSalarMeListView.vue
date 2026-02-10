<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'
import { fetchMyBasicSalaries } from '@/api/salaryApi.js'

const router = useRouter()
const submitting = ref(false)
const errorMessage = ref('')

const year = ref('')
const years = ref({})
const salaries = ref({})
const goDetailPage = (empId, year ) => {
  router.push({
    path: `/me/salary/history/${empId}`,
    query: {
      year: year,
    },
  })
}

const searchReport = async () => {
  submitting.value = true

  let payload = {
    year: year.value,
  }

  try {
    const result = await fetchMyBasicSalaries(payload)
    const data = result.data

    if (data.success) {
      // 저장
      salaries.value = data.data.salaries
    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 초기화
function resetSearch() {
  year.value = ''
}

onMounted(() => {
  searchReport()
  years.value = YEAR_OPTIONS()
})
</script>

<template>
  <div class="sub"><strong>기본급/변동보상 이력</strong></div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <div class="label">년도</div>
          <select class="select" v-model="year">
            <option value="">전체</option>
            <option v-for="item in years" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset" @click="resetSearch()">초기화</button>
          <button class="btn primary search" @click="searchReport">검색</button>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="content-empty-state" v-if="!salaries || salaries.length === 0">
      <table class="table">
        <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">제목</th>
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직위</th>
          <th style="width: 10%">변동사유</th>
          <th style="width: 10%">이름</th>
          <th style="width: 10%">결재일</th>
        </tr>
        </thead>
      </table>
      <div class="empty-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        <p>등록된 기본급이 없습니다.</p>
      </div>
    </div>
    <table class="table" v-else>
      <thead class="tbl-hd">
        <tr>
          <th style="width: 10%">년도</th>
          <th style="width: 10%">제목</th>
          <th style="width: 10%">부서</th>
          <th style="width: 10%">직위</th>
          <th style="width: 10%">변동사유</th>
          <th style="width: 10%">이름</th>
          <th style="width: 10%">결재일</th>
        </tr>
      </thead>
      <tbody class="tbl-bd">
        <tr v-for="item in salaries"
            :key="item.docId"
            :value="item.docId"
            @click="goDetailPage(item.empId, item.year)"
        >
          <td>{{ item.year }}</td>
          <td>{{ item.title }}</td>
          <td>{{ item.deptName }}</td>
          <td>{{ item.positionName }}</td>
          <td>{{ item.salaryIncreaseType }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.approvedAt?.split('T')[0] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
</style>
