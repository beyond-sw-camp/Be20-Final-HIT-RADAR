<template>
  <section class="attendance-employee-detail-view">
    <!-- ===================== 헤더 ===================== -->
    <div class="view-header">
      <div class="title-group">
        <h1>사원 근태 상세 조회</h1>
      </div>
    </div>

    <!-- ===================== 본문 ===================== -->
    <div class="detail-container card">
      <!-- 로딩 상태 -->
      <p v-if="loading">로딩 중...</p>

      <!-- 데이터 없음 -->
      <p v-else-if="!attendanceDetail">근태 데이터가 없습니다.</p>

      <!-- ===================== [1] 상단 요약 영역 ===================== -->
      <section v-else class="summary-section">
        <h2>기본 정보</h2>
        <ul>
          <li><strong>사원명:</strong> {{ attendanceDetail.empName }}</li>
          <li><strong>사원 ID:</strong> {{ attendanceDetail.empId }}</li>
          <li><strong>근태 ID:</strong> {{ attendanceDetail.attendanceId }}</li>
          <li><strong>근무일자:</strong> {{ attendanceDetail.workDate }}</li>
          <li><strong>근태 상태:</strong> {{ attendanceDetail.status }}</li>
        </ul>
      </section>

      <!-- ===================== [2] 출퇴근 요약 ===================== -->
      <section class="check-summary-section">
        <h2>출퇴근 요약</h2>
        <ul>
          <li>
            <strong>출근 시각:</strong>
            {{ attendanceDetail.checkInTime ?? '-' }}
          </li>
          <li>
            <strong>퇴근 시각:</strong>
            {{ attendanceDetail.checkOutTime ?? '-' }}
          </li>
          <li>
            <strong>총 근무 시간:</strong>
            {{ attendanceDetail.totalWorkMinutes }} 분
          </li>
        </ul>
      </section>

      <!-- ===================== [3] 타임라인 (핵심) ===================== -->
      <section class="timeline-section">
        <h2>근무 타임라인</h2>

        <ul v-if="attendanceDetail.timeline?.length">
          <li
            v-for="item in attendanceDetail.timeline"
            :key="item.workLogId"
            class="timeline-item"
          >
            <div class="timeline-type">
              {{ item.type }}
            </div>
            <div class="timeline-time">
              {{ item.startAt }}
              ~
              {{ item.endAt ?? '진행중' }}
            </div>
            <div class="timeline-location" v-if="item.location">
              📍 {{ item.location }}
            </div>
          </li>
        </ul>

        <p v-else>타임라인 기록이 없습니다.</p>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { fetchAttendanceDetail } from '@/api/attendanceApi';

// ===================== router =====================
const route = useRoute();

// ===================== state =====================
const attendanceDetail = ref(null);
const loading = ref(false);

// ===================== derived params =====================
const employeeId = route.params.empId;
const workDate = route.query.date;

// ===================== lifecycle =====================
onMounted(async () => {
  if (!employeeId || !workDate) {
    console.error('empId 또는 workDate 누락');
    return;
  }

  loading.value = true;
  try {
    const response = await fetchAttendanceDetail({
      targetEmpId: Number(employeeId),
      workDate: workDate // YYYY-MM-DD
    });

    attendanceDetail.value = response.data;
  } catch (e) {
    console.error('근태 상세 조회 실패', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.attendance-employee-detail-view {
  padding: 16px;
}
.view-header {
  margin-bottom: 20px;
}
.title-group h1 {
  font-size: 24px;
  font-weight: 700;
}
.title-group .sub {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}
.detail-container {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 20px;
}
</style>
