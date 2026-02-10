<template>
  <section class="narrow-container">
    <div class="section-title">
      <div class="header-content">
        <h1>내 부서 조회</h1>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!department" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      <p>소속된 부서 정보를 찾을 수 없습니다.</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Department Info Card -->
      <div class="card info-card">
        <div class="card-body">
          <div class="dept-details">
            <div class="dept-header">
              <h2>{{ department.deptName }}</h2>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">부서장</span>
                <span class="value">{{ department.managerName || department.managerEmpName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">부서 연락처</span>
                <span class="value">{{ department.deptPhone || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">상위 부서</span>
                <span class="value">{{ department.parentDeptName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">생성일</span>
                <span class="value">{{ formatDate(department.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Department Members Card -->
      <div class="card members-card">
        <div class="card-header">
          <h3><i class="pi pi-users"></i> 부서원 목록 <span class="count">({{ members.length }})</span></h3>
        </div>
        
        <div class="table-wrapper">
          <table class="data-table">
            <colgroup>
              <col style="width: 80px" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 30%" />
              <col style="width: 20%" />
              <col style="width: 120px" />
            </colgroup>
            <thead>
              <tr>
                <th class="text-center">프로필</th>
                <th class="text-center">성명</th>
                <th class="text-center">직위</th>
                <th class="text-center">이메일</th>
                <th class="text-center">내선번호</th>
                <th class="text-center">상태</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="member in members" 
                  :key="member.employeeId" 
                  @click="openMemberDetail(member)"
                  class="clickable-row">
                <td class="text-center">
                  <div class="avatar-sm">
                    <img v-if="member.image" :src="resolveFileUrl(member.image)" alt="" />
                    <span v-else>{{ member.name.charAt(0) }}</span>
                  </div>
                </td>
                <td class="font-medium">{{ member.name }}</td>
                <td><span class="badge position">{{ member.positionName || '-' }}</span></td>
                <td class="text-secondary">{{ member.email || '-' }}</td>
                <td>{{ member.extNo || '-' }}</td>
                <td>
                  <span class="status-badge" :class="{ 'active': member.status === '재직' || member.status === 'ACTIVE' }">
                    {{ member.status || '미정' }}
                  </span>
                </td>
              </tr>
              <tr v-if="members.length === 0">
                <td colspan="6" class="empty-message">부서원이 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Employee Detail Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <button class="btn-close" @click="closeModal"><i class="pi pi-times"></i></button>
        
        <div v-if="modalLoading" class="modal-loading">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="selectedMember" class="member-detail">
          <div class="modal-header-profile">
            <div class="modal-avatar">
              <img v-if="selectedMember.image" :src="resolveFileUrl(selectedMember.image)" alt="Profile" />
              <i v-else class="pi pi-user"></i>
            </div>
            <div class="modal-profile-info">
              <h2>{{ selectedMember.name }}</h2>
              <div class="modal-badges">
                <span class="badge position">{{ selectedMember.positionName }}</span>
                <span class="badge dept">{{ selectedMember.deptName }}</span>
              </div>
            </div>
          </div>
          
          <div class="modal-body-content">
             <div class="detail-section">
               <h4>연락처 정보</h4>
               <div class="detail-item">
                 <span class="label">이메일</span>
                 <span class="value">{{ selectedMember.email || '-' }}</span>
               </div>
               <div class="detail-item">
                 <span class="label">내선번호</span>
                 <span class="value">{{ selectedMember.extNo || '-' }}</span>
               </div>
               <div class="detail-item">
                 <span class="label">휴대전화</span>
                 <span class="value">{{ selectedMember.phoneNo || '-' }}</span>
               </div>
             </div>
             
             <div class="detail-section">
               <h4>근무 정보</h4>
               <div class="detail-item">
                 <span class="label">사번</span>
                 <span class="value">{{ selectedMember.employeeNo }}</span>
               </div>
               <div class="detail-item">
                 <span class="label">입사일</span>
                 <span class="value">{{ selectedMember.hireDate || '-' }}</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getDepartmentById, getDepartmentMembers } from '@/api/departmentApi'
import { fetchEmployeeDetail } from '@/api/employeeApi'
import { resolveFileUrl } from '@/utils/fileUrl'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const empId = computed(() => authStore.user?.employeeId)

const loading = ref(false)
const department = ref(null)
const members = ref([])

// Modal State
const showModal = ref(false)
const modalLoading = ref(false)
const selectedMember = ref(null)

const loadData = async () => {
    if (!empId.value) return
    loading.value = true
    try {
        const empRes = await fetchEmployeeDetail(empId.value)
        const employeeInfo = empRes.data?.data
        
        if (employeeInfo?.deptId) {
            const deptRes = await getDepartmentById(employeeInfo.deptId)
            department.value = deptRes.data?.data
            
            const membersRes = await getDepartmentMembers(employeeInfo.deptId)
            members.value = membersRes.data?.data?.employees || membersRes.data?.data || []
        }
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const openMemberDetail = async (member) => {
    showModal.value = true
    modalLoading.value = true
    selectedMember.value = null
    
    try {
        const res = await fetchEmployeeDetail(member.empId || member.employeeId) // ensure ID field name
        selectedMember.value = res.data?.data
    } catch (e) {
        console.error(e)
        alert('정보를 불러올 수 없습니다.')
        showModal.value = false
    } finally {
        modalLoading.value = false
    }
}

const closeModal = () => {
    showModal.value = false
    selectedMember.value = null
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString()
}

onMounted(loadData)
</script>

<style scoped>
/* Page Layout */
.narrow-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 20px;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.section-title h1 {
    font-size: 24px;
    font-weight: 800;
    color: var(--primary);
    margin: 0;
    letter-spacing: -0.02em;
}
.subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}

/* Card Styles */
.card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    margin-bottom: 24px;
    overflow: hidden;
}

/* Dept Info Card */
.info-card .card-body {
    padding: 32px;
    display: flex;
    gap: 32px;
    align-items: flex-start;
}
@media (max-width: 768px) {
    .info-card .card-body { flex-direction: column; }
}

.dept-visual {
    flex-shrink: 0;
}
.dept-icon {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    color: #2563eb;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1);
}

.dept-details { flex: 1; width: 100%; }
.dept-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 20px;
}
.dept-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
    margin: 0;
}
.dept-code {
    font-size: 13px;
    color: #64748b;
    font-family: monospace;
    background: #f8fafc;
    padding: 2px 8px;
    border-radius: 4px;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    margin-top: 10px;
}
.info-item { 
    display: flex; 
    flex-direction: column; 
    gap: 12px; 
    align-items: center;
    text-align: center;
    position: relative;
    padding: 0 10px;
}
.info-item:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 40px;
    width: 1px;
    background-color: #e2e8f0;
}
.info-item .label { 
    font-size: 13px; 
    color: #64748b; 
    font-weight: 600; 
    margin-bottom: 0;
}
.info-item .value { 
    font-size: 16px; 
    color: #0f172a; 
    font-weight: 600; 
}

@media (max-width: 768px) {
    .info-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .info-item:not(:last-child)::after { display: none; }
}

/* Members Card */
.members-card .card-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;
    background: #fcfcfc;
}
.members-card h3 {
    font-size: 20px;
    font-weight: 700;
    color: var(--primary);
    margin: 0;
    display: flex; align-items: center; gap: 8px;
}
.count { color: #64748b; font-weight: 500; font-size: 14px; }

.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
    background: #f8fafc;
    padding: 12px 16px;
    text-align: center;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
}
.data-table td {
    padding: 16px 16px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
    font-size: 14px;
    color: #334155;
    text-align: center;
}
.data-table tr:last-child td { border-bottom: none; }

.clickable-row { cursor: pointer; transition: all 0.2s; }
.clickable-row:hover { background: #f8fafc; }

.avatar-sm {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #f1f5f9;
    display: flex;
    align-items: center; justify-content: center;
    overflow: hidden;
    font-size: 14px; font-weight: 600; color: #64748b;
}
.avatar-sm img { width: 100%; height: 100%; object-fit: cover; }

.font-medium { font-weight: 600; color: #0f172a; }
.text-secondary { color: #64748b; }

.badge { padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
.badge.position { background: #e8f3ff; color: #3182f6; border: 1px solid #dbeafe; }
.badge.dept { background: #f5f3ff; color: #7c3aed; border: 1px solid #ede9fe; }

.status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 4px 10px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 600;
    background: #f1f5f9;
    color: #64748b;
}
.status-badge.active {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #bbf7d0;
}

.empty-message { text-align: center; padding: 48px; color: #94a3b8; }

/* Modal Styles */
.modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.5);
    display: flex; justify-content: center; align-items: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease-out;
}
.modal-content {
    background: white;
    width: 480px; max-width: 90vw;
    border-radius: 20px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-close {
    position: absolute; top: 16px; right: 16px;
    background: none; border: none; font-size: 20px;
    color: #94a3b8; cursor: pointer; z-index: 10;
}
.btn-close:hover { color: #64748b; }

.modal-loading {
    height: 300px; display: flex; align-items: center; justify-content: center;
}

.modal-header-profile {
    padding: 40px 32px;
    background: #f8fafc;
    text-align: center;
    border-bottom: 1px solid #e2e8f0;
}
.modal-avatar {
    width: 100px; height: 100px;
    margin: 0 auto 16px;
    border-radius: 50%;
    background: white; border: 4px solid white;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
}
.modal-avatar img { width: 100%; height: 100%; object-fit: cover; }
.modal-avatar i { font-size: 40px; color: #cbd5e1; }

.modal-profile-info h2 { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.modal-badges { display: flex; gap: 8px; justify-content: center; }

.modal-body-content { padding: 32px; }
.detail-section { margin-bottom: 24px; }
.detail-section:last-child { margin-bottom: 0; }
.detail-section h4 {
    font-size: 13px; font-weight: 700; color: #94a3b8;
    text-transform: uppercase; margin-bottom: 12px;
}
.detail-item {
    display: flex; justify-content: space-between;
    margin-bottom: 12px; font-size: 14px;
}
.detail-item .label { color: #64748b; }
.detail-item .value { color: #0f172a; font-weight: 500; }

@keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.loading-state, .error-state {
    text-align: center; padding: 60px;
    color: #64748b;
}
.spinner {
    width: 32px; height: 32px;
    border: 3px solid #e2e8f0; border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
