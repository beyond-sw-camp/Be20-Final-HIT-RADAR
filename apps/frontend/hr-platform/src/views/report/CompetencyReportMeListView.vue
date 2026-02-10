<script setup>
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { fetchReportsByMe } from '@/api/competencyReportApi.js'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'

const submitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const year = ref('')
const years = ref([])
const reports = ref([])

// 상세페이지 이동
const goDetailPage = (competencyReportId) => {
  router.push({
    path: `/me/competency/report/detail/${competencyReportId}`,
    query: {
      type: 'me',
    },
  })
}

// 검색
const searchReport = async (params) => {
  submitting.value = true

  try {
    const result = await fetchReportsByMe(params)
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

// 검색
function searchBtn() {
  let payload = {
    year: year.value,
  }

  // 검색
  searchReport(payload)
}

// 초기화
function resetSearch() {
  year.value = ''
}

onMounted(() => {
  searchBtn()
  years.value = YEAR_OPTIONS()
})
</script>

<template>
  <div class="sub"><strong>역량강화 리포트 이력</strong></div>

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
          <button class="btn primary search" @click="searchBtn">검색</button>
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
          <td>
            {{ item.cycleName }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
</style>
