<template>
  <section class="page">
    <!-- ===== Header ===== -->
    <div class="header">
      <h2 class="title">나의 평가 등급</h2>
      <p class="sub">현재 평가 회차 기준 나의 팀 등급 및 개인 등급입니다.</p>
    </div>

    <!-- ===== Team Grade ===== -->
    <div class="card">
      <h4 class="card-title">우리 팀 등급</h4>

      <div class="grade-box team">
        <span class="grade-name">{{ teamGrade.name }}</span>
        <p class="reason">{{ teamGrade.reason }}</p>
      </div>
    </div>

    <!-- ===== Personal Grade ===== -->
    <div class="card">
      <h4 class="card-title">나의 개인 등급</h4>

      <!-- 등급 있음 -->
      <div v-if="personalGrade.gradeName" class="grade-box personal">
        <span class="grade-name">{{ personalGrade.gradeName }}</span>
        <p class="reason">{{ personalGrade.reason }}</p>

        <button
          class="btn danger"
          :disabled="objections.some(o => o.objectionStatus === 'REVIEWING')"
          @click="raiseObjection"
        >
          이의 제기
        </button>

      </div>

      <!-- 등급 없음 -->
      <div v-else class="empty">
        <p>아직 개인 등급이 부여되지 않았습니다.</p>
      </div>

      <!-- ===== Objection List ===== -->
      <div v-if="objections.length" class="objection-section">
        <h4 class="card-title">이의 제기 내역</h4>

        <div
          v-for="obj in objections"
          :key="obj.objectionId"
          class="objection-box"
        >
          <div class="objection-header">
      <span
        class="status"
        :class="obj.objectionStatus.toLowerCase()"
      >
        {{ objectionStatusText(obj.objectionStatus) }}
      </span>
          </div>

          <p class="objection-reason">
            {{ obj.objectionReason }}
          </p>

          <p
            v-if="obj.objectionResult"
            class="objection-result"
          >
            처리 결과: {{ obj.objectionResult }}
          </p>
        </div>
      </div>
    </div>
  </section>

  <GradeObjectionModal
    v-if="showObjectionModal"
    :individualGradeId="personalGrade.individualGradeId"
    @close="showObjectionModal = false"
    @submitted="submitObjection"
  />

</template>

<script setup>
import { ref, onMounted } from 'vue'

// API
import { fetchCycles } from '@/api/cycleApi.js'
import { fetchMyDeptGrade } from '@/api/DeptGradeApi.js'
import { fetchMyIndividualGrade } from '@/api/individualGradeApi.js'
import { registerGradeObjection, fetchGradeObjectionsByIndividualGrade } from '@/api/gradeObjectionApi.js'
import GradeObjectionModal from '@/views/grading/gradeObjection/GradeObjectionModal.vue'

//상태 관리
//현재 진행중인 평가 회차
const currentCycle = ref(null)

//팀 등급 정보
const teamGrade = ref({
  name: '-',
  reason: '',
})

//개인 등급 정보
const personalGrade = ref({
  individualGradeId: null,
  gradeId: null,
  gradeName: null,
  reason: '',
})

//이의제기 목록
const objections = ref([])

//현재 진행중인 회차 조회
const loadCurrentCycle = async () => {
  const res = await fetchCycles()
  const cycles = res.data.data ?? res.data

  currentCycle.value = cycles.find(
    c => c.status === 'IN_PROGRESS' || c.status === 'IN PROGRESS'
  )
}

//내 팀등급 조회
const loadMyTeamGrade = async () => {
  try {
    const res = await fetchMyDeptGrade()
    const data = res.data.data ?? res.data

    teamGrade.value = {
      name: data.gradeName,
      reason: data.gradeReason ?? '팀 등급 부여 사유가 등록되지 않았습니다.',
    }
  } catch {
    teamGrade.value = {
      name: '-',
      reason: '팀 등급 정보를 불러올 수 없습니다.',
    }
  }
}

// 내 개인등급 조회
const loadMyPersonalGrade = async () => {
  try {
    const res = await fetchMyIndividualGrade(currentCycle.value.cycleId)
    const data = res.data.data ?? res.data

    personalGrade.value = {
      individualGradeId: data.individualGradeId,
      gradeId: data.gradeId,
      gradeName: data.gradeName,
      reason: data.gradeReason,
    }

    await loadMyObjections()
  } catch {
    personalGrade.value = {
      individualGradeId: null,
      gradeId: null,
      gradeName: null,
      reason: '',
    }
    objections.value = []
  }
}

//이의제기 조회
const loadMyObjections = async () => {
  if (!personalGrade.value.individualGradeId) return

  const res = await fetchGradeObjectionsByIndividualGrade(personalGrade.value.individualGradeId)
  objections.value = res.data.data ?? res.data
}

//모달 상태
const showObjectionModal = ref(false)

//이의제기 버튼
const raiseObjection = () => {
  if (!personalGrade.value.individualGradeId) {
    alert('이의 제기할 개인 등급이 없습니다.')
    return
  }

  showObjectionModal.value = true
}

//이의제기 제출
const submitObjection = async ({ individualGradeId, objectionReason }) => {
  try {
    await registerGradeObjection({
      individualGradeId,
      objectionReason,
    })

    alert('이의 제기가 접수되었습니다.')
    showObjectionModal.value = false
    await loadMyObjections()
  } catch {
    alert('이의 제기 처리 중 오류가 발생했습니다.')
  }
}

//상태 텍스트
const objectionStatusText = (status) => {
  return {
    REVIEWING: '검토 중',
    ACCEPTED: '승인됨',
    REJECTED: '반려됨',
  }[status] ?? status
}

//초기로딩
onMounted(async () => {
  await loadCurrentCycle()

  if (!currentCycle.value) {
    alert('진행 중인 평가 회차가 없습니다.')
    return
  }

  await loadMyTeamGrade()
  await loadMyPersonalGrade()
})
</script>



<style scoped>
.page {
  padding: 24px;
}

/* ===== Header ===== */
.header {
  margin-bottom: 20px;
  border-radius: 18px;
}

.title {
  font-size: 24px;
  font-weight: 800;
  margin: 0;
  color: #111827;
  letter-spacing: -0.02em;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}

/* ===== Card ===== */
.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--primary);
}

/* ===== Grade Box ===== */
.grade-box {
  padding: 18px;
  border-radius: 16px;
  border: 1px solid #eef2f7;
}

.grade-box.team {
  background: #eef2ff;
}

.grade-box.personal {
  background: #f0fdf4;
}

.grade-name {
  display: inline-block;
  font-size: 24px;
  font-weight: 800;
  color: #4338ca;
}

.personal .grade-name {
  color: #047857;
}

.reason {
  margin-top: 10px;
  font-size: 13px;
  color: #374151;
  line-height: 1.5;
}

/* ===== Empty ===== */
.empty {
  padding: 20px;
  border-radius: 16px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 13px;
}

/* ===== Button ===== */
.btn {
  margin-top: 14px;
  padding: 8px 16px;
  border-radius: 999px;
  border: none;
  font-size: 12px;
  cursor: pointer;
}

.btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}

.objection-box {
  padding: 14px;
  border-radius: 14px;
  background: #f9fafb;
  border: 1px solid #eef2f7;
  margin-bottom: 10px;
}

.objection-header {
  margin-bottom: 6px;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.status.reviewing {
  background: #eff6ff;
  color: #1d4ed8;
}

.status.accepted {
  background: #ecfdf5;
  color: #047857;
}

.status.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.objection-reason {
  font-size: 13px;
  color: #374151;
}

.objection-result {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
}

.objection-section {
  margin-top: 16px;
}

</style>
