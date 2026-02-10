<template>
  <section class="page">
    <!-- 상단 정보 영역 -->
    <div class="user-info-header">
      <div class="user-details">
        <h2>{{ userInfo.name }}님 ({{ userInfo.department }})</h2>
      </div>
    </div>

    <!-- 연차 현황 -->
    <div class="stats-container">
      <div class="stats-header">
        <h3>{{ targetYear }}년도 연차 현황</h3>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ leaveStats.granted }}일</div>
        <div class="stat-label">부여받은 연차</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ leaveStats.used }}일</div>
        <div class="stat-label">사용 연차</div>
      </div>
      <div class="stat-card">
        <div class="stat-value stat-important">{{ leaveStats.remaining }}일</div>
        <div class="stat-label">잔여 연차</div>
      </div>
    </div>

    <!-- 연차 신청 버튼 -->
    <div class="apply-button-container">
      <button @click="openApplyModal" class="btn-apply">휴가 신청하기</button>
    </div>

    <!-- 개인 연차 사용 기록 -->
    <div class="history-card">
        <h2>개인 연차 사용 기록</h2>
        <div class="leave-table-container">
            <table class="leave-table">
            <thead>
                <tr>
                <th>신청일시</th>
                <th>휴가 종류</th>
                <th>기간</th>
                <th>사유</th>
                <th>결재결과</th>
                <th>차감일수</th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="isLoading">
                    <td colspan="6" class="loading-state">데이터를 불러오는 중입니다...</td>
                </tr>
                <tr v-else-if="leaves.length === 0">
                    <td colspan="6" class="empty-state">휴가 신청 내역이 없습니다.</td>
                </tr>
                <tr v-else v-for="leave in leaves" :key="leave.leaveId">
                <td>{{ formatDateTime(leave.requestedAt) }}</td>
                <td>{{ leave.leaveType }}</td>
                <td>{{ leave.startDate }} ~ {{ leave.endDate }}</td>
                <td class="reason-cell">{{ leave.reason }}</td>
                <td>
                    <span :class="['badge', getStatusBadgeClass(leave.approvalStatus)]">
                        {{ getStatusLabel(leave.approvalStatus) }}
                    </span>
                </td>
                <td>{{ leave.leaveDays }}일</td>
                </tr>
            </tbody>
            </table>
        </div>
    </div>

    <!-- 휴가 신청 모달 -->
    <LeaveApplyModal 
      v-if="isApplyModalOpen" 
      :available-grants="availableGrants"
      @close="closeApplyModal" 
      @submitted="reloadData" 
    />

  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { getMyLeaves, getMyLeaveGrants } from '@/api/leaveApi';
import LeaveApplyModal from '@/components/leave/LeaveApplyModal.vue';

const authStore = useAuthStore();
const leaves = ref([]);
const availableGrants = ref([]);
const isLoading = ref(true);
const isApplyModalOpen = ref(false);

const userInfo = ref({
  name: authStore.user?.name || '홍길동',
  department: authStore.user?.departmentName || '개발팀',
});

// TODO: The backend does not provide a summary. This is calculated on the frontend.
// This requires fetching all grants for the user, which is also not available.
// Mocking data for now.
const leaveStats = computed(() => {
    const totalGranted = availableGrants.value.reduce((sum, grant) => sum + grant.totalDays, 0);
    const totalUsed = leaves.value
        .filter(l => l.approvalStatus === 'APPROVED')
        .reduce((sum, leave) => sum + leave.leaveDays, 0);
    
    return {
        granted: totalGranted,
        used: totalUsed,
        remaining: totalGranted - totalUsed,
    }
});

const targetYear = computed(() => {
    // Default to the current year (2026)
    return new Date().getFullYear();
});


const reloadData = async () => {
  isLoading.value = true;
  try {
    // 1. Fetch Grants
    const grantsResponse = await getMyLeaveGrants();
    availableGrants.value = grantsResponse.data.data || [];

    // 2. Fetch Leave History
    const leavesResponse = await getMyLeaves();
    leaves.value = leavesResponse.data.data || [];

  } catch (error) {
    console.error('데이터 로딩 중 오류 발생:', error);
    alert('데이터를 불러오는 데 실패했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const openApplyModal = () => {
  isApplyModalOpen.value = true;
};

const closeApplyModal = () => {
  isApplyModalOpen.value = false;
};

const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('ko-KR');
}

const getStatusLabel = (status) => {
    const labels = {
        'DRAFT': '임시저장',
        'IN_PROGRESS': '상신',
        'APPROVED': '승인',
        'REJECTED': '반려',
        'WITHDRAWN': '회수'
    };
    return labels[status] || status || '-';
}

const getStatusBadgeClass = (status) => {
    const classes = {
        'APPROVED': 'badge-green',
        'REJECTED': 'badge-red',
        'IN_PROGRESS': 'badge-blue', 
        'DRAFT': 'badge-gray',
        'WITHDRAWN': 'badge-yellow'
    };
    return classes[status] || 'badge-gray';
}


onMounted(reloadData);
</script>

<style scoped>
.page {
  padding: 2rem 3rem;
  background-color: #f8f9fa;
}

.user-info-header {
  margin-bottom: 2rem;
}
.user-details h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
.user-details p {
  font-size: 1rem;
  color: #6c757d;
  margin-top: 0.5rem;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.25rem;
  background-color: #ffffff;
}

.stats-header {
  grid-column: 1 / -1;
  margin-bottom: 0.25rem;
}

.stats-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.stat-card {
  background: #f8f9fa; 
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  border: 1px solid #f3f4f6;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
}
.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.5rem;
}
.stat-important {
  color: #4f46e5;
}

.apply-button-container {
  text-align: center;
  margin-bottom: 2.5rem;
}
.btn-apply {
  background-color: #4f46e5;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  padding: 0.8rem 2.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}
.btn-apply:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
}

.history-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e5e7eb;
}
.history-card h2 {
    font-size: 1.25rem;
    font-weight: 700; /* Increased from 600 */
    color: #111827; /* Darker navy */
    margin-bottom: 1.5rem;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 3rem 0;
  color: #6b7280;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.leave-table th, .leave-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #e9ecef;
  font-size: 0.9rem;
  vertical-align: middle;
  color: #111827; /* Darker from #1f2937 */
}
.leave-table th {
  font-weight: 700; /* Increased from 600 */
  background-color: #f8f9fa;
  color: #111827; /* Darker from #4b5563 */
}
.reason-cell {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-blue { background-color: #e0e7ff; color: #3730a3; }
.badge-green { background-color: #d1fae5; color: #065f46; }
.badge-red { background-color: #fee2e2; color: #991b1b; }
.badge-gray { background-color: #f3f4f6; color: #4b5563; }
</style>