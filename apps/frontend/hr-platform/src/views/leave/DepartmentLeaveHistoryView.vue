<template>
  <section class="page">
    <div class="page-header">
      <h1>부서 휴가 이력</h1>
    </div>

    <!-- 필터링 및 검색 -->
    <div class="filter-card">
      <div class="filter-grid">
        <div class="filter-field">
          <label for="date-range">기간</label>
          <div class="date-inputs">
            <input type="date" id="date-start" v-model="filters.startDate">
            <span>~</span>
            <input type="date" id="date-end" v-model="filters.endDate">
          </div>
        </div>
        <div class="filter-field">
          <label for="department">부서</label>
          <select id="department" v-model="filters.departmentId">
            <option value="">전체 부서</option>
            <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">
              {{ dept.deptName }}
            </option>
          </select>
        </div>
        <div class="filter-field">
          <label for="leave-type">휴가 종류</label>
          <select id="leave-type" v-model="filters.leaveType">
            <option value="">전체</option>
            <option v-for="type in uniqueLeaveTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        <div class="filter-field">
          <label for="employee-name">이름</label>
          <select id="employee-name" v-model="filters.employeeName">
            <option value="">전체</option>
            <option v-for="name in uniqueEmployees" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Actions moved to history card -->
    </div>

    <!-- 부서 휴가 사용 기록 -->
    <div class="history-card">
      <div class="card-header-row">
        <h2>조회 결과</h2>
        <div class="header-actions">
            <button @click="resetFilters" class="btn-secondary">초기화</button>
            <button @click="applyFilters" class="btn-primary">조회</button>
        </div>
      </div>
       <div v-if="isLoading" class="loading-state">
        <p>데이터를 불러오는 중입니다...</p>
      </div>
      <div v-else-if="filteredLeaves.length === 0" class="empty-state">
        <p>조회된 휴가 내역이 없습니다.</p>
      </div>
      <div v-else class="leave-table-container">
        <table class="leave-table">
            <thead>
                <tr>
                <th>기간</th>
                <th>휴가 종류</th>
                <th>부서</th>
                <th>이름</th>
                <th>결재결과</th>
                <th>차감일수</th>
                <th>사유</th>
                <th>신청일시</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="leave in filteredLeaves" :key="leave.leaveId">
                <td>{{ leave.startDate }} ~ {{ leave.endDate }}</td>
                <td>{{ leave.leaveType }}</td>
                <td>{{ leave.departmentName || '-' }}</td>
                <td>{{ leave.empName }}</td>
                <td>
                    <span :class="['badge', getStatusBadgeClass(leave.approvalStatus)]">
                        {{ getStatusLabel(leave.approvalStatus) }}
                    </span>
                </td>
                <td>{{ leave.leaveDays }}일</td>
                <td class="reason-cell">{{ leave.reason }}</td>
                <td>{{ formatDateTime(leave.requestedAt) }}</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
    <!-- Dummy usage to satisfy linter for dynamic CSS classes -->
    <div v-show="false">
      <span class="badge-blue"></span>
      <span class="badge-green"></span>
      <span class="badge-red"></span>
      <span class="badge-gray"></span>
      <span class="badge-yellow"></span>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getDepartmentLeaves, getLeavePolicies } from '@/api/leaveApi';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const leavePolicies = ref([]);
const departments = ref([]);

const filters = ref({
  startDate: '',
  endDate: '',
  departmentId: '',
  leaveType: '',
  employeeName: '',
});

const isLoading = ref(true);
const allLeaves = ref([]); 
const filteredLeaves = ref([]);

const uniqueEmployees = computed(() => {
    if (!allLeaves.value) return [];
    const names = allLeaves.value.map(l => l.empName).filter(n => n);
    return [...new Set(names)].sort();
});

const uniqueLeaveTypes = computed(() => {
    const policyTypes = leavePolicies.value.map(p => p.typeName);
    const usedTypes = allLeaves.value.map(l => l.leaveType).filter(t => t);
    const allTypes = [...policyTypes, ...usedTypes, '연차']; 
    return [...new Set(allTypes)].sort();
});


const applyFilters = () => {
    isLoading.value = true;
    console.log('Applying filters:', filters.value);
    
    // Client-side filtering because the backend endpoint returns all department leaves
    setTimeout(() => {
        filteredLeaves.value = allLeaves.value.filter(leave => {
            const nameMatch = filters.value.employeeName ? leave.empName.includes(filters.value.employeeName) : true;
            // Department filter: If departmentId is provided, filter by it. 
            // Note: Data might not have departmentId directly attached if not in DTO. 
            // We only requested departmentName in DTO. Filtering by ID might be tricky if we don't have ID.
            // Let's assume we filter by Name matching selected ID's name OR we should add deptId to DTO properly.
            // But wait, the task was about "Names matching".
            // Since we added departmentName to DTO, let's filter by Name or just fetch DeptId too?
            // Actually, we usually filtering by ID. let's add DeptId to DTO for robustness?
            // For now, let's skip complex ID filtering logic if ID is missing in DTO, or simple string match.
            // Let's assume for this specific User Request (Name Consistency) that Name display is key.
            // But wait! Use selected ID to find deptName from 'departments' array, then match string?
            
            let deptMatch = true;
            if (filters.value.departmentId) {
                 const selectedDept = departments.value.find(d => d.deptId === filters.value.departmentId);
                 if (selectedDept && leave.departmentName) {
                     deptMatch = leave.departmentName === selectedDept.deptName;
                 } else {
                     deptMatch = false; 
                 }
            }
            
            const typeMatch = filters.value.leaveType ? leave.leaveType === filters.value.leaveType : true;
            
            // Date Range Filter
            let dateMatch = true;
            if (filters.value.startDate && filters.value.endDate) {
                const start = new Date(filters.value.startDate);
                const end = new Date(filters.value.endDate);
                const leaveStart = new Date(leave.startDate);
                const leaveEnd = new Date(leave.endDate);
                // Check overlap
                dateMatch = leaveStart <= end && leaveEnd >= start;
            }

            return nameMatch && typeMatch && dateMatch && deptMatch;
        });
        isLoading.value = false;
    }, 300); // Small delay for UI feel
};

const resetFilters = () => {
    filters.value = {
        startDate: '',
        endDate: '',
        departmentId: '',
        leaveType: '',
        employeeName: '',
    };
    filteredLeaves.value = allLeaves.value;
};

const fetchData = async () => {
    isLoading.value = true;
    try {
        const [leavesRes, policiesRes, deptsRes] = await Promise.all([
            getDepartmentLeaves(),
            getLeavePolicies(authStore.user?.companyId),
            getAllDepartmentsByCompany(authStore.user?.companyId || undefined)
        ]);

        if (leavesRes.data && leavesRes.data.success) {
            allLeaves.value = leavesRes.data.data;
            filteredLeaves.value = allLeaves.value;
        }
        
        if (policiesRes.data && policiesRes.data.success) {
            leavePolicies.value = policiesRes.data.data || [];
        }

        if (deptsRes.data && deptsRes.data.success) {
            const rawData = deptsRes.data.data.departments || deptsRes.data.data || [];
            
            const flattenDepts = (data) => {
                if (!data) return [];
                if (Array.isArray(data)) {
                    let result = [];
                    data.forEach(item => {
                        result.push(item);
                        if (item.children && Array.isArray(item.children)) {
                            result = result.concat(flattenDepts(item.children));
                        }
                    });
                    return result;
                }
                return [data];
            };

            const flatList = flattenDepts(rawData);
            departments.value = flatList.map(d => ({
                deptId: d.deptId || d.id || d.departmentId,
                deptName: d.deptName || d.name || d.departmentName
            })).filter(d => d.deptId);
        }

    } catch (e) {
        console.error("Failed to fetch data:", e);
    } finally {
        isLoading.value = false;
    }
}

const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    // isoString could be just Date or DateTime
    const date = new Date(isoString);
    return date.toLocaleDateString('ko-KR'); 
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


onMounted(() => {
    fetchData();
});

</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.page-header {
  margin-bottom: 2rem;
}
.page-header h1 { 
    font-size: 1.75rem; 
    font-weight: 700; 
    color: #111827; 
    letter-spacing: -0.025em;
}

/* Filter Section */
.filter-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
}

.filter-field { 
    display: flex; 
    flex-direction: column; 
    min-width: 200px;
    flex: 1;
}

.filter-field label { 
    font-size: 0.875rem; 
    font-weight: 600; 
    color: #374151; 
    margin-bottom: 0.5rem; 
}

.filter-field input, 
.filter-field select { 
    padding: 0.625rem 0.875rem; 
    border: 1px solid #d1d5db; 
    border-radius: 6px; 
    font-size: 0.875rem; 
    color: #1f2937;
    transition: all 0.2s;
    background-color: #fff;
}

.filter-field input:focus, 
.filter-field select:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.date-inputs { 
    display: flex; 
    align-items: center; 
    gap: 0.5rem; 
}
.date-inputs input { flex: 1; }

/* Filter actions removed */

.btn-primary, .btn-secondary {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-primary { 
    background-color: #4f46e5; 
    color: white; 
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.btn-primary:hover { background-color: #4338ca; }

.btn-secondary { 
    background-color: #fff; 
    color: #374151; 
    border-color: #d1d5db; 
}
.btn-secondary:hover { background-color: #f9fafb; border-color: #9ca3af; }


/* History Card & Table */
.history-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden; /* For rounded corners on table */
}

.card-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
}

.history-card h2 { 
    font-size: 1.125rem; 
    font-weight: 600; 
    margin: 0;
    color: #111827;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
}

.leave-table-container {
    overflow-x: auto;
    max-height: 600px; /* Enable vertical scroll */
}

.leave-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: left;
}

.leave-table th {
  padding: 0.875rem 1.5rem;
  background-color: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.leave-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #1f2937;
  vertical-align: middle;
}

.leave-table tbody tr:last-child td {
    border-bottom: none;
}

.leave-table tbody tr:hover {
    background-color: #f9fafb;
}

.reason-cell { 
    max-width: 200px; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
}

.loading-state, .empty-state {
    padding: 4rem 2rem;
    text-align: center;
    color: #6b7280;
}

/* Badges */
.badge { 
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.75rem; 
    border-radius: 9999px; 
    font-size: 0.75rem; 
    font-weight: 500;
    line-height: 1;
}
.badge-blue { background-color: #eff6ff; color: #1e40af; }
.badge-green { background-color: #ecfdf5; color: #047857; }
.badge-red { background-color: #fef2f2; color: #b91c1c; }
.badge-gray { background-color: #f3f4f6; color: #374151; }
.badge-yellow { background-color: #fffbeb; color: #b45309; }
</style>
```