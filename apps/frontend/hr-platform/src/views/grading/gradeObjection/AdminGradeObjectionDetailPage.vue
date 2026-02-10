<template>
  <section class="page"  v-if="detail">
    <!-- ===== Header ===== -->
    <div class="header">
      <button class="btn-back" @click="goBack">
        ← 뒤로가기
      </button>

      <h2 class="title">이의제기 상세</h2>

      <p class="sub">
        사원 개인 등급 이의제기 상세 내용 및 처리 화면입니다.
      </p>
    </div>


    <!-- ===== Basic Info ===== -->
    <div class="card">
      <h4 class="card-title">기본 정보</h4>

      <div class="info-grid">
        <div class="info">
          <span class="label">사원명</span>
          <span class="value">{{ detail.employeeName }}</span>
        </div>

        <div class="info">
          <span class="label">개인 등급</span>
          <span class="grade-badge">{{ detail.gradeName }}</span>
        </div>

        <div class="info">
          <span class="label">이의제기 상태</span>
          <span
            class="status"
            :class="detail.objectionStatus?.toLowerCase()"
          >
            {{ statusText(detail.objectionStatus) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ===== Grade Reason ===== -->
    <div class="card">
      <h4 class="card-title">등급 부여 사유</h4>
      <p class="content">
        {{ detail.gradeReason || '-' }}
      </p>
    </div>

    <!-- ===== Objection Reason ===== -->
    <div class="card">
      <h4 class="card-title">이의제기 사유</h4>
      <p class="content">
        {{ detail.objectionReason }}
      </p>
    </div>

    <!-- ===== Result ===== -->
    <div class="card">
      <h4 class="card-title">처리 결과</h4>

      <p v-if="detail.objectionResult" class="content">
        {{ detail.objectionResult }}
      </p>

      <p v-else class="muted">
        아직 처리되지 않았습니다.
      </p>
    </div>


  </section>

  <!-- ===== Resolve Modal ===== -->
  <div v-if="showResolveModal" class="modal-backdrop">
    <div class="modal">
      <h4 class="modal-title">
        {{ resolveType === 'ACCEPT' ? '이의제기 승인' : '이의제기 반려' }}
      </h4>

      <textarea
        v-model="resolveResult"
        class="textarea"
        placeholder="처리 사유를 입력하세요"
      />

      <div class="modal-actions">
        <button class="btn ghost" @click="closeResolveModal">
          취소
        </button>
        <button class="btn primary" @click="submitResolve">
          처리
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// API
import {
  fetchGradeObjectionsByDepartment,
  acceptGradeObjection,
  rejectGradeObjection,
} from '@/api/gradeObjectionApi.js'

// Router
const route = useRoute()
const router = useRouter()

// URL 파라미터로 넘어온 이의제기 ID
const objectionId = Number(route.params.objectionId)

// 상태

// 상세 화면에 표시할 이의제기 정보
const detail = ref(null)

// 승인 / 반려 모달 상태
const showResolveModal = ref(false)
const resolveType = ref(null)   // 'ACCEPT' | 'REJECT'
const resolveResult = ref('')   // 처리 사유

// 상태 텍스트 변환
const statusText = (status) => ({
  REVIEWING: '검토 중',
  ACCEPTED: '승인됨',
  REJECTED: '반려됨',
}[status] ?? status)

// 상세 조회
const loadDetail = async () => {
  /**
   * 백엔드에 단건 조회 API가 없으므로
   * 1. 부서 기준 이의제기 목록 전체 조회
   * 2. objectionId 로 해당 건을 찾는다
   */
  const res = await fetchGradeObjectionsByDepartment()
  const list = res.data.data ?? res.data

  detail.value = list.find(
    o => o.objectionId === objectionId
  )

  // 잘못된 접근 방어
  if (!detail.value) {
    alert('이의제기 정보를 찾을 수 없습니다.')
    router.back()
  }
}

const closeResolveModal = () => {
  showResolveModal.value = false
}

// 승인 / 반려 처리
const submitResolve = async () => {
  if (!resolveResult.value.trim()) {
    alert('처리 사유를 입력하세요.')
    return
  }

  if (resolveType.value === 'ACCEPT') {
    await acceptGradeObjection(objectionId, resolveResult.value)
  } else {
    await rejectGradeObjection(objectionId, resolveResult.value)
  }

  alert('처리가 완료되었습니다.')
  router.back() // 목록 페이지로 복귀
}

// Lifecycle
onMounted(loadDetail)

//뒤로가기
const goBack = () => {
  router.back()
}
</script>



<style scoped>
.page {
  padding: 24px;
}


/* ===== Header ===== */

.title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
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
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
}

/* ===== Info ===== */

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.info .label {
  font-size: 11px;
  color: #6b7280;
}

.info .value {
  font-size: 14px;
  font-weight: 700;
}

/* ===== Content ===== */
.content {
  font-size: 13px;
  line-height: 1.6;
  color: #374151;
  white-space: pre-wrap;
}

/* ===== Grade ===== */
.grade-badge {
  padding: 4px 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
  font-size: 12px;
  font-weight: 700;
}

/* ===== Status ===== */
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

/* ===== Actions ===== */
.action-bar {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

/* ===== Buttons ===== */
.btn {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 12px;
  border: none;
  cursor: pointer;
}

.btn.approve {
  background: #ecfdf5;
  color: #047857;
}

.btn.reject {
  background: #fee2e2;
  color: #b91c1c;
}

.btn.primary {
  background: #4f46e5;
  color: #ffffff;
}

.btn.ghost {
  background: #f3f4f6;
}

/* ===== Modal ===== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  width: 420px;
}

.textarea {
  width: 100%;
  min-height: 100px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 10px;
}

.header {
  display: flex;
  border-radius: 18px;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
}

/* 뒤로가기 */
.btn-back {
  border: none;
  background: none;
  color: #4f46e5;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 10px;   /* ← 제목과 간격 */
}

.btn-back:hover {
  text-decoration: underline;
}

/* 제목 */
.title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
}

/* 설명 */
.sub {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7280;
}


</style>
