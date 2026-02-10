<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Loading...</span>
        <button class="btn-close-abs" @click="$emit('close')">×</button>
      </div>

      <div v-else-if="!detail" class="error-state">
        <p>상세 정보를 불러올 수 없습니다.</p>
        <button class="btn-retry" @click="fetchDetail">다시 시도</button>
        <button class="btn-close-abs" @click="$emit('close')">×</button>
      </div>

      <div v-else class="modal-content">
        <div class="modal-header">
          <div class="header-left">
            <h2>신청 상세 정보</h2>
            <!-- Status Badge -->
            <span :class="['status-pill', detail.status]">
              <span class="status-dot"></span>
              {{ formatStatus(detail.status) }}
            </span>
          </div>
          <button class="btn-close" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body custom-scrollbar">
          <div class="info-section">
            <h3>회사 정보</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="label">회사명</span>
                <span class="value">{{ detail.comName || detail.companyName }}</span>
              </div>
              <div class="info-row" v-if="detail.comCode || detail.companyCode">
                <span class="label">회사코드</span>
                <span class="value text-primary fw-bold">{{ detail.comCode || detail.companyCode }}</span>
              </div>
              <div class="info-row">
                <span class="label">사업자번호</span>
                <span class="value">{{ detail.bizNo || detail.businessNo }}</span>
              </div>
              <div class="info-row">
                <span class="label">회사연락처</span>
                <span class="value">{{ detail.comTel || detail.tel || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">주소</span>
                <span class="value">{{ detail.address || detail.addr || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
             <h3>관리자 계정</h3>
             <div class="info-list">
               <div class="info-row">
                 <span class="label">이름</span>
                 <span class="value">{{ detail.comAdminName || detail.adminName || detail.userName }}</span>
               </div>
               <div class="info-row">
                 <span class="label">ID</span>
                 <span class="value">{{ detail.comAdminLoginId || detail.loginId || detail.userId }}</span>
               </div>
               <div class="info-row">
                 <span class="label">이메일</span>
                 <span class="value">{{ detail.comAdminEmail || detail.email || detail.userEmail }}</span>
               </div>
             </div>
          </div>

          <div class="info-section" v-if="detail.rejectReason">
            <h3>반려 사유</h3>
             <div class="reason-box">
              {{ detail.rejectReason }}
             </div>
          </div>

          <!-- Actions -->
          <div class="actions" v-if="detail.status === 'PENDING' || detail.status === 'SUBMITTED'">
            <button class="btn-approve" @click="handleApprove">승인</button>
            <button class="btn-reject" @click="handleReject">반려</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCompanyApplicationDetail, approveCompanyApplication, rejectCompanyApplication } from '@/api/comApp'

const props = defineProps({
  appId: {
    type: [Number, String],
    required: true
  }
})

const emit = defineEmits(['close', 'refresh'])

const loading = ref(false)
const detail = ref(null)

const fetchDetail = async () => {
  if (!props.appId) return
  loading.value = true
  try {
    const res = await getCompanyApplicationDetail(props.appId)
    // console.log('Detail Modal Res:', res.data)
    detail.value = res.data.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

const formatStatus = (status) => {
  const map = {
    PENDING: '승인대기',
    SUBMITTED: '제출됨',
    APPROVED: '승인완료',
    REJECTED: '반려',
  }
  return map[status] || status
}

const handleApprove = async () => {
  if (confirm('이 신청을 승인하시겠습니까?')) {
    try {
      await approveCompanyApplication(props.appId)
      alert('승인되었습니다.')
      emit('refresh')
      emit('close')
    } catch (e) {
      console.error(e)
      alert('승인 처리에 실패했습니다.')
    }
  }
}

const handleReject = async () => {
  const reason = prompt('반려 사유를 입력하세요:')
  if (reason) {
    try {
      await rejectCompanyApplication(props.appId, reason)
      alert('반려되었습니다.')
      emit('refresh')
      emit('close')
    } catch (e) {
      console.error(e)
      alert('반려 처리에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-container {
  width: 580px;
  max-width: 90%;
  max-height: 85vh;
  background: white;
  border-radius: 24px; /* Toss-style rounding */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  user-select: none;
}

/* Header Fix */
.modal-header {
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #fff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.btn-close {
  background: none; border: none;
  font-size: 28px; color: #a0a0a0;
  cursor: pointer;
  line-height: 1;
  margin-top: -4px;
  margin-right: -8px;
  transition: color 0.2s;
}
.btn-close:hover { color: #333; }

.btn-close-abs {
  position: absolute;
  top: 18px; right: 22px;
  background: none; border: none;
  font-size: 24px; color: #a0a0a0;
  cursor: pointer;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-body {
  padding: 0 28px 28px;
  overflow-y: auto;
  flex: 1;
}

/* Info Section as List */
.info-section { 
  margin-top: 24px;
}
.info-section h3 {
  font-size: 0.9rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 8px;
  padding-left: 2px;
}

.info-list {
  background: #f9f9fb30; /* Very subtle or white */
  border-radius: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f2f2f2;
}
.info-row:last-child { border-bottom: none; }

.label {
  font-size: 0.9rem;
  color: #888;
  font-weight: 500;
  flex-shrink: 0;
}
.value {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
  max-width: 65%;
}
.text-primary { color: #3182f6; }
.fw-bold { font-weight: 600; }

.reason-box {
  background: #fff5f5;
  color: #d32f2f;
  padding: 16px;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
}

.actions {
  display: flex; gap: 8px;
  margin-top: 32px;
  padding-top: 0;
  justify-content: flex-end;
}

.btn-approve, .btn-reject {
  padding: 10px 24px;
  border-radius: 12px; /* Softer button radius */
  font-weight: 600; border: none; cursor: pointer;
  font-size: 0.95rem;
  transition: transform 0.1s;
}
.btn-approve { background: #3182f6; color: white; } /* Toss Blue */
.btn-approve:hover { background: #1b64da; }
.btn-reject { background: #f04452; color: white; } /* Toss Red */
.btn-reject:hover { background: #d31c2a; }

/* Status Pill Sync */
.status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  line-height: 1;
}
.status-pill.PENDING { background-color: #fff7ed; color: #9a3412; }
.status-pill.PENDING .status-dot { background-color: #f97316; }

.status-pill.SUBMITTED { background-color: #eff6ff; color: #1e40af; }
.status-pill.SUBMITTED .status-dot { background-color: #3b82f6; }

.status-pill.APPROVED { background-color: #f0fdf4; color: #166534; }
.status-pill.APPROVED .status-dot { background-color: #22c55e; }

.status-pill.REJECTED { background-color: #fef2f2; color: #991b1b; }
.status-pill.REJECTED .status-dot { background-color: #ef4444; }

.status-dot { width: 6px; height: 6px; border-radius: 50%; }

/* Load/Error */
.loading-state, .error-state {
  padding: 60px;
  text-align: center;
  color: #888;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  height: 200px;
}

.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleUp { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
