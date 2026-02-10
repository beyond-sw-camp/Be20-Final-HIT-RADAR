<template>
  <section class="attendance-dashboard">
    <!-- Left Column: Commute Management (1/3) -->
    <div class="dashboard-left">
      <div class="my-commute-card card premium-card">
        <div class="card-header">
          <h2>{{ userInfo?.name ? userInfo.name : '나의' }} 출퇴근</h2>
          <p class="sub-text">{{ getTodayString() }}</p>
        </div>

        <div class="card-body">
          <!-- Loading State -->
          <div v-if="loading.myStatus" class="status-loading">
            <div class="spinner"></div>
            <p>정보를 불러오는 중...</p>
          </div>

          <!-- Content State -->
          <div v-else class="commute-content">
            <!-- User Info (Always Visible) -->
            <div class="user-info-grid">
              <div class="info-item">
                <span class="label">이름</span>
                <span class="value">{{ userInfo?.name || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">부서</span>
                <span class="value">{{ userInfo?.department || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">근무 유형</span>
                <span class="value">{{ mapWorkType(clockInInfo?.workingType || initialWorkInfo?.workType) }}</span>
              </div>
              <div class="info-item">
                <span class="label">근무 장소</span>
                <span class="value">{{ mapLocation(clockInInfo?.workplace || initialWorkInfo?.workplace) }}</span>
              </div>
            </div>

            <!-- Action Area: Split Buttons -->
            <div class="action-buttons-grid">
              <!-- Left: Clock In -->
              <button 
                class="split-btn btn-in"
                :class="{ 
                  'active': clockInInfo, 
                  'inactive': !clockInInfo
                }" 
                @click="handleClockIn"
                :disabled="!!clockInInfo"
              >
                <span class="btn-content">
                  <span class="btn-title">출근하기 <span v-if="clockInInfo">✓</span></span>
                  <span class="btn-time">{{ clockInInfo ? clockInInfo.clockInTime : (lastClockInTime || '00:00') }}</span>
                </span>
              </button>

              <!-- Right: Clock Out -->
              <button 
                class="split-btn btn-out"
                :class="{ 
                  'active': !clockInInfo && lastClockOutTime, 
                  'inactive': clockInInfo || (!clockInInfo && !lastClockOutTime)
                }"
                @click="handleClockOut"
                :disabled="!clockInInfo"
              >
                <span class="btn-content">
                  <span class="btn-title">퇴근하기</span>
                  <span class="btn-time">{{ !clockInInfo && lastClockOutTime ? lastClockOutTime : '00:00' }}</span>
                </span>
              </button>
            </div>
            
            <!-- My Weekly History (Mon-Sat) -->
             <div class="weekly-history-list">
                <div class="list-header">
                  <h4>{{ getWeekRangeString() }}</h4>
                  <span class="total-hours" v-if="weeklyTotalHours">{{ weeklyTotalHours }} / {{ standardWeeklyHours }}시간</span>
                </div>
                <ul>
                  <li v-for="day in weeklyHistory" :key="day.dateStr" :class="{ 'today': day.isToday }">
                    <div class="day-info">
                      <span class="day-name">{{ day.dayName }}</span>
                      <span class="day-date">{{ day.dayNum }}</span>
                    </div>
                    <div class="work-status">
                      <span :class="['status-dot', day.statusClass]"></span>
                      <div class="work-times">
                        <span v-if="day.checkIn">{{ day.checkIn }} - {{ day.checkOut || '' }}</span>
                        <span v-else>-</span>
                      </div>
                    </div>
                    <div class="work-duration">
                      {{ day.duration || '00:00' }}
                    </div>
                  </li>
                </ul>
             </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Department Calendar (2/3) -->
    <div class="dashboard-right">
      <div class="calendar-card card">
        <div class="card-header-simple">
          <h3>근태 캘린더</h3>
        </div>
        <div class="calendar-body">
           <div v-if="loading.calendar" class="calendar-loading-overlay">
              <div class="spinner"></div>
              <span>캘린더 로딩 중...</span>
           </div>
           <FullCalendar ref="fullCalendar" :options="calendarOptions">
             <template #eventContent="arg">
               <div class="custom-event-content">
                 <div class="dot" :style="{ backgroundColor: getWorkTypeColor(arg.event.extendedProps.workType, arg.event.extendedProps.status) }"></div>
                 <div class="event-title">{{ arg.event.title }}</div>
               </div>
             </template>
           </FullCalendar>
        </div>
      </div>
    </div>

    <!-- 근무 상세 정보 모달 -->
    <AttendanceDetailModal
      :is-open="isModalOpen"
      :attendance="selectedAttendance"
      @close="isModalOpen = false"
    />
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import {
  processAttendance,
  fetchMyTodayAttendance,
  fetchAttendanceCalendar
} from '@/api/attendanceApi';
import { getMyLeaves } from '@/api/leaveApi';
import { connectSSE, disconnectSSE } from '@/api/notificationSse';

/* =====================
   기본 상태 & Auth
===================== */
const auth = useAuthStore();
const employeeId = computed(() => auth.user?.employeeId);
const departmentId = computed(() => auth.user?.departmentId);
const userInfo = computed(() => auth.user);

const loading = ref({
  myStatus: false,
  calendar: false,
  weekly: false
});

const clockInInfo = ref(null);
const lastClockInTime = ref(null); // 출근 시간 저장 (퇴근 후에도 유지)
const lastClockOutTime = ref(null); // 퇴근 시간 저장
const initialWorkInfo = ref({ workType: '-', workplace: '-' });
const weeklyHistory = ref([]); 
const weeklyTotalHours = ref('');
const standardWeeklyHours = ref(40); // SaaS-style dynamic policy

// Calendar State
const fullCalendar = ref(null);
const calendarEvents = ref([]);
const isModalOpen = ref(false);
const selectedAttendance = ref(null);


/* =====================
   유틸
===================== */
const getWorkTypeColor = (type, status) => {
  if (status === '퇴근') return '#94a3b8'; // Gray for Clocked out
  if (!type) return '#94a3b8'; // Default Gray
  if (type.includes('재택') || type === 'REMOTE') return '#10b981'; // Green
  if (type.includes('내근') || type.includes('출근') || type === 'WORK') return '#3b82f6'; // Blue
  if (type.includes('출장') || type === 'TRIP') return '#8b5cf6'; // Purple
  if (type.includes('휴가') || type === 'VACATION') return '#ef4444'; // Red
  if (type.includes('외근') || type === 'FIELD') return '#f59e0b'; // Orange
  return '#3b82f6'; // Default Blue
};

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const weekDay = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${year}.${month}.${day} (${weekDay})`;
};

const getApiDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekRangeString = () => {
  // 이번 주 월요일 ~ 일요일 구하기 (토요일까지)
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  const monday = new Date(d);
  monday.setDate(diff); // needs copy?
  // Actually simpler:
  // We need logic ONLY for display. "이번 주 근태 현황" is fine request mentioned "Mon-Sat" list display, header can stay simple?
  // Let's keep "이번 주 근태 현황"
  return "이번 주 근태 현황";
};

const extractTime = (v) => {
  if (!v) return null;
  const timeMatch = String(v).match(/(\d{2}:\d{2})/);
  return timeMatch ? timeMatch[1] : v;
};

const mapWorkType = (type) => {
    if (!type || type === '-' || type === 'WORK') return '내근';
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
    if (!loc || loc === '-') return '-';
    const mapper = {
        'OFFICE': '사무실',
        'HOME': '재택(자택)',
        'FIELD': '현장(외근)',
        'TRIP': '출장지',
        'NONE': '-'
    };
    return mapper[loc] || loc;
};

/* =====================
   FullCalendar 옵션
===================== */
const currentFromDate = ref(null);
const currentToDate = ref(null);

/* =====================
   FullCalendar 옵션
===================== */
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: calendarEvents,
  headerToolbar: {
    left: 'title prev,next today', // Title then controls
    center: '',
    right: ''
  },
  locale: 'ko',
  dayMaxEvents: 5,
  eventDidMount: function(info) {
    if (info.event.extendedProps.type) {
      info.el.classList.add('event-' + info.event.extendedProps.type);
    }
  },
  eventClick: (info) => {
    selectedAttendance.value = {
      ...info.event.extendedProps,
      workDate: info.event.startStr,
    };
    isModalOpen.value = true;
  },
  datesSet: async (dateInfo) => {
    // Store Date Range for manual refresh
    currentFromDate.value = dateInfo.startStr.substring(0, 10);
    currentToDate.value = dateInfo.endStr.substring(0, 10);

    if (departmentId.value) {
       await fetchCalendarData(currentFromDate.value, currentToDate.value);
    }
  }
});

/* =====================
   데이터 로딩
===================== */
// 1. 내 오늘 상태
const fetchMyStatus = async (showLoading = true) => {
  if (!employeeId.value) return;
  if (showLoading) loading.value.myStatus = true;
  
  try {
    const targetId = Number(employeeId.value);
    // [FIX] Use standard YYYY-MM-DD format for API
    const response = await fetchMyTodayAttendance(targetId, getApiDateString());
    const responseData = response.data?.data || response.data;
    
    if (responseData && (responseData.checkInTime || responseData.workType)) {
      lastClockInTime.value = extractTime(responseData.checkInTime);
      
      if (!responseData.checkOutTime) {
         // 출근 중
         clockInInfo.value = {
          clockInTime: extractTime(responseData.checkInTime),
          name: userInfo.value?.name || '-',
          department: userInfo.value?.department || '-',
          workingType: responseData.workType || '-',
          workplace: responseData.workPlace || 'OFFICE',
          ipAddress: responseData.ipAddress || '-',
          workDate: responseData.workDate || getTodayString(),
          overtimeStatus: responseData.overtimeStatus || '없음'
        };
      } else {
        // 퇴근 완료
        clockInInfo.value = null;
        lastClockOutTime.value = extractTime(responseData.checkOutTime);
      }
    } else {
      clockInInfo.value = null;
      lastClockInTime.value = null;
      lastClockOutTime.value = null;
      initialWorkInfo.value.workType = responseData?.workType || '-';
      initialWorkInfo.value.workplace = responseData?.workPlace || '-';
    }
    
    await fetchWeeklyHistory(); // Status fetch 후 주간 기록 갱신

  } catch (e) {
    console.error('Fetch status error:', e);
    clockInInfo.value = null;
  } finally {
    if (showLoading) loading.value.myStatus = false;
  }
};

// 2. 주간 기록 (Mon-Sat)
const fetchWeeklyHistory = async () => {
    if (!employeeId.value) return;
    
    // Calculate Mon-Sun of current week (Fetch full week)
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon
    
    const monday = new Date(d);
    monday.setDate(diff);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    const fromDate = monday.toISOString().substring(0, 10);
    const toDate = sunday.toISOString().substring(0, 10);

    try {
        const response = await fetchAttendanceCalendar({
            targetEmpId: employeeId.value,
            fromDate: fromDate,
            toDate: toDate
        });
        
        const data = response.data?.data || response.data || [];
        
        // Map to Days (Mon-Sat only)
        const days = ['월', '화', '수', '목', '금', '토']; // 일요일 제거
        const history = [];
        let totalMinutes = 0;

        for (let i = 0; i < 6; i++) {
            const currentDay = new Date(monday);
            currentDay.setDate(monday.getDate() + i);
            const dateStr = currentDay.toISOString().substring(0, 10);
            const dayNum = String(currentDay.getDate()).padStart(2, '0');
            
            const record = data.find(r => r.workDate === dateStr);
            const isToday = dateStr === getApiDateString();
            
            let statusClass = '';
            let checkIn = null;
            let checkOut = null;
            let duration = null;

            if (record) {
                checkIn = extractTime(record.checkInTime);
                checkOut = extractTime(record.checkOutTime);
                
                if (record.totalWorkMinutes > 0) {
                     const h = Math.floor(record.totalWorkMinutes / 60);
                     const m = record.totalWorkMinutes % 60;
                     duration = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
                     totalMinutes += record.totalWorkMinutes;
                }
                
                // Dot Color Logic
                if (record.status === '출근' || (checkIn && !checkOut)) statusClass = 'blue'; // Working
                else if (checkIn && checkOut) statusClass = 'blue'; // Completed
                else if (['지각', '조퇴', '결근'].includes(record.status)) statusClass = 'orange'; // Warning
                else statusClass = 'gray'; // Default/Day off
            } else {
                statusClass = 'gray';
            }

            history.push({
                dayName: days[i],
                dayNum: dayNum,
                dateStr: dateStr,
                isToday: isToday,
                checkIn: checkIn,
                checkOut: checkOut,
                duration: duration,
                statusClass: statusClass
            });
        }
        
        weeklyHistory.value = history;
        if (totalMinutes > 0) {
             const th = Math.floor(totalMinutes / 60);
             const tm = totalMinutes % 60;
             weeklyTotalHours.value = `${th}시간 ${tm}분`;
        } else {
             // 0시간이어도 표시? "0시간 0분"
            weeklyTotalHours.value = '0시간 0분';
        }

    } catch (e) {
        console.error("Weekly fetch error", e);
    }
}

// 3. 캘린더 데이터 (부서원)
const fetchCalendarData = async (startDate, endDate) => {
  if (!departmentId.value) return;

  loading.value.calendar = true;
  try {
    const [attResponse, leaveResponse] = await Promise.all([
      fetchAttendanceCalendar({
        targetDeptId: departmentId.value,
        fromDate: startDate,
        toDate: endDate
      }),
      getMyLeaves() // Fetch personal leaves
    ]);

    let events = [];
    
    // 1. Process Attendance Data
    const attData = attResponse.data?.data || attResponse.data || [];
    if (Array.isArray(attData)) {
      attData.forEach(record => {
        const date = record.workDate;
        const status = record.status || (record.totalWorkMinutes > 0 ? '퇴근' : '미출근');
        
        let title = record.empName;
        if (title.length > 8) title = title.substring(0, 8); 
        
        if (status === '퇴근') {
            title += ` (퇴근)`;
        } else if (status !== '미출근' && status !== '휴가') {
            const typeLabel = (record.workType === 'WORK' || !record.workType || record.workType === '내근') ? '내근' : mapWorkType(record.workType);
            title += ` (${typeLabel})`;
        }
    
        let durationStr = '';
        if (record.totalWorkMinutes > 0) {
           const h = Math.floor(record.totalWorkMinutes/60);
           const m = record.totalWorkMinutes%60;
           durationStr = `${h}h ${m}m`;
        }

        events.push({
          id: `dept-${record.empId}-${date}`,
          title: title,
          date: date,
          allDay: true,
          extendedProps: {
            type: 'attendance',
            employeeId: record.empId,
            employeeName: record.empName,
            deptName: record.departmentName || 'HIT',
            status: status,
            workType: record.workType,
            workPlace: record.location,
            overtimeStatus: record.overtimeStatus || '없음',
            totalWorkTime: durationStr,
            checkInTime: record.checkInTime,
            checkOutTime: record.checkOutTime
          }
        });
      });
    }

    // 2. Process Leave Data
    const leaveData = leaveResponse.data?.data || [];
    if (Array.isArray(leaveData)) {
      leaveData.filter(l => l.approvalStatus === 'APPROVED').forEach(leave => {
        // Robust date iteration
        let current = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        
        while (current <= end) {
          const y = current.getFullYear();
          const m = String(current.getMonth() + 1).padStart(2, '0');
          const d = String(current.getDate()).padStart(2, '0');
          const dateStr = `${y}-${m}-${d}`;
          
          events.push({
            id: `leave-${leave.leaveId}-${dateStr}`,
            title: `${userInfo.value?.name} (휴가)`,
            date: dateStr,
            allDay: true,
            color: '#ef4444',
            extendedProps: {
              type: 'leave',
              employeeName: userInfo.value?.name,
              status: '휴가',
              workType: 'VACATION',
              leaveType: leave.leaveType,
              reason: leave.reason
            }
          });
          current.setDate(current.getDate() + 1);
        }
      });
    }

    calendarEvents.value = events;
  } catch (e) {
    console.error('Calendar fetch error:', e);
  } finally {
    loading.value.calendar = false;
  }
};

/* =====================
   출퇴근 액션
===================== */
const handleClockIn = async () => {
  if (clockInInfo.value) return; 
  if (lastClockOutTime.value) {
    alert('이미 금일 퇴근 처리가 완료되었습니다.');
    return;
  }
  if (confirm('출근하시겠습니까?')) {
    await clockInOut();
  }
};

const handleClockOut = async () => {
  if (!clockInInfo.value) return; 
  if (confirm('퇴근하시겠습니까?')) {
    await clockInOut();
  }
};


const refreshCalendar = async () => {
    if (departmentId.value && currentFromDate.value && currentToDate.value) {
        await fetchCalendarData(currentFromDate.value, currentToDate.value);
    }
};

/* =====================
   라이프사이클
===================== */
watch([employeeId, departmentId], ([newEmp, newDept]) => {
  if (newEmp && newDept) {
    fetchMyStatus(true);
    // [FIX] Trigger calendar refresh as soon as we have IDs
    refreshCalendar();
  }
}, { immediate: true });

// Real-time update via SSE
const onNotification = (data) => {
  if (data.type === 'ATTENDANCE_CHANGED') {
    console.log('Real-time attendance update received:', data);
    
    // Refresh current user's status
    fetchMyStatus(false);
    
    // Refresh calendar
    refreshCalendar();
  }
};

onMounted(() => {
  connectSSE(onNotification);
});

onUnmounted(() => {
  disconnectSSE(onNotification);
});

// [FIX] Call refetchEvents after clock-in/out
const clockInOut = async () => {
  loading.value.myStatus = true;
  try {
    await processAttendance();

    // Refresh Status
    await fetchMyStatus(false);
    
    // [FIX] Refresh calendar immediately after action
    await refreshCalendar();

  } catch (e) {
    alert(e.response?.data?.message || '처리 중 오류가 발생했습니다.');
  } finally {
    loading.value.myStatus = false;
  }
};
</script>


<style scoped>
.attendance-dashboard {
  min-height: 100%; /* Allow growth */
  display: flex;
  gap: 24px;
  background-color: #f8fafc;
  padding: 0;
}

/* ===============================
   Left Column: My Commute (1/3)
   =============================== */
.dashboard-left {
  flex: 1; /* 1/3 비율 */
  min-width: 320px;
  max-width: 400px;
}

.my-commute-card {
  min-height: 100%; /* Allow growth */
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.premium-card {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.02);
  overflow: visible;
}

.card-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  background: linear-gradient(to bottom, #ffffff, #fafafa);
  border-radius: 20px 20px 0 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.sub-text {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.card-body {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.commute-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* User Info Grid */
.user-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  text-align: center;
}

.info-item .label { font-size: 11px; color: #94a3b8; font-weight: 600; }
.info-item .value { font-size: 13px; color: #334155; font-weight: 700; }

/* Action Buttons Grid */
.action-buttons-grid {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
    height: 120px;
}

.split-btn {
    flex: 1;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 16px;
    position: relative;
    overflow: hidden;
}

.btn-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    width: 100%;
    z-index: 2;
}

.btn-title {
    font-size: 16px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
}

.btn-time {
    font-size: 20px;
    font-weight: 400;
    opacity: 0.9;
}

/* Styles based on User Request Logic */
/* 
   - Before Clock In: Both Inactive
   - Clocked In: Left Active, Right Inactive (but clickable)
   - Clocked Out: Left Inactive, Right Active (showing Out time)
   
   CSS Classes:
   .btn-in.active (Blue)
   .btn-in.inactive (Gray, default)
   .btn-out.active (Blue)
   .btn-out.inactive (Gray, default)
*/

.split-btn.active {
    background-color: #3b82f6; 
    color: white;
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.split-btn.inactive {
    background-color: #f1f5f9; /* Light Gray */
    color: #94a3b8; /* Dim text */
    box-shadow: none;
}
.split-btn.inactive:hover:not(:disabled) {
    background-color: #e2e8f0;
    color: #64748b;
}

/* User asked for "Left bright if In, Right inactive" */
/* and "Before In, both off" */

/* Weekly History List */
.weekly-history-list {
    margin-top: auto;
    border-top: 1px solid #f1f5f9;
    padding-top: 20px;
    padding-bottom: 24px; /* Prevent bottom cutoff */
    flex-grow: 1;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}
.list-header h4 {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
    margin: 0;
}
.total-hours {
    font-size: 12px;
    color: #3b82f6;
    font-weight: 600;
}

.weekly-history-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.weekly-history-list li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 4px;
    border-bottom: 1px solid #f8fafc;
    font-size: 13px;
    color: #475569;
}

.weekly-history-list li.today {
    background-color: #f8faff;
    border-radius: 12px;
    padding: 12px;
    margin: 4px 0;
    box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.1);
}

.day-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 30px;
}
.day-name { font-size: 12px; color: #334155; font-weight: 700; }
.day-date { font-size: 14px; color: #1e293b; font-weight: 700; margin-top: 2px; }

.work-status {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    min-width: 0; /* Allow shrinking */
}
.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
/* Explicitly link to status-dot to satisfy linter and preserve dynamic classes */
.status-dot.blue { background-color: #3b82f6; }
.status-dot.orange { background-color: #f97316; }
.status-dot.gray { background-color: #e2e8f0; }

.work-times {
    font-size: 13px;
    color: #475569;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.work-duration {
    font-size: 13px;
    color: #3182f6;
    font-weight: 700;
    width: 60px;
    text-align: right;
    flex-shrink: 0;
}


/* ===============================
   Right Column: Calendar (2/3)
   =============================== */
.dashboard-right {
  flex: 2; /* 2/3 비율 */
  min-width: 0; /* Flex overflow 방지 */
}

.calendar-card {
  height: 100%;
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.card-header-simple {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}

.card-header-simple h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.calendar-body {
  padding: 20px;
  flex-grow: 1;
  position: relative;
  overflow-y: auto;
}

.calendar-loading-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  gap: 10px;
  color: #64748b;
  font-size: 14px;
}

.spinner {
  width: 24px; height: 24px;
  border: 3px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* FullCalendar Customization */
:deep(.fc-header-toolbar) {
  margin-bottom: 1.5rem !important;
  display: flex;
  justify-content: flex-start; /* Align Left */
  gap: 20px;
}

:deep(.fc-toolbar-chunk) {
    display: flex;
    align-items: center;
    gap: 10px;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem !important;
  font-weight: 700;
  color: #334155;
}

:deep(.fc-button-primary) {
  background-color: #f1f5f9;
  border: none;
  color: #475569;
  font-weight: 600;
  box-shadow: none;
  padding: 6px 12px;
}

:deep(.fc-button-primary):hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

:deep(.fc-button-active) {
  background-color: #e2e8f0 !important;
  color: #1e293b !important;
}

:deep(.fc-daygrid-day-number) {
  color: #64748b;
  font-size: 13px;
  text-decoration: none;
}

:deep(.fc-col-header-cell-cushion) {
  color: #334155; /* Darker Slate */
  font-size: 13px;
  font-weight: 800; /* Extra Bold */
  text-transform: uppercase;
  opacity: 1;
}

:deep(.fc-event) {
  border: none;
  border-radius: 4px;
  font-size: 11px;
  margin-bottom: 2px;
  cursor: pointer;
  background-color: transparent !important;
  padding: 0;
}

:deep(.fc-daygrid-event-harness) {
    margin-bottom: 2px;
}

/* Hide default dot if any */
:deep(.fc-daygrid-event-dot) {
    display: none;
}

/* Custom Event Content */
.custom-event-content {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.custom-event-content:hover {
    background-color: #f1f5f9;
}

.dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.event-title {
    font-size: 12px;
    font-weight: 800; /* Extra Bold as requested */
    color: #1e293b; /* Dark Slate */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
