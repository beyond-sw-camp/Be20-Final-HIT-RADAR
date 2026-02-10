<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <Transition name="slide-up">
        <div v-if="isOpen" class="modal-card">
          <div class="modal-header">
            <h3>근무 상세 정보</h3>
            <button class="btn-close" @click="close">✕</button>
          </div>
          
          <div class="modal-body">
            <!-- 프로필 섹션 -->
            <div class="profile-section">
              <div class="profile-icon">
                {{ getProfileIconText(attendance) }}
              </div>
              <div class="name-value">{{ attendance?.employeeName }}</div>
              <div class="dept-value">{{ attendance?.deptName || 'HIT' }}</div>
            </div>

            <div class="divider"></div>

            <!-- 정보 리스트 -->
            <div class="info-row">
              <span class="info-label">근무 날짜</span>
              <span class="info-value">{{ attendance?.workDate }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">부서</span>
              <span class="info-value">{{ attendance?.deptName || '-' }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">상태</span>
              <span :class="['status-badge', getStatusClass(attendance?.status)]">
                {{ attendance?.status || '미출근' }}
              </span>
            </div>

            <div class="info-row">
              <span class="info-label">근무 장소</span>
              <span class="info-value">{{ mapLocation(attendance?.workPlace || attendance?.workplace || attendance?.location) }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">근무 유형</span>
              <span class="info-value">{{ mapWorkType(attendance?.workType || attendance?.workingType) }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">출근 시간</span>
              <span class="info-value">{{ formatTime(attendance?.clockInTime || attendance?.checkInTime) }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">퇴근 시간</span>
              <span class="info-value">{{ formatTime(attendance?.clockOutTime || attendance?.checkOutTime) }}</span>
            </div>
            <div class="info-row" v-if="attendance?.reason">
              <span class="info-label">사유</span>
              <span class="info-value">{{ attendance.reason }}</span>
            </div>
            
            <div class="info-row" v-if="attendance?.totalWorkTime">
              <span class="info-label">총 근무시간</span>
              <span class="info-value">{{ attendance.totalWorkTime }}</span>
            </div>

            <div class="info-row" v-if="attendance?.overtimeMinutes > 0">
              <span class="info-label">인정된 초과근무</span>
              <span class="info-value highlight-red">{{ attendance.overtimeMinutes }}분</span>
            </div>
            
            <div class="info-row" v-if="attendance?.overtimeStatus">
              <span class="info-label">초과근무 여부</span>
              <span class="info-value" :class="{'highlight-red': attendance.overtimeStatus === '발생'}">
                  {{ attendance.overtimeStatus }}
              </span>
            </div>

          </div>

          <div class="modal-footer">
            <button class="btn-confirm" @click="close">확인</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  isOpen: Boolean,
  attendance: Object
});

const emit = defineEmits(['close']);

const close = () => {
  emit('close');
};

const getProfileIconText = () => {
    return 'HIT';
};

const getStatusClass = (status) => {
  if (!status) return 'default';
  if (status.includes('휴가')) return 'leave';
  if (status.includes('출근')) return 'working';
  if (status.includes('병가')) return 'sick';
  if (status.includes('반차')) return 'half-leave';
  return 'default';
};

const mapWorkType = (type) => {
    if (!type) return '-';
    const mapper = {
        'WORK': '내근',
        'REMOTE': '재택',
        'FIELD': '외근',
        'TRIP': '출장',
        'VACATION': '휴가'
    };
    return mapper[type] || type;
};

const mapLocation = (loc) => {
    if (!loc) return '-';
    const mapper = {
        'OFFICE': '사무실',
        'HOME': '재택(자택)',
        'FIELD': '현장(외근)',
        'TRIP': '출장지',
        'NONE': '-'
    };
    return mapper[loc] || loc;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '-';
  // Check if it's already a simple time format HH:mm
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr + ':00';
  
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) {
      // If not a valid date, try regex extraction
      const match = String(timeStr).match(/(\d{2}:\d{2}:\d{2})/);
      return match ? match[1] : timeStr;
    }
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  } catch {
    return timeStr;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6); /* 조금 더 진한 배경 */
  backdrop-filter: blur(8px);      /* 블러 효과 강화 */
  display: flex;
  align-items: center; /* 중앙 정렬 (PC 기준) */
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-card {
  background: #ffffff;
  width: 100%;
  max-width: 380px; /* 모바일 친화적인 폭 */
  border-radius: 28px; /* 더 둥글게 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  padding: 32px 28px;
  box-sizing: border-box;
  transform-origin: center bottom;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 22px;
  font-weight: 800;
  color: #191f28; /* Toss Black */
  margin: 0;
  letter-spacing: -0.5px;
}

.btn-close {
  background: #f2f4f6;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #4e5968;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #e5e8eb;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  max-height: 70vh; /* Increased from 60vh for more vertical space */
  padding-right: 12px; /* More space between content and scrollbar */
  padding-bottom: 20px; /* Extra room at the bottom */
}

/* 프로필 영역 강조 */
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 10px;
}

.profile-icon {
  width: 60px;
  height: 60px;
  background: #e8f3ff;
  color: #3182f6;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px; /* Text size */
  font-weight: 700;
  margin-bottom: 16px;
}

.name-value {
  font-size: 24px;
  font-weight: 700;
  color: #191f28;
  margin-bottom: 6px;
}

.dept-value {
  font-size: 15px;
  color: #8b95a1;
  font-weight: 500;
}

.divider {
  height: 1px;
  background: #f2f4f6;
  margin: 10px 0;
}

/* 정보 그리드 */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.info-label {
  font-size: 15px;
  color: #8b95a1;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #333d4b;
  font-weight: 600;
}

.highlight-red {
    color: #e94949;
}

/* 상태 뱃지 스타일 개선 */
.status-badge {
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
}

.status-badge.working { background: #e8f3ff; color: #3182f6; } /* Toss Blue */
.status-badge.leave { background: #fff1f1; color: #e94949; }   /* Toss Red-ish */
.status-badge.sick { background: #fffcf0; color: #ffb121; }    /* Warning */
.status-badge.half-leave { background: #f3f0ff; color: #7f52ff; }
.status-badge.default { background: #f2f4f6; color: #4e5968; }

.modal-footer {
  margin-top: 36px;
}

.btn-confirm {
  width: 100%;
  padding: 18px;
  background: #3182f6;
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, background 0.2s;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.2);
}

.btn-confirm:hover {
  background: #1b64da;
}

.btn-confirm:active {
  transform: scale(0.98);
}

/* Animation */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(40px) scale(0.95);
  opacity: 0;
}
</style>
