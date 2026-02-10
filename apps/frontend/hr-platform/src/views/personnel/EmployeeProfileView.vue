<template>
  <section class="page-container">
    <!-- Header -->
    <div class="page-header">
       <button class="btn icon-only" @click="goBack">
         <i class="pi pi-arrow-left"></i>
       </button>
       <h1>사원 상세 정보</h1>
       <div class="actions">
         <template v-if="!isEditMode">
           <button class="btn secondary" @click="isEditMode = true">수정</button>
           <button v-if="isAdmin" class="btn danger" @click="handleDelete">삭제</button>
         </template>
         <template v-else>
           <button class="btn ghost" @click="cancelEdit">취소</button>
           <button class="btn primary" @click="saveProfile">저장</button>
         </template>
       </div>
    </div>

    <!-- Loading/Error -->
    <div v-if="loading" class="loading-state">정보를 불러오는 중...</div>
    <div v-else-if="!employee" class="error-state">사원 정보를 찾을 수 없습니다.</div>

    <!-- Content -->
    <div v-else class="content-wrapper">
      <!-- Profile Card -->
      <div class="profile-card">
        <!-- Header Section: Avatar & Basic Info -->
        <div class="profile-header">
           <div class="avatar-area">
             <div class="avatar-lg">
               <img v-if="employee.image" :src="resolveFileUrl(employee.image)" alt="Profile" />
               <i v-else class="pi pi-user"></i>
             </div>
             <button v-if="isEditMode" class="btn-xs ghost mt-2">사진 변경</button>
           </div>
           
           <div class="basic-info">
             <h2 class="emp-name">{{ employee.name }}</h2>
             <div class="badges">
                <span class="badge position">{{ employee.positionName || '-' }}</span>
                <span class="badge dept">{{ employee.deptName || '-' }}</span>
                <span :class="['badge status', employee.status === '재직' ? 'active' : 'inactive']">
                  {{ employee.status || '상태미정' }}
                </span>
             </div>
             <div class="emp-no">사번: {{ employee.employeeNo }}</div>
           </div>
        </div>

        <div class="divider"></div>

        <!-- Detail Grid -->
        <div class="detail-grid">
           <!-- Contact Info -->
           <div class="grid-section">
             <h3>연락처 정보</h3>
             <div class="field-group">
               <label>이메일</label>
               <div v-if="!isEditMode">{{ employee.email || '-' }}</div>
               <input v-else v-model="form.email" class="input" type="email" />
             </div>
             <div class="field-group">
               <label>휴대전화</label>
               <div v-if="!isEditMode">{{ employee.phoneNo || '-' }}</div>
               <input v-else v-model="form.phoneNo" class="input" placeholder="010-0000-0000" />
             </div>
             <div class="field-group">
               <label>내선번호</label>
               <div v-if="!isEditMode">{{ employee.extNo || '-' }}</div>
               <input v-else v-model="form.extNo" class="input" placeholder="내선번호" />
             </div>
           </div>

           <!-- Personal Info -->
           <div class="grid-section">
             <h3>개인 정보</h3>
             <div class="field-group">
               <label>생년월일</label>
               <div v-if="!isEditMode">{{ employee.birth || '-' }}</div>
               <input v-else v-model="form.birth" class="input" placeholder="YYYY-MM-DD" />
             </div>
             <div class="field-group">
               <label>성별</label>
               <div v-if="!isEditMode">{{ genderMap[employee.gender] || employee.gender || '-' }}</div>
               <select v-else v-model="form.gender" class="input">
                 <option value="MALE">남성</option>
                 <option value="FEMALE">여성</option>
               </select>
             </div>
           </div>

           <!-- Work Info (Read Only usually, updated via Assignment) -->
           <div class="grid-section">
             <h3>근무 정보</h3>
             <div class="field-group">
               <label>입사일</label>
               <div v-if="!isEditMode">{{ employee.hireDate || '-' }}</div>
               <input v-else v-model="form.hireDate" type="date" class="input" />
             </div>
             <div class="field-group">
               <label>퇴사일</label>
               <div v-if="!isEditMode">{{ employee.exitDate || '-' }}</div>
               <input v-else v-model="form.exitDate" type="date" class="input" />
             </div>
             <div class="field-group">
               <label>고용 형태</label>
               <div>{{ employee.employmentType || '-' }}</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchEmployeeDetail, updateEmployeeProfile, deleteEmployee } from '@/api/employeeApi'
import { resolveFileUrl } from '@/utils/fileUrl'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const empId = route.params.id
const loading = ref(false)
const employee = ref(null)
const isEditMode = ref(false)

const isAdmin = computed(() => authStore.isAdmin)

const genderMap = {
  'MALE': '남성',
  'FEMALE': '여성'
}

const form = reactive({
  name: '',
  email: '',
  gender: '',
  birth: '',
  hireDate: '',
  exitDate: '',
  image: '',
  extNo: '',
  phoneNo: ''
})

const loadData = async () => {
    loading.value = true
    try {
        const res = await fetchEmployeeDetail(empId)
        if(res.data && res.data.success) {
            employee.value = res.data.data
            syncForm()
        }
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const syncForm = () => {
    if(!employee.value) return
    Object.keys(form).forEach(key => {
        form[key] = employee.value[key] || ''
    })
}

const cancelEdit = () => {
    isEditMode.value = false
    syncForm()
}

const saveProfile = async () => {
    if(!confirm('저장하시겠습니까?')) return

    try {
        // Prepare request
        const payload = { ...form }
        // Simple validations if needed
        const res = await updateEmployeeProfile(empId, payload)
        if(res.data && res.data.success) {
            alert('저장되었습니다.')
            employee.value = { ...employee.value, ...res.data.data } // update local
            syncForm()
            isEditMode.value = false
        }
    } catch(e) {
        console.error(e)
        alert('저장 실패: ' + (e.response?.data?.message || e.message))
    }
}

const handleDelete = async () => {
    if(!confirm('정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return
    try {
        await deleteEmployee(empId)
        alert('삭제되었습니다.')
        router.push('/employee')
    } catch(e) {
        alert('삭제 실패')
    }
}

const goBack = () => router.back()

onMounted(loadData)
</script>

<style scoped>
.page-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.page-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
}
.page-header h1 {
    font-size: 20px;
    font-weight: 600;
    flex: 1;
}

.btn.icon-only {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 8px;
    color: var(--text-main);
}
.btn.icon-only:hover {
    background: var(--bg-hover);
    border-radius: 50%;
}

.actions {
    display: flex;
    gap: 8px;
}

/* Profile Card */
.profile-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.profile-header {
    display: flex;
    gap: 24px;
    align-items: center;
}

.avatar-lg {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: #f1f3f5;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--border);
}
.avatar-lg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.avatar-lg i {
    font-size: 40px;
    color: #adb5bd;
}

.avatar-area {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.basic-info {
    flex: 1;
}

.emp-name {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
    color: var(--text-main);
}

.badges {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}

.badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;
}
.badge.position { background: #e7f5ff; color: #1971c2; }
.badge.dept { background: #f3f0ff; color: #6741d9; }
.badge.status.active { background: #e6fcf5; color: #0ca678; }
.badge.status.inactive { background: #fff5f5; color: #fa5252; }

.emp-no {
    color: var(--text-muted);
    font-size: 14px;
}

.divider {
    height: 1px;
    background: var(--border);
    margin: 24px 0;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
}
@media (max-width: 600px) {
    .detail-grid { grid-template-columns: 1fr; }
}

.grid-section h3 {
    font-size: 16px;
    margin-bottom: 16px;
    color: var(--text-main);
    border-left: 3px solid var(--primary);
    padding-left: 8px;
}

.field-group {
    margin-bottom: 16px;
}
.field-group label {
    display: block;
    font-size: 12px;
    color: var(--text-sub);
    margin-bottom: 4px;
}
.field-group div {
    font-size: 14px;
    color: var(--text-main);
    min-height: 20px;
}

.input {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 14px;
}
.input:focus {
    outline: none;
    border-color: var(--primary);
}

.btn-xs {
    padding: 2px 8px;
    font-size: 11px;
}
.mt-2 { margin-top: 8px; }
</style>
