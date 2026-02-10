<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchReportsByCompetencyReportId } from '@/api/competencyReportApi.js'

const router = useRouter()
const route = useRoute()

const submitting = ref(false)
const errorMessage = ref('')

const page = route.query.type
const year = route.query.year
const quarter = route.query.quarter
const detailId = route.params.competencyReportId
const detailData = reactive({
  title: '',
  deptName: '',
  positionName: '',
  employeeName: '',
  kpiOkrResultSummary: '',
  goalFailureAnalysis: '',
  contents: [],
})

// 목록이동
// 목록이동
const goListPage = () => {
  // 1. 현재 라우트에서 최신 값을 직접 가져옵니다.
  if (page === 'all') {
    router.push({
      path: '/all/competency/report/employee',
      query: {
        type: 'all',
        year: year,
        quarter: quarter,
      },
    })
  } else if (page === 'me') {
    router.push({ path: '/me/competency/report' })
  } else {
    router.back()
  }
}

// 검색
const searchReport = async () => {
  submitting.value = true

  try {
    const result = await fetchReportsByCompetencyReportId(detailId)
    const data = result.data

    if (data.success) {
      let detail = data.data.competencyReportDTO

      detailData.deptName = detail.deptName
      detailData.title = detail.cycleName
      detailData.employeeName = detail.employeeName
      detailData.positionName = detail.positionName
      detailData.kpiOkrResultSummary = detail.kpiOkrResultSummary
      detailData.goalFailureAnalysis = detail.goalFailureAnalysis
      detailData.contents = data.data.contents
    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}
onMounted(() => {
  searchReport()
})
</script>

<template>
  <div class="sub"><strong>역량강화 리포트</strong></div>
  <div class="content">
    <div class="card">
      <div class="section-title">
        <h1>{{ detailData.title }}</h1>
        <div class="right-actions">
          <span class="badge good">
            <span class="dot"></span>
            분석 완료
          </span>
        </div>
      </div>
      <div class="card-bd">
        <div class="card-name">
          {{ detailData.employeeName }} ( {{ detailData.deptName }} |
          {{ detailData.positionName }} )
        </div>
      </div>
    </div>

    <div class="grid cols-2">
      <div class="card">
        <div class="card-hd">
          <h2>KPI / OKR 결과 요약</h2>
        </div>
        <div class="card-bd">
          <p>
            {{ detailData.kpiOkrResultSummary }}
          </p>
        </div>
      </div>

      <div class="card">
        <div class="card-hd">
          <h2>역량 분석 결과</h2>
        </div>
        <div class="card-bd">
          {{ detailData.goalFailureAnalysis }}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 14px">
      <div class="card-hd">
        <h2>역량 강화 추천 프로그램</h2>
      </div>
      <div class="card-bd">
        <div class="list">
          <div class="li" v-for="item of detailData.contents" :key="item.contentId">
            <div class="li-title">💡 {{ item.title }}</div>
            <div class="li-contents">
              <div class="li-pill">
                <div class="pill">난이도 · {{ item.levelName }}</div>
                <div class="pill">학습시간 · {{ item.learningTime }}</div>
              </div>
              <div class="li-meta">{{ item.reason }}</div>
              <div class="li-link">🔗 링크/ 위치 : {{ item.resourcePath }}</div>
            </div>
          </div>
        </div>

        <div class="hint">* 추천 프로그램은 회사 내 학습 콘텐츠를 기반으로 생성되었습니다.</div>
      </div>
    </div>
  </div>
  <div class="section-btn">
    <div>
      <!--      <button class="btn primary">PDF 다운로드</button>-->
      <button class="btn" @click="goListPage()" type="button">목록</button>
    </div>
  </div>
</template>

<style scoped>
.section-btn {
  margin-right: 30px;
  display: flex;
  justify-content: end;
}

.section-btn .btn {
  margin-left: 10px;
}

.content .card {
  padding: 20px;
  margin-bottom: 30px;
}

.card-bd .card-name {
  display: flex;
  justify-content: flex-end;
  font-weight: bold;
}

.li-pill {
  display: flex;
  justify-content: end;
  padding-top: 10px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.li-link {
  padding-top: 10px;
  font-size: 13px;
}
</style>
