<template>
  <section class="cycle-detail-page" v-if="cycle">
    <!-- Back Button -->
    <button class="btn-back" @click="goBack">
      ← 뒤로 가기
    </button>
    <h2 class="page-title">평가 회차 상세 (관리자)</h2>

    <!-- ================== 관리자 액션 ================== -->
    <div class="header-actions">
      <button class="btn-outline" @click="goEdit">수정</button>
      <button class="btn-danger" @click="onDelete">삭제</button>

      <button
        class="btn-primary"
        @click="onApprove"
        :disabled="cycle.status === 'APPROVED'"
      >
        승인
      </button>

      <button
        class="btn-danger"
        v-if="cycle.status === 'IN_PROGRESS'"
        @click="onForceClose"
      >
        강제 종료
      </button>
    </div>

    <!-- ================== 회차 정보 ================== -->
    <BaseCard>
      <h4 class="section-title">회차 정보</h4>

      <div class="detail-grid">
        <div class="item">
          <label>회차명</label>
          <p>{{ cycle.cycleName }}</p>
        </div>

        <div class="item">
          <label>분기</label>
          <p>{{ quarterLabel(cycle.quarter) }}</p>
        </div>

        <div class="item">
          <label>기간</label>
          <p>
            {{ formatDate(cycle.startDate) }} ~
            {{ formatDate(cycle.endDate) }}
          </p>
        </div>

        <div class="item">
          <label>상태</label>
          <span class="badge" :class="statusClass(cycle.status)">
            {{ statusLabel(cycle.status) }}
          </span>
        </div>

        <div class="item">
          <label>담당자 ID</label>
          <p>{{ cycle.empId }}</p>
        </div>

        <div class="item">
          <label>역량 리포트 생성 여부</label>
          <p>
            {{ cycle.isCompReportGenerated === 'Y' ? '생성됨' : '미생성' }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- ================== 평가 유형 ================== -->
    <BaseCard class="mt">
      <h4 class="section-title">평가 유형</h4>

      <ul class="eval-types" v-if="cycle.evaluationTypes?.length">
        <li v-for="type in cycle.evaluationTypes" :key="type">
          {{ type }}
        </li>
      </ul>

      <p v-else class="hint">등록된 평가 유형이 없습니다.</p>
    </BaseCard>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import {
  fetchCycleDetail,
  deleteCycle,
  approveCycle,
  forceCloseCycle,
} from '@/api/cycleApi'

const route = useRoute()
const router = useRouter()

const cycleId = route.params.cycleId
const cycle = ref(null)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/hr/cycles')
  }
}

/* ----------------------------
 * load
 * ---------------------------- */
const loadCycle = async () => {
  const res = await fetchCycleDetail(cycleId)
  cycle.value = res.data
}

/* ----------------------------
 * actions
 * ---------------------------- */
const goEdit = () => {
  router.push(`/hr/cycles/${cycleId}/edit`)
}

const onDelete = async () => {
  if (!confirm('정말 이 회차를 삭제하시겠습니까?')) return

  await deleteCycle(cycleId)
  alert('회차가 삭제되었습니다.')
  router.push('/hr/cycles')
}

const onApprove = async () => {
  if (!confirm('이 회차를 승인하시겠습니까?')) return

  await approveCycle(cycleId)
  alert('회차가 승인되었습니다.')
  loadCycle()
}

const onForceClose = async () => {
  if (!confirm('이 회차를 강제 종료하시겠습니까?')) return

  await forceCloseCycle(cycleId)
  alert('회차가 강제 종료되었습니다.')
  loadCycle()
}

/* ----------------------------
 * utils
 * ---------------------------- */
const formatDate = (dateTime) =>
  dateTime.replace('T', ' ').slice(0, 16)

const statusLabel = (status) => {
  switch (status) {
    case 'DRAFT': return '작성 중'
    case 'IN_PROGRESS': return '진행 중'
    case 'CLOSED': return '종료'
    case 'APPROVED': return '확정'
    default: return status
  }
}

const statusClass = (status) => {
  switch (status) {
    case 'DRAFT': return 'draft'
    case 'IN_PROGRESS': return 'in-progress'
    case 'CLOSED': return 'closed'
    case 'APPROVED': return 'approved'
    default: return ''
  }
}

const quarterLabel = (q) => {
  switch (q) {
    case 'Q1': return '1분기'
    case 'Q2': return '2분기'
    case 'Q3': return '3분기'
    case 'Q4': return '4분기'
    default: return q
  }
}

onMounted(loadCycle)
</script>


<style scoped>
/* ===== Page ===== */
.cycle-detail-page {
  max-width: 1080px;
  margin: 0 auto 24px;
  padding: 0 24px;
}

/* ===== Title ===== */
.page-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 5px;
}

/* ===== Header Actions ===== */
.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 16px;
}

/* ===== Buttons ===== */
button {
  transition: all 0.18s ease;
  font-family: inherit;
}

.btn-outline {
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
}

.btn-outline:hover {
  background: #f3f4f6;
}

.btn-danger {
  background: transparent;
  color: #b91c1c;
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  font-size: 13px;
  font-weight: 600;
}

.btn-danger:hover {
  background: #fee2e2;
}

/* ===== Card ===== */
:deep(.base-card) {
  background: white;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  padding: 20px 0;
}

/* ===== Section Title ===== */
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin: 15px 24px 16px;
}

/* ===== Detail Grid ===== */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22px;
  padding: 0 24px 12px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item label {
  font-size: 12px;
  color: #9ca3af;
}

.item p {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

/* ===== Badge ===== */
.badge {
  width: fit-content;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.badge.draft {
  background: #f3f4f6;
  color: #6b7280;
}

.badge.in-progress {
  background: #e0f2fe;
  color: #0369a1;
}

.badge.closed {
  background: #fee2e2;
  color: #991b1b;
}

.badge.approved {
  background: #e0e7ff;
  color: #3730a3;
}

/* ===== Eval Types ===== */
.eval-types {
  list-style: none;
  padding: 0 24px 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.eval-types li {
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

/* ===== Spacing ===== */
.mt {
  margin-top: 20px;
}

/* ===== Hint ===== */
.hint {
  padding: 0 24px 16px;
  font-size: 13px;
  color: #9ca3af;
}
/* ===== Back Button ===== */
.btn-back {
  margin-bottom: 12px;
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

</style>
