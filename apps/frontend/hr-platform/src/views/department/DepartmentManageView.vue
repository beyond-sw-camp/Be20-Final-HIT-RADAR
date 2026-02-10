<template>
  <div class="dept-manage-page">
    <div class="section-title">
      <div>
        <h1>부서 관리</h1>
      </div>
      <button class="btn-primary" @click="openCreateModal">
        + 부서 생성
      </button>
    </div>

    <!-- Department List Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>부서명</th>
            <th>상위 부서</th>
            <th>부서장</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dept in departments" :key="dept.deptId || dept.id">
            <td class="font-medium">{{ dept.deptName || dept.departmentName }}</td>
            <td>{{ getParentName(dept.parentDeptId || dept.parentDepartmentId) }}</td>
            <td>{{ getManagerName(dept.managerEmpId || dept.managerId, dept.managerName) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn-sm btn-edit" @click="openEditModal(dept)">수정</button>
                <button class="btn-sm btn-delete" @click="confirmDelete(dept)">삭제</button>
              </div>
            </td>
          </tr>
          <tr v-if="departments.length === 0">
             <td colspan="4" class="text-center py-4">등록된 부서가 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">{{ isEditMode ? '부서 수정' : '부서 생성' }}</h2>
          <button class="btn-close" @click="closeModal">×</button>
        </div>
        
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label>부서명 <span class="required">*</span></label>
            <input v-model="form.deptName" type="text" class="input-modern" required placeholder="예: 인사팀" />
          </div>

          <div class="form-group">
            <label>부서 연락처 <span class="required">*</span></label>
            <input v-model="form.deptPhone" type="text" class="input-modern" required placeholder="예: 02-1234-5678" />
          </div>

          <div class="form-group">
            <label>상위 부서</label>
            <select v-model="form.parentDeptId" class="input-modern">
              <option :value="null">없음 (최상위 부서)</option>
              <option 
                v-for="d in parentOptions" 
                :key="d.deptId || d.id" 
                :value="d.deptId || d.id"
              >
                {{ d.deptName || d.departmentName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>부서장</label>
            <div class="input-group-picker">
              <input 
                type="text" 
                class="input-modern" 
                :value="form.managerName || '선택 안 함'" 
                readonly 
                placeholder="부서장을 선택하세요"
              />
              <button type="button" class="btn-picker" @click="openPicker">
                <i class="pi pi-search"></i> 찾기
              </button>
              <button 
                v-if="form.managerId" 
                type="button" 
                class="btn-clear" 
                @click="form.managerId = null; form.managerName = ''"
              >
                삭제
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="closeModal">취소</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? '처리중...' : (isEditMode ? '수정' : '생성') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Employee Picker -->
    <EmployeePickerModal 
      :isVisible="showPicker"
      :employees="employees"
      @close="closePicker"
      @select="handlePickEmployee"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  getAllDepartmentsByCompany, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '@/api/departmentApi'
import { fetchEmployees } from '@/api/employeeApi'
import EmployeePickerModal from '@/components/common/EmployeePickerModal.vue'

const departments = ref([])
const employees = ref([]) 
const showModal = ref(false)
const showPicker = ref(false) // State for Picker Modal
const isEditMode = ref(false)
const submitting = ref(false)
const editId = ref(null)

const form = ref({
  deptName: '',
  deptPhone: '',
  parentDeptId: null,
  managerId: null,
  managerName: '' // For display
})

const parentOptions = computed(() => {
  if (!isEditMode.value) return departments.value
  return departments.value.filter(d => (d.deptId || d.id) !== editId.value)
})

onMounted(() => {
  fetchDepartments()
  loadEmployees()
})

const fetchDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany()
    const rawData = res.data?.data?.departments || res.data?.data || []
    departments.value = Array.isArray(rawData) ? rawData : []
  } catch (err) {
    console.error('부서 목록 로드 실패:', err)
  }
}

const loadEmployees = async () => {
  try {
    const res = await fetchEmployees({ size: 1000 })
    console.log('Employee Fetch Res:', res.data) // Debug Log
    // Try multiple paths: content (Page), employees (List wrap), or direct array
    employees.value = res.data?.data?.content || res.data?.data?.employees || res.data?.data || []
  } catch (e) { console.error('Failed to load employees', e) }
}

const getParentName = (parentId) => {
  if (!parentId) return '-'
  const parent = departments.value.find(d => (d.deptId || d.id) == parentId) // Loose comparison
  return parent ? (parent.deptName || parent.departmentName) : '-'
}

const getManagerName = (managerId, managerNameFromApi) => {
  if (managerNameFromApi) return managerNameFromApi
  if (!managerId) return '-'
  // Loose comparison to handle number vs string mismatch
  const emp = employees.value.find(e => (e.empId || e.id) == managerId)
  return emp ? emp.name : '-'
}

const openCreateModal = () => {
  isEditMode.value = false
  editId.value = null
  form.value = { deptName: '', deptPhone: '', parentDeptId: null, managerId: null, managerName: '' }
  showModal.value = true
}

const openEditModal = (dept) => {
  isEditMode.value = true
  editId.value = dept.deptId || dept.id 
  
  // Map backend field managerEmpId to form managerId
  const currentManagerId = dept.managerEmpId || dept.managerId || null

  form.value = {
    deptName: dept.deptName || dept.departmentName || '',
    deptPhone: dept.deptPhone || dept.deptPhoneNo || '', 
    parentDeptId: dept.parentDeptId || dept.parentDepartmentId || null,
    managerId: currentManagerId,
    managerName: getManagerName(currentManagerId, dept.managerName)
  }
  showModal.value = true
}

const openPicker = () => { showPicker.value = true }
const closePicker = () => { showPicker.value = false }

const handlePickEmployee = (emp) => {
  form.value.managerId = emp.empId || emp.id
  form.value.managerName = emp.name
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  if (!form.value.deptName) return alert('부서명은 필수입니다.')
  
  submitting.value = true
  try {
    const payload = {
      deptName: form.value.deptName,
      deptPhone: form.value.deptPhone || '',
      parentDeptId: form.value.parentDeptId,
      managerEmpId: form.value.managerId // Send as managerEmpId to match DTO
    }

    if (isEditMode.value) {
      await updateDepartment(editId.value, payload)
      alert('성공적으로 수정되었습니다.')
    } else {
      await createDepartment(payload)
      alert('성공적으로 생성되었습니다.')
    }
    closeModal()
    fetchDepartments()
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message
    console.error('API 에러 상세:', err.response?.data)
    alert('오류 발생: ' + errMsg)
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (dept) => {
  const targetId = dept.deptId || dept.id
  const targetName = dept.deptName || dept.departmentName
  
  if (!confirm(`[${targetName}] 부서를 삭제하시겠습니까?`)) return
  
  try {
    await deleteDepartment(targetId)
    alert('삭제되었습니다.')
    fetchDepartments()
  } catch (err) {
    alert('삭제 실패: ' + (err.response?.data?.message || err.message))
  }
}
</script>

<style scoped>
.dept-manage-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.page-title { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
.page-desc { color: #64748b; }

.card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}
.data-table th, .data-table td {
  padding: 16px 20px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
}
.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}
.font-medium { font-weight: 500; color: #334155; }
.text-center { text-align: center; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }

.btn-primary {
  background: var(--primary); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;
  display: inline-flex; align-items: center; gap: 8px;
}
.btn-primary:hover { background: #1b64da; }
.btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; }

.btn-secondary {
  background: white; color: #475569; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer;
}
.btn-secondary:hover { background: #f8fafc; }

.action-buttons { display: flex; gap: 8px; justify-content: center; }
.btn-sm { padding: 6px 14px; font-size: 0.85rem; border-radius: 8px; cursor: pointer; border: 1px solid transparent; font-weight: 600; transition: all 0.2s; }
.btn-edit { background: #eff6ff; color: #3b82f6; border-color: #dbeafe; }
.btn-edit:hover { background: #3b82f6; color: white; border-color: #3b82f6; }
.btn-delete { background: #fef2f2; color: #ef4444; border-color: #fee2e2; }
.btn-delete:hover { background: #ef4444; color: white; border-color: #ef4444; }

/* Modal */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: white; width: 440px; border-radius: 16px; padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.modal-title { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }

.form-group { margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
.required { color: #ef4444; }
.input-modern {
  padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.95rem;
  transition: all 0.2s;
  outline: none; /* Prevent default outline */
}
.input-modern:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }

/* Fix Autofill Yellow */
.input-modern:-webkit-autofill,
.input-modern:-webkit-autofill:hover, 
.input-modern:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 32px; }

.input-group-picker {
  display: flex; gap: 8px; align-items: center;
}
.input-group-picker .input-modern { flex: 1; background: #f8fafc; cursor: default; }
.btn-picker {
  background: white; border: 1px solid #cbd5e1;
  padding: 10px 16px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 6px; color: #475569; font-weight: 600;
  transition: all 0.2s;
}
.btn-picker:hover { background: #f1f5f9; border-color: #94a3b8; }
.btn-clear {
  background: #fee2e2; border: none; color: #ef4444; padding: 10px 12px; border-radius: 8px; cursor: pointer; font-weight: 600;
}
.btn-clear:hover { background: #fecaca; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

.card-hd h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}
</style>
