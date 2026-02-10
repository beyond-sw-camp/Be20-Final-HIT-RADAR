<template>
  <section class="attendance-dashboard">
    <!-- Left Column: Filters and Legends (1/3) -->
    <div class="dashboard-left">
      <div class="filter-card card premium-card">
        <div class="card-header">
          <h2>부서 근태 필터</h2>
          <button class="btn-icon-only" @click="refreshCalendar" title="새로고침">
            <i class="icon-refresh"></i>
          </button>
        </div>

        <div class="card-body">
          <div class="filter-group">
            <div class="filter-item">
              <label>부서 선택</label>
              <select v-model="selectedDepartmentId" class="select-field">
                <option v-for="dept in departmentOptions" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>

            <div class="filter-item">
              <label>사원 필터</label>
              <select v-model="selectedEmployeeId" class="select-field" :disabled="!selectedDepartmentId">
                <option value="">전체 사원</option>
                <option v-for="emp in employeeOptions" :key="emp.id" :value="emp.id">
                  {{ emp.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="category-filter-section">
            <div class="section-title">
              <label>근무 유형 카테고리</label>
              <button class="btn-text-only" @click="toggleAllFilters">
                {{ selectedFilters.length === workTypes.length ? '전체 해제' : '전체 선택' }}
              </button>
            </div>

            <div class="category-list">
              <label v-for="type in workTypes" :key="type.key"
                     class="category-item"
                     :class="{ 'active': selectedFilters.includes(type.key) }">
                <input type="checkbox" :value="type.key" v-model="selectedFilters" class="hidden-checkbox" />
                <span class="category-dot" :style="{ backgroundColor: type.color }"></span>
                <span class="category-label">{{ type.label }}</span>
                <span class="check-mark" v-if="selectedFilters.includes(type.key)">✓</span>
              </label>
            </div>
          </div>

          <!-- Summary Info or Tips can go here -->
          <div class="info-tips">
            <p class="tip-text">부서원들의 근태 현황을 한눈에 파악하고 필터를 통해 상세 조회가 가능합니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Calendar (2/3) -->
    <div class="dashboard-right">
      <div class="calendar-card card">
        <div class="calendar-body">
          <div v-if="loading" class="calendar-loading-overlay">
            <div class="spinner"></div>
            <span>캘린더 로딩 중...</span>
          </div>
          <FullCalendar ref="fullCalendar" :options="calendarOptions">
            <template #eventContent="arg">
              <div class="custom-event-content">
                <div class="dot" :style="{ backgroundColor: getEventColor(arg.event.extendedProps.workType) }"></div>
                <div class="event-title">{{ arg.event.title }}</div>
              </div>
            </template>
          </FullCalendar>
        </div>
      </div>
    </div>

    <!-- Attendance Detail Modal -->
    <AttendanceDetailModal
      :is-open="isModalOpen"
      :attendance-detail="selectedAttendance"
      @close="isModalOpen = false"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import bootstrap5Plugin from '@fullcalendar/bootstrap5';
import AttendanceDetailModal from '@/components/attendance/AttendanceDetailModal.vue';
import { useAuthStore } from '@/stores/authStore';
import { getAllDepartmentsByCompany, getDepartmentMembers } from '@/api/departmentApi';
import { fetchAttendanceCalendar } from '@/api/attendanceApi';
import { getDepartmentLeaves } from '@/api/leaveApi';

const auth = useAuthStore();
const companyId = computed(() => auth.user?.companyId);

const fullCalendar = ref(null);
const isModalOpen = ref(false);
const selectedAttendance = ref(null);
const loading = ref(false);

const departmentOptions = ref([]);
const employeeOptions = ref([]);
const selectedDepartmentId = ref(auth.user?.departmentId || '');
const selectedEmployeeId = ref('');

const workTypes = [
  { key: 'OFFICE', label: '내근', color: '#3b82f6' },
  { key: 'REMOTE', label: '재택', color: '#8b5cf6' },
  { key: 'FIELD', label: '외근', color: '#10b981' },
  { key: 'TRIP', label: '출장', color: '#f59e0b' },
  { key: 'VACATION', label: '휴가', color: '#ef4444' }
];

const selectedFilters = ref(workTypes.map(t => t.key));
const rawEvents = ref([]);

// 캘린더 옵션 - ref로 관리하되 변경 시 업데이트
const calendarOptions = ref({
  plugins: [dayGridPlugin, interactionPlugin, bootstrap5Plugin],
  initialView: 'dayGridMonth',
  events: [],
  headerToolbar: {
    left: 'title prev,next today',
    center: '',
    right: ''
  },
  locale: 'ko',
  dayMaxEvents: 5,
  eventClick: (info) => {
    selectedAttendance.value = {
      ...info.event.extendedProps,
      workDate: info.event.startStr,
    };
    isModalOpen.value = true;
  },
  datesSet: async (dateInfo) => {
    if (selectedDepartmentId.value) {
      await fetchCalendarEvents(dateInfo.startStr.substring(0, 10), dateInfo.endStr.substring(0, 10));
    }
  }
});

const fetchDepartments = async () => {
  try {
    const response = await getAllDepartmentsByCompany(companyId.value);
    if (response.data && response.data.success) {
      departmentOptions.value = response.data.data.departments.map(d => ({
        id: d.deptId,
        name: d.deptName
      }));

      if (!selectedDepartmentId.value && departmentOptions.value.length > 0) {
        selectedDepartmentId.value = departmentOptions.value[0].id;
      }
    }
  } catch (error) {
    console.error("Failed to fetch departments:", error);
  }
};

const fetchEmployees = async (deptId) => {
  if (!deptId) return;
  try {
    const response = await getDepartmentMembers(deptId);
    if (response.data && response.data.success) {
      const memberList = response.data.data.employees || response.data.data || [];
      if (Array.isArray(memberList)) {
        employeeOptions.value = memberList.map(m => ({
          id: m.empId || m.employeeId,
          name: m.name
        })).sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  } catch (error) {
    console.error("Failed to fetch department members:", error);
  }
};

const fetchCalendarEvents = async (startDate, endDate) => {
  if (!selectedDepartmentId.value) return;

  loading.value = true;
  try {
    const [attResponse, leaveResponse] = await Promise.all([
      fetchAttendanceCalendar({
        targetDeptId: selectedDepartmentId.value,
        fromDate: startDate,
        toDate: endDate
      }),
      getDepartmentLeaves()
    ]);

    const events = [];
    const attData = attResponse.data?.data || attResponse.data || [];
    const leaveData = leaveResponse.data?.data || leaveResponse.data || [];

    // Selected Department for client-side filtering of leaves
    const selectedDept = departmentOptions.value.find(d => d.id === selectedDepartmentId.value);

    if (Array.isArray(attData)) {
      attData.forEach(r => {
        events.push({
          id: `att-${r.empId}-${r.workDate}`,
          title: `${r.empName} (${r.status})`,
          start: r.workDate,
          backgroundColor: getEventColor(r.workType),
          borderColor: getEventColor(r.workType),
          extendedProps: {
            employeeId: r.empId,
            employeeName: r.empName,
            workType: r.workType || 'OFFICE',
            status: r.status,
            checkIn: r.checkInTime,
            checkOut: r.checkOutTime
          }
        });
      });
    }

    if (Array.isArray(leaveData)) {
      leaveData.forEach(l => {
        // Filter by department if possible (via departmentName match if deptId not in DTO)
        if (selectedDept && l.departmentName && l.departmentName !== selectedDept.name) {
          return;
        }

        events.push({
          id: `leave-${l.leaveId}`,
          title: `[휴가] ${l.empName}`,
          start: l.startDate,
          end: l.endDate,
          allDay: true,
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          extendedProps: {
            employeeId: l.empId,
            employeeName: l.empName,
            workType: 'VACATION',
            status: '휴가'
          }
        });
      });
    }

    rawEvents.value = events;
    updateFilteredEvents();
  } catch (error) {
    console.error("Failed to fetch calendar data:", error);
  } finally {
    loading.value = false;
  }
};

const updateFilteredEvents = () => {
  let result = rawEvents.value;

  // 1. Employee Dropdown Filter
  if (selectedEmployeeId.value) {
    result = result.filter(e => String(e.extendedProps.employeeId) === String(selectedEmployeeId.value));
  }

  // 2. Type Filter
  result = result.filter(e => {
    const typeStr = String(e.extendedProps.workType || '').toUpperCase();
    let key = 'OFFICE';

    if (typeStr.includes('재택') || typeStr.includes('REMOTE')) key = 'REMOTE';
    else if (typeStr.includes('외근') || typeStr.includes('FIELD')) key = 'FIELD';
    else if (typeStr.includes('출장') || typeStr.includes('TRIP')) key = 'TRIP';
    else if (typeStr.includes('휴가') || typeStr.includes('VACATION')) key = 'VACATION';
    else if (typeStr.includes('내근') || typeStr.includes('출근') || typeStr.includes('WORK')) key = 'OFFICE';

    return selectedFilters.value.includes(key);
  });

  calendarOptions.value.events = result;
};

// Re-fetch when department changes
watch(selectedDepartmentId, async (newVal) => {
  if (newVal) {
    await fetchEmployees(newVal);
    selectedEmployeeId.value = '';
    refreshCalendar();
  }
});

// Filter dynamically
watch([selectedEmployeeId, selectedFilters], () => {
  updateFilteredEvents();
}, { deep: true });

const refreshCalendar = () => {
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    // This will trigger datesSet, which in turn calls fetchCalendarEvents
    calendarApi.refetchEvents();
  }
};

const getEventColor = (workType) => {
  const type = String(workType || '').toUpperCase();
  if (type.includes('재택') || type.includes('REMOTE')) return '#8b5cf6';
  if (type.includes('외근') || type.includes('FIELD')) return '#10b981';
  if (type.includes('출장') || type.includes('TRIP')) return '#f59e0b';
  if (type.includes('휴가') || type.includes('VACATION')) return '#ef4444';
  return '#3b82f6'; // Default Blue
};

const toggleAllFilters = () => {
  if (selectedFilters.value.length === workTypes.length) {
    selectedFilters.value = [];
  } else {
    selectedFilters.value = workTypes.map(t => t.key);
  }
};

onMounted(async () => {
  await fetchDepartments();
  if (selectedDepartmentId.value) {
    await fetchEmployees(selectedDepartmentId.value);
  }
});
</script>

<style scoped>
.attendance-dashboard {
  min-height: 100%;
  display: flex;
  gap: 24px;
  background-color: #f8fafc;
  padding: 0;
}

/* ===============================
   Left Column: Filters (1/3)
   =============================== */
.dashboard-left {
  flex: 1;
  min-width: 320px;
  max-width: 400px;
}

.filter-card {
  min-height: 100%;
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

.btn-icon-only {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon-only:hover {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.card-body {
  padding: 24px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-item label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.select-field {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-size: 14px;
  color: #1e293b;
  background-color: #f8fafc;
  transition: all 0.2s;
}

.select-field:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: #fff;
}

.category-filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.btn-text-only {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f8fafc;
  border: 1px solid transparent;
}

.category-item:hover {
  background-color: #f1f5f9;
}

.category-item.active {
  background-color: #eff6ff;
  border-color: rgba(59, 130, 246, 0.2);
}

.hidden-checkbox {
  display: none;
}

.category-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.category-label {
  font-size: 13px;
  font-weight: 500;
  color: #334155;
  flex-grow: 1;
}

.check-mark {
  color: #3b82f6;
  font-weight: 700;
  font-size: 14px;
}

.info-tips {
  margin-top: auto;
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 12px;
  border: 1px dashed #bae6fd;
}

.tip-text {
  font-size: 12px;
  color: #0369a1;
  line-height: 1.5;
  margin: 0;
}

/* ===============================
   Right Column: Calendar (2/3)
   =============================== */
.dashboard-right {
  flex: 2;
  min-width: 0;
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

.calendar-body {
  padding: 24px;
  flex-grow: 1;
  position: relative;
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
  margin-bottom: 24px !important;
  display: flex;
  justify-content: flex-start;
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
  padding: 8px 16px;
  border-radius: 8px !important;
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
  padding: 8px !important;
}

:deep(.fc-col-header-cell-cushion) {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 12px 0 !important;
}

:deep(.fc-event) {
  border: none;
  border-radius: 4px;
  margin-bottom: 2px;
  cursor: pointer;
  background-color: transparent !important;
  padding: 0;
}

/* Custom Event Content */
.custom-event-content {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 6px;
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
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-refresh::before { content: "↺"; }
</style>
