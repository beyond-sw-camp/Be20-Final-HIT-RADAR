<template>
  <div class="dept-list-page">
    <div class="section-title">
      <div>
        <h1>부서 조회</h1>
      </div>
    </div>

    <div class="content-container">
      <!-- List Table Section -->
       <section class="list-section card">
         <div v-if="loading" class="loading-state">
           <div class="spinner"></div>
           <span>부서 목록을 불러오는 중입니다...</span>
         </div>
         <div v-else class="table-wrapper">
           <table class="data-table">
             <thead>
               <tr>
                 <th>부서명</th>
                 <th>상위 부서</th>
                 <th>부서장</th>
                 <th>부서 연락처</th>
                 <th>생성일</th>
               </tr>
             </thead>
             <tbody>
               <tr v-for="dept in departments" :key="dept.deptId" @click="openDetailModal(dept)" class="clickable-row">
                 <td class="font-medium">{{ dept.deptName }}</td>
                 <td>{{ dept.parentDeptName || '-' }}</td>
                 <td>
                   <div class="manager-info">
                     <span class="manager-name">{{ dept.managerName || '-' }}</span>
                   </div>
                 </td>
                 <td>{{ dept.deptPhone || '-' }}</td>
                 <td>{{ formatDate(dept.createdAt) }}</td>
               </tr>
               <tr v-if="departments.length === 0">
                 <td colspan="5" class="text-center py-8">데이터가 없습니다.</td>
               </tr>
             </tbody>
           </table>
         </div>
      </section>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal" class="modal-backdrop" @click.self="closeDetailModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">부서 상세 정보</h2>
          <button class="btn-close" @click="closeDetailModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedDept && !detailLoading">
          <div class="detail-group">
            <div class="detail-item">
              <span class="label">부서명</span>
              <span class="value highlight">{{ selectedDept.deptName }}</span>
            </div>
            <div class="detail-item">
              <span class="label">부서 연락처</span>
              <span class="value">{{ selectedDept.deptPhone || '-' }}</span>
            </div>
          </div>

          <div class="divider"></div>

          <div class="detail-item">
             <span class="label">상위 부서</span>
             <span class="value">{{ selectedDept.parentDeptName || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">부서장</span>
            <span class="value">{{ selectedDept.managerName || selectedDept.managerEmpName || '-' }}</span>
          </div>

          <div class="divider"></div>

          <div class="detail-item">
            <span class="label">생성일</span>
            <span class="value">{{ formatDate(selectedDept.createdAt) }}</span>
          </div>
        </div>
        <div v-else class="loading-state py-8">
           <div class="spinner"></div>
           <span>상세 정보를 불러오는 중...</span>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="closeDetailModal">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllDepartmentsByCompany, getDepartmentById } from '@/api/departmentApi'

const loading = ref(true)
const departments = ref([])

// Modal State
const showDetailModal = ref(false)
const selectedDept = ref(null)
const detailLoading = ref(false)

const openDetailModal = async (dept) => {
  showDetailModal.value = true
  detailLoading.value = true
  selectedDept.value = null

  try {
    const res = await getDepartmentById(dept.deptId || dept.id)
    selectedDept.value = res.data?.data || res.data
  } catch (err) {
    console.error('Failed to fetch department detail:', err)
    alert('부서 상세 정보를 불러오지 못했습니다.')
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedDept.value = null
}

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  loading.value = true
  try {
    const listRes = await getAllDepartmentsByCompany()
    const rawData = listRes.data?.data?.departments || listRes.data?.data
    departments.value = ensureArray(rawData)
  } catch (err) {
    console.error('Failed to fetch department list:', err)
  } finally {
    loading.value = false
  }
}

const ensureArray = (data) => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.children)) return [data]
  return []
}




const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.dept-list-page {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 40px;
}
.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}
.page-desc {
  color: #64748b;
  font-size: 1rem;
}

.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  padding: 0; /* Remove padding for flush table */
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* Table Styles */
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}
.data-table th, .data-table td {
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}
.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.data-table tr:last-child td {
  border-bottom: none;
}
.font-medium { font-weight: 600; color: #334155; }
.text-center { text-align: center; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }

.loading-state {
  display: flex; flex-direction: column; align-items: center; padding: 60px; color: #94a3b8; gap: 16px;
}
.spinner {
  width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.clickable-row { cursor: pointer; transition: all 0.2s; }
.clickable-row:hover { background-color: #f8fafc; }

/* Modal Styles */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-content {
  background: white; width: 400px; border-radius: 20px; padding: 32px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.modal-title { font-size: 1.5rem; font-weight: 800; color: #1e293b; letter-spacing: -0.025em; }
.btn-close { background: none; border: none; font-size: 1.5rem; color: #cbd5e1; cursor: pointer; transition: color 0.2s; }
.btn-close:hover { color: #64748b; }

.detail-group { margin-bottom: 24px; }
.detail-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 0;
}
.detail-item .label { color: #64748b; font-size: 0.95rem; font-weight: 500; }
.detail-item .value { color: #0f172a; font-weight: 600; text-align: right; font-size: 1rem; }
.detail-item .value.highlight { color: #3b82f6; font-size: 1.1rem; }

.divider { height: 1px; background: #f1f5f9; margin: 16px 0; }

.modal-footer { margin-top: 32px; }
.btn-primary {
  width: 100%;
  background: #0f172a; color: white; border: none; padding: 14px; border-radius: 12px;
  font-weight: 600; font-size: 1rem; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover { background: #334155; }

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
