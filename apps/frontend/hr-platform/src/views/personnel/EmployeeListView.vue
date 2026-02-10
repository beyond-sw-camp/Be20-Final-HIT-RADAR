<template>
  <section>
    <div class="section-title">
      <div>
        <h1>사원 관리</h1>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <!-- 필터: 부서 -->
        <ModernSelect
          v-model="selectedDept"
          :options="deptOptions"
          placeholder="전체 부서"
          class="filter-select"
          @change="loadEmployees"
        />

        <!-- 필터: 직위 -->
        <ModernSelect
          v-model="selectedPos"
          :options="posOptions"
          placeholder="전체 직위"
          class="filter-select"
          @change="loadEmployees"
        />

        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="이름 또는 사번 검색" 
          class="input search-input"
          @keyup.enter="search"
        />
        <button class="btn primary" @click="search">검색</button>
      </div>
      
      <div class="action-buttons" style="display: flex; gap: 8px;">
        <button class="btn outline" @click="openCsvModal">
            <i class="pi pi-upload"></i> 일괄 등록
        </button>
        <button class="btn primary outline" @click="openCreateModal">
            <i class="pi pi-plus"></i> 사원 등록
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">사원 정보를 불러오는 중...</div>
    
    <!-- Employee Table Component -->
    <EmployeeTable 
      v-else
      :employees="employees"
      :dept-map="deptMap"
      :pos-map="posMap"
      :is-admin="true"
      @appointment="goToAppointment"
      @history="goToHistory"
      @edit="openEditModal"
      @delete="handleDelete"
      @view="openViewModal"
      @role="openRoleModal"
      class="mb-4"
    />

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 0" class="pagination-container">
      <button 
        class="page-btn prev"
        :disabled="page === 1"
        @click="changePage(page - 1)"
      >
        &lt;
      </button>

      <div class="page-numbers">
        <button 
          v-for="p in pageRange" 
          :key="p"
          :class="['page-num', { active: p === page }]"
          @click="changePage(p)"
        >
          {{ p }}
        </button>
      </div>

      <button 
        class="page-btn next"
        :disabled="page === totalPages"
        @click="changePage(page + 1)"
      >
        &gt;
      </button>
    </div>

    <!-- CRUD Form Modal -->
    <EmployeeFormModal 
      :visible="showFormModal"
      :edit-mode="isEditMode"
      :view-mode="isViewMode"
      :target-emp="selectedEmp"
      :departments="departments"
      :positions="positions"
      @close="showFormModal = false"
      @success="handleSuccess"
    />

    <!-- CSV 일괄 등록 모달 -->
    <EmployeeCsvUploadModal
        :visible="showCsvModal"
        @close="showCsvModal = false"
        @success="onCsvSuccess"
    />

    <!-- 역할 배정 모달 -->
    <RoleAssignmentModal
        :visible="showRoleModal"
        :target-emp="selectedEmp"
        @close="showRoleModal = false"
        @success="handleRoleSuccess"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchEmployees, deleteEmployee } from '@/api/employeeApi'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchPositions } from '@/api/positionApi'
import EmployeeTable from '@/components/personnel/EmployeeTable.vue'
import EmployeeFormModal from '@/components/personnel/EmployeeFormModal.vue'
import EmployeeCsvUploadModal from '@/components/personnel/EmployeeCsvUploadModal.vue'
import RoleAssignmentModal from '@/components/personnel/RoleAssignmentModal.vue'
import ModernSelect from '@/components/common/ModernSelect.vue'

const router = useRouter()
const employees = ref([])
const loading = ref(false)
const showFormModal = ref(false)
const showCsvModal = ref(false)
const showRoleModal = ref(false)
const isEditMode = ref(false)
const isViewMode = ref(false)
const selectedEmp = ref(null)

const searchQuery = ref('')
const selectedDept = ref(null) // 부서 필터
const selectedPos = ref(null)  // 직위 필터
// Pagination State
const page = ref(1)
const size = ref(10)
const totalCount = ref(0)
const totalPages = ref(0)
const pageRange = computed(() => {
  const current = page.value
  const total = totalPages.value
  const range = []
  
  // Show 5 pages
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

const changePage = (newPage) => {
  if (newPage < 1 || newPage > totalPages.value) return
  page.value = newPage
  loadEmployees()
}


// Init Data
const departments = ref([])
const positions = ref([])
const deptMap = ref({})
const posMap = ref({})

onMounted(() => {
  loadInitData()
})

const loadInitData = async () => {
  try {
    const [deptRes, posRes] = await Promise.allSettled([
      getAllDepartmentsByCompany(),
      fetchPositions()
    ])

    if (deptRes.status === 'fulfilled') {
      const dData = deptRes.value.data?.data || deptRes.value.data || []
      const dList = Array.isArray(dData) ? dData : (dData.departments || [])
      departments.value = dList
      const map = {}
      dList.forEach(d => { map[d.deptId] = d.deptName })
      deptMap.value = map
    }

    if (posRes.status === 'fulfilled') {
      const pData = posRes.value.data?.data || posRes.value.data || []
      const pList = Array.isArray(pData) ? pData : (pData.positions || [])
      positions.value = pList
      const map = {}
      pList.forEach(p => { map[p.positionId] = p.name || p.positionName || p.posName })
      posMap.value = map
    }
  } catch (e) {
    console.error('Init Data Load Fail', e)
  }
  loadEmployees() // Initial load
}

// Computed Options for Filters
const deptOptions = computed(() => {
  const opts = departments.value.map(d => ({ label: d.deptName, value: d.deptId }))
  return [{ label: '전체 부서', value: null }, ...opts]
})

const posOptions = computed(() => {
  const opts = positions.value.map(p => ({ label: p.name || p.positionName || p.posName, value: p.positionId }))
  return [{ label: '전체 직위', value: null }, ...opts]
})


const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: size.value
    }
    if (selectedDept.value) params.deptId = selectedDept.value
    if (selectedPos.value) params.positionId = selectedPos.value
    if (searchQuery.value) params.keyword = searchQuery.value

    const empRes = await fetchEmployees(params)
    console.log('[DEBUG] empRes:', empRes)
    
    let list = []
    const responseData = empRes.data?.data
    console.log('[DEBUG] responseData:', responseData)
    
    if (responseData) {
      if (Array.isArray(responseData)) {
        list = responseData
      } else {
        list = responseData.employees || []
        totalCount.value = responseData.totalCount || 0
        totalPages.value = responseData.totalPages || 0
      }
    }
    console.log('[DEBUG] Final employees list:', list)
    employees.value = list

  } catch (e) {
    console.error('Fetch Failed', e)
    alert('데이터를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  loadEmployees()
}

const loadEmployees = loadData

const openCsvModal = () => {
  showCsvModal.value = true
}

const openCreateModal = () => {
  selectedEmp.value = null
  isEditMode.value = false
  isViewMode.value = false
  showFormModal.value = true
}

const openEditModal = (emp) => {
  selectedEmp.value = emp
  isEditMode.value = true
  isViewMode.value = false
  showFormModal.value = true
}

const openViewModal = (emp) => {
  selectedEmp.value = emp
  isEditMode.value = false
  isViewMode.value = true // View Only
  showFormModal.value = true
}

const openRoleModal = (emp) => {
    selectedEmp.value = emp
    showRoleModal.value = true
}

const handleRoleSuccess = () => {
    loadEmployees()
}

const onCsvSuccess = () => {
    loadEmployees()
}

const goToAppointment = (emp) => {
  const targetId = emp.empId || emp.userId
  router.push({ path: '/personnel/appointment', query: { empId: targetId } })
}

const goToHistory = (emp) => {
  const targetId = emp.empId || emp.userId
  router.push({ path: '/personnel/history', query: { empId: targetId } })
}

const handleDelete = async (emp) => {
  if(!confirm(`정말 ${emp.name} 사원을 삭제하시겠습니까?`)) return
  
  try {
    await deleteEmployee(emp.empId)
    alert('삭제되었습니다.')
    loadEmployees()
  } catch(e) {
    console.error(e)
    alert('삭제 실패: ' + (e.response?.data?.message || '오류 발생'))
  }
}

const handleSuccess = () => {
  loadEmployees()
}
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between; /* Space out search and add button */
  align-items: center;
  margin-bottom: 16px;
}
.search-box {
  display: flex;
  gap: 10px;
}
.search-input {
  width: 320px;
}

/* Standardized Input Styling */
.input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  height: 42px; /* Consistent Height */
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
/* Fix Autofill Yellow */
.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.search-input {
  width: 320px;
}
.filter-select {
  width: 160px !important;
}

.loading-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.page-btn {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-numbers {
  display: flex; gap: 6px;
}
.page-num {
  min-width: 36px; height: 36px;
  padding: 0 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: white;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.page-num:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.page-num.active {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
  font-weight: 600;
}
.mb-4 { margin-bottom: 16px; }

.section-title h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

/* Unified Toolbar Buttons */
.btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
}
.btn.primary {
  background: var(--primary);
  color: white;
  border: 1px solid var(--primary);
}
.btn.primary:hover {
  background: #1b64da;
  border-color: #1b64da;
}
.btn.outline {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.btn.outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.btn.primary.outline {
  background: #eff6ff;
  color: var(--primary);
  border: 1px solid #bfdbfe;
}
.btn.primary.outline:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}
</style>
