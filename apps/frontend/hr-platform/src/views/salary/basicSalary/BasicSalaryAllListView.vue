<script setup>
import { useRouter } from 'vue-router'
import { onMounted, reactive, ref, watch } from 'vue'
import { fetchBasicSalaries } from '@/api/salaryApi.js'
import {
  APPROVAL_OPTIONS,
  BASIC_OPTIONS,
  formatComma,
  getDateFormatter, getLabel,
  getYear,
} from '@/views/salary/js/common.js'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

const submitting = ref(false)
const errorMessage = ref('')
const router = useRouter()

const currentYear = getYear()
const year = ref(getYear())
const years = ref([])
const basic = ref([])
const summary = ref([]) // 5년간 총 연봉 데이터
const dateData = reactive({
  startDate: '',
  endDate: '',
})

const goBasicCreate = () => {
  router.push({
    path: '/all/salary/create',
    query: {
      type: 'basic',
      year: year.value,
    },
  })
}

const goEmployeeListPage = (year) => {
  router.push(`/all/salary/basic/employee/${year}`)
}
// 검색
const searchSalaries = async () => {
  submitting.value = true

  let payload = {
    year: year.value,
  }

  try {
    const result = await fetchBasicSalaries(payload)
    const data = result.data

    if (data.success) {
      // 저장
      basic.value = data.data.salaryApprovals
      dateData.startDate = getDateFormatter(data.data.startDate)
      dateData.endDate = getDateFormatter(data.data.endDate)
      summary.value = data.data.basicSalarySummaryForFiveYear
    }
  } catch (e) {
    errorMessage.value = e.message || '기본급 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}
const chartRef = ref(null) // HTML 엘리먼트 참조
let salaryChart = null // 차트 인스턴스 보관

const renderChart = () => {
  if (!chartRef.value || summary.value.length === 0) return

  if (salaryChart) {
    salaryChart.destroy()
  }

  const sortedSummary = [...summary.value].sort((a, b) => a.year - b.year)
  const labels = sortedSummary.map((item) => `${item.year}년`)
  const dataValues = sortedSummary.map((item) => item.totalAmount)

  const ctx = chartRef.value.getContext('2d')
  salaryChart = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: [
        {
          // 1. 선 그래프 설정 (추이 강조)
          type: 'line',
          label: '연도별 추이',
          data: dataValues,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          tension: 0.3,
          fill: false,
          order: 1, // 선이 막대보다 위로 오게 설정
        },
        {
          // 2. 막대 그래프 설정 (금액 볼륨 강조)
          type: 'bar',
          label: '기본급 총액',
          data: dataValues,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 5,
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => value.toLocaleString() + '원',
          },
        },
      },
      plugins: {
        legend: {
          position: 'top', // 범례 표시
        },
      },
    },
  })
}

// 데이터가 변경될 때마다 차트 다시 그리기
watch(
  summary,
  () => {
    renderChart()
  },
  { deep: true },
)

watch(year, () => {
  searchSalaries()
})
onMounted(() => {
  searchSalaries()
  years.value = YEAR_OPTIONS()
})
</script>

<template>
  <div class="sub"><strong>기본급 조회</strong></div>

  <div class="card">
    <div class="dashboard-box">
      <div class="dashboard-box-header">
        <div class="dashboard-box-title">
          <span class="title">{{ year }}년 기본급 관리</span>
          <span class="sub-title">{{ dateData.startDate }} ~ {{ currentYear === year ? dateData.endDate : year + "년12월31일"}}</span>
        </div>
        <div class="dashboard-select-box">
          <div class="search">
            <select class="select" v-model="year">
              <option v-for="item in years" :key="item" :value="item">
                {{ item }}
              </option>
            </select>
          </div>
          <button class="btn primary"
                  @click="goBasicCreate()"
          >
            등록하기
          </button>
        </div>
      </div>

      <div class="dashboard-box-body">
        <div class="amount-box">
          <span class="title">총 금액</span>
          <span class="content-font" v-if="summary.length > 0">
            {{ summary[0].totalAmount?.toLocaleString() }}원
          </span>
          <span class="content-font" v-else>0원</span>
        </div>
        <div class="chart-box">
          <canvas ref="chartRef"></canvas>
        </div>
      </div>
    </div>
    <div class="grid">
      <div class="card">
        <div class="content-empty-state" v-if="!basic || basic.length === 0">
          <table class="table">
            <thead class="tbl-hd">
            <tr>
              <th style="width: 10%">년도</th>
              <th style="width: 10%">연봉인상유형</th>
              <th style="width: 30%">제목</th>
              <th style="width: 10%">총금액</th>
              <th style="width: 10%">인원</th>
              <th style="width: 10%">결재여부</th>
              <th style="width: 10%">결재일</th>
              <th style="width: 10%">담당자</th>
            </tr>
            </thead>
          </table>
          <div class="empty-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p>등록된 기본급이 없습니다.</p>
          </div>
        </div>
        <div class="table-scroll-container" v-else>
        <table class="table">
          <thead class="tbl-hd">
            <tr>
              <th style="width: 10%">년도</th>
              <th style="width: 10%">연봉인상유형</th>
              <th style="width: 30%">제목</th>
              <th style="width: 10%">총금액</th>
              <th style="width: 10%">인원</th>
              <th style="width: 10%">결재여부</th>
              <th style="width: 10%">결재일</th>
              <th style="width: 10%">담당자</th>
            </tr>
          </thead>
          <tbody class="tbl-bd">
            <tr v-for="item in basic"
                :key="item.docId"
                @click="goEmployeeListPage(item.docId)"
            >
              <td>{{ item.year }}</td>
              <td>
                <span v-for="type in BASIC_OPTIONS" :key="type.value">
                  <template v-if="type.value === item.salaryIncreaseType">
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
              <td>{{ item.approvedAt }}</td>
              <td>{{ item.writer }}</td>
            </tr>
          </tbody>
        </table>
      </div>
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

.chart-box {
  width: 100%;
  height: 180px;
}

.dashboard-select-box {
  display: flex;
  align-items: center; /* 세로 중앙 정렬 */
  gap: 10px;           /* 셀렉트 박스와 버튼 사이의 간격 */
}

.dashboard-select-box select {
  width: 100px;
  margin-top: 10px;
}

.table-scroll-container {
  max-height: 500px; /* 원하는 리스트 높이로 조절 */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}

</style>
