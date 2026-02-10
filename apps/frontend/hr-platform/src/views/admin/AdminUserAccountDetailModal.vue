<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      
      <div class="modal-content" v-if="detail">
        <div class="modal-header">
          <div class="header-left">
            <h2>사용자 계정 상세</h2>
            <span :class="['status-pill', detail.status]">
              <span class="status-dot"></span>
              {{ detail.status }}
            </span>
          </div>
          <button class="btn-close" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body custom-scrollbar">
          <!-- ... body content ... -->
          <div class="info-section">
            <h3>계정 정보</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="label">이름</span>
                <span class="value">{{ detail.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">로그인 ID</span>
                <span class="value">
                  {{ detail.loginId || hiddenLoginId }}
                  <button v-if="!detail.loginId && !hiddenLoginId" @click="loadLoginId" class="btn-sm-text">
                    확인
                  </button>
                </span>
              </div>
              <div class="info-row">
                <span class="label">이메일</span>
                <span class="value">{{ detail.email }}</span>
              </div>
              <div class="info-row">
                <span class="label">역할(Role)</span>
                <span class="value">{{ detail.role }}</span>
              </div>
              <div class="info-row">
                <span class="label">비밀번호</span>
                <span class="value">
                  <button @click="handleResetPassword" class="btn-reset-password" title="비밀번호를 1234로 초기화">
                    <i class="pi pi-refresh"></i> 비밀번호 초기화
                  </button>
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
             <h3>소속 정보</h3>
             <div class="info-list">
               <div class="info-row">
                 <span class="label">사원 번호</span>
                 <span class="value">{{ detail.empId }}</span>
               </div>
               <div class="info-row">
                 <span class="label">회사 코드</span>
                 <span class="value">{{ detail.comCode }}</span>
               </div>
             </div>
          </div>

        </div>
      </div>
      
      <div v-else class="loading-state">
        <div class="loading-spinner"></div>
        <p>데이터를 불러오는 중...</p>
        <button class="btn-close-abs" @click="$emit('close')">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { fetchUserAccountDetail, fetchAdminLoginId, resetUserPassword } from '@/api/userAccount'

const props = defineProps({
  accId: { type: [Number, String], required: true }
})
const emit = defineEmits(['close', 'refresh'])

const detail = ref(null)
const hiddenLoginId = ref('')

const loadDetail = async () => {
  if (!props.accId) return
  try {
    const res = await fetchUserAccountDetail(props.accId)
    detail.value = res.data.data
  } catch (e) {
    console.error(e)
    alert('상세 정보를 불러오지 못했습니다.')
    emit('close')
  }
}

const loadLoginId = async () => {
  try {
    const res = await fetchAdminLoginId(props.accId)
    hiddenLoginId.value = res.data.data.loginId
  } catch (e) {
    console.error(e)
    alert('로그인 ID 조회를 실패했습니다.')
  }
}

const handleResetPassword = async () => {
  if (!confirm(`${detail.value.name} 님의 비밀번호를 초기화하시겠습니까?\n초기화 비밀번호: 1234`)) {
    return
  }

  try {
    await resetUserPassword(props.accId)
    alert('✅ 비밀번호가 "1234"로 초기화되었습니다.\n사용자에게 변경을 안내해주세요.')
    emit('refresh')
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.message || '비밀번호 초기화에 실패했습니다.'
    alert(`❌ ${errorMsg}`)
  }
}

onMounted(() => {
  loadDetail()
})
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
  width: 500px;
  max-width: 90%;
  max-height: 85vh;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  user-select: none;
}

/* Header with Flexbox to avoid overlap */
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

/* Absolute close button for loading state */
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
  background: #f9f9fb30;
  border-radius: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  display: flex; align-items: center; gap: 6px; justify-content: flex-end;
}

.btn-sm-text {
  background: none; border: 1px solid #ddd;
  border-radius: 4px; padding: 2px 6px;
  font-size: 11px; cursor: pointer; color: #666;
}
.btn-sm-text:hover { background: #f0f0f0; }

.btn-reset-password {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-reset-password:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}
.btn-reset-password:active {
  transform: translateY(0);
}
.btn-reset-password i {
  font-size: 13px;
}

/* Status Pill - Matching List View */
.status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  background: #f3f4f6; color: #4b5563;
}
.status-pill.ACTIVE { background: #ecfdf5; color: #059669; }
.status-pill.ACTIVE .status-dot { background: #10b981; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; }

.loading-state {
  padding: 60px;
  text-align: center;
  color: #888;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
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
