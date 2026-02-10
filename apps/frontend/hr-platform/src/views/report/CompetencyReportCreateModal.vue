<script setup>
import { onMounted, ref } from 'vue'
import { YEAR_OPTIONS } from '@/views/report/script/common.js'
import { createCompetencyReport, fetchCreatedReports } from '@/api/competencyReportApi.js'
import '@vuepic/vue-datepicker/dist/main.css'
import { getYear } from '@/views/salary/js/common.js'

const submitting = ref(false)
const errorMessage = ref('')
const emit = defineEmits(['close'])
const year = ref(getYear())
const years = ref([])
const reports = ref([])

const isModalOpen = () => {
  emit('close')
}

// 생성하기
const createReport = async (params) => {
  submitting.value = true

  try {
    const result =  await createCompetencyReport(params)
    const data = result.data

    if (data.success) {
      alert("생성되었습니다.")
    }

  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    // alert(errorMessage.value)
  } finally {
    submitting.value = false
    isModalOpen()
  }
}

const createCompetencyReportBtn = (startDate, endDate, cycleId) => {

  if (startDate == '') {
    alert("시작일을 입력해주세요.");
    return
  }

  if (endDate == '') {
    alert("종료일을 입력해주세요.");
    return
  }


  let payload = {
    startDate: startDate,
    endDate: endDate,
    cycleId: cycleId,
  }

  alert("리포트 생성합니다. 다시 시간이 많이 걸릴 수 있습니다.");
  createReport(payload)
}

// 검색
const searchReport =  async(params) => {
 submitting.value = true

  try {
    const result = await fetchCreatedReports(params)
    const data = result.data

    if (data.success) {
      reports.value = data.data.reports.map((item) => ({
        ...item,
        tempStartDate: '', // 새로 입력할 값을 담을 곳
        tempEndDate: '',
      }))
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
  year.value = getYear()
}

onMounted(() => {
  searchBtn()
  years.value = YEAR_OPTIONS()
})
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title"><strong>역량강화 리포트 생성</strong></div>
        <button class="btn ghost" @click="isModalOpen">닫기</button>
      </div>

      <div class="modal-search">
        <div class="search-section">
          <div class="label">년도</div>
          <select class="select" v-model="year">
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
      <div class="modal-body">
        <table class="table">
          <thead class="tbl-hd">
            <tr>
              <th style="width: 5%">년도</th>
              <th style="width: 5%">회차</th>
              <th style="width: 10%">시작일</th>
              <th style="width: 10%">종료일</th>
              <th style="width: 10%">상태</th>
              <th style="width: 20%">제목</th>
              <th style="width: 10%">담당자</th>
              <th style="width: 10%"></th>
            </tr>
          </thead>
          <tbody class="tbl-bd">
            <tr v-for="item in reports" :key="item.cycleId" :value="item.cycleId">
              <td>{{ item.year }}</td>
              <td>{{ item.quarter }}</td>
              <td>
                <span v-if="item.startDate ">
                  {{ item.startDate }}
                </span>
                <input type="date"
                       v-model="item.tempStartDate"
                       v-else-if="!item.startDate && item.status === 'CLOSED'"
                       class="input"
                />
                <span v-else></span>
              </td>
              <td>
                <span v-if="item.endDate">
                  {{ item.endDate }}
                </span>
                <input v-else-if="!item.endDate && item.status === 'CLOSED'"
                       type="date"
                       class="input"
                       v-model="item.tempEndDate"
                />
                <span v-else></span>
              </td>
              <td>{{ item.status }}</td>
              <td>{{ item.cycleName }}</td>
              <td>{{ item.employeeName }}</td>
              <td>
                <button
                  class="btn"
                  type="button"
                  @click="
                    createCompetencyReportBtn(item.tempStartDate, item.tempEndDate, item.cycleId)
                  "
                  v-if="!item.startDate && !item.endDate && item.status === 'CLOSED'"
                >
                  생성하기
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="hint">* 이미 생성된 리포트는 다시 생성할 수 없습니다.</div>
      </div>
    </div>

    <div v-if="submitting" class="loading-overlay">
      <div class="loading-content">
        <img src="@/assets/images/loading.gif" alt="로딩중" class="loading-img" />

        <p class="loading-text">리포트를 생성하고 있습니다.<br>잠시만 기다려 주세요...</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
.modal-search {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;

  border: 1px solid var(--border); /* 테두리 */
  border-radius: 12px; /* 라운드 */
  background: rgba(255, 255, 255, 0.03); /* 살짝 배경 */
}

.modal-body .table td {
  vertical-align: middle;
}

.input {
  width: 100px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 어두운 배경 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 모달보다 위에 뜨도록 설정 */
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-img {
  width: 80px;  /* 이미지 크기 조절 */
  height: 80px;
  margin-bottom: 20px;
}

.loading-text {
  font-size: 18px;
  line-height: 1.5;
  font-weight: bold;
}

</style>
