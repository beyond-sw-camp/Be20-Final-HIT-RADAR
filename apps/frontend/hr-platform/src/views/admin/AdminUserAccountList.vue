<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">사용자 계정 관리</h2>
    </div>

    <!-- Error Debug Alert -->
    <!-- Filter Card -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">검색어 (ID/이름/이메일)</label>
          <input 
            v-model="filters.keyword" 
            placeholder="검색어 입력" 
            @keyup.enter="handleSearch" 
            class="form-input" 
            autocomplete="new-password"
            spellcheck="false"
          />
        </div>
        
        <div class="filter-group">
          <label class="filter-label">상태</label>
          <ModernSelect 
            v-model="filters.status" 
            :options="statusOptions" 
            placeholder="전체"
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">역할</label>
          <ModernSelect 
            v-model="filters.role" 
            :options="roleOptions" 
            placeholder="전체"
          />
        </div>

        <div class="filter-group" v-if="departments.length > 0">
          <label class="filter-label">부서</label>
          <ModernSelect 
            v-model="filters.deptId" 
            :options="departments" 
            placeholder="전체"
          />
        </div>

        <div class="filter-group" v-if="companies.length > 0">
           <label class="filter-label">회사</label>
           <ModernSelect
             v-model="filters.comId"
             :options="companies"
             placeholder="전체"
           />
        </div>

        <div class="filter-actions">
          <button class="btn-search" @click="handleSearch">검색</button>
        </div>
      </div>
    </div>

    <!-- List Card -->
    <div class="card list-card">
      <table class="data-table">
        <colgroup>
          <col style="width: 10%" />
          <col style="width: 20%" />
          <col style="width: 15%" />
          <col style="width: 25%" />
          <col style="width: 15%" />
          <col style="width: 15%" />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>로그인 ID</th>
            <th>이메일</th>
            <th>역할</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="no-data">
            <td colspan="6">
              <div class="loading-spinner"></div>
            </td>
          </tr>
          <tr v-else-if="list.length === 0" class="no-data">
            <td colspan="6">데이터가 없습니다.</td>
          </tr>
          <tr 
            v-else 
            v-for="item in list" 
            :key="item.accId"
            @click="openDetailModal(item.accId)"
            class="clickable-row"
          >
            <td class="text-mono text-gray">#{{ item.accId }}</td>
            <td class="fw-bold text-dark">{{ item.name }}</td>
            <td class="text-mono">{{ item.loginId }}</td>
            <td class="text-small">{{ item.email }}</td>
            <td>
              <span class="role-badge">{{ item.role }}</span>
            </td>
            <td>
              <span :class="['status-pill', item.status]">
                <span class="status-dot"></span>
                {{ item.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <AdminUserAccountDetailModal 
      v-if="showModal" 
      :accId="selectedId" 
      @close="closeModal" 
      @refresh="handleSearch"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { fetchUserAccounts } from '@/api/userAccount'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchCompanies } from '@/api/companyApi'
import AdminUserAccountDetailModal from './AdminUserAccountDetailModal.vue'
import ModernSelect from '@/components/common/ModernSelect.vue'

const loading = ref(false)
const list = ref([])
const showModal = ref(false)
const selectedId = ref(null)

const filters = reactive({
  keyword: '',
  status: '',
  role: '',
  deptId: '',
  comId: ''
})

const statusOptions = [
  { label: '전체', value: '' },
  { label: '활성 (ACTIVE)', value: 'ACTIVE' },
  { label: '비활성 (INACTIVE)', value: 'INACTIVE' }
]

const roleOptions = [
  { label: '전체', value: '' },
  { label: '일반 사용자', value: 'USER' },
  { label: '관리자', value: 'ADMIN' }
]

const departments = ref([])
const companies = ref([])

const handleSearch = async () => {
  loading.value = true
  
  // 빈 문자열 파라미터 제외 (Enum 변환 에러 방지)
  const params = { ...filters }
  Object.keys(params).forEach(key => {
    if (params[key] === '') delete params[key]
  })

  try {
    const res = await fetchUserAccounts(params)
    const data = res.data.data
    
    if (Array.isArray(data)) {
      list.value = data
    } else if (data && Array.isArray(data.accounts)) {
      list.value = data.accounts
    } else if (data && Array.isArray(data.items)) {
      list.value = data.items
    } else if (data && Array.isArray(data.list)) {
      list.value = data.list
    } else {
      list.value = []
    }
  } catch (e) {
    console.error(e)
    list.value = []
  } finally {
    loading.value = false
  }
}

const openDetailModal = (id) => {
  selectedId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedId.value = null
}

// 회사 ID에 따라 부서 목록 조회
const fetchDepartments = async (comId) => {
  try {
    // comId가 없으면 빈 값(전체/내회사)으로 요청
    const res = await getAllDepartmentsByCompany(comId || '')
    if (res.data && Array.isArray(res.data.data)) {
       departments.value = res.data.data.map(d => ({
         label: d.deptName, 
         value: d.deptId 
       }))
       departments.value.unshift({ label: '전체 부서', value: '' })
    } else {
       departments.value = []
    }
  } catch (e) {
    console.error('Failed to fetch departments', e)
    departments.value = []
  }
}

// 회사가 변경되면 부서 목록 갱신 및 부서 선택 초기화
watch(() => filters.comId, (newComId) => {
  filters.deptId = '' // 부서 선택 초기화
  fetchDepartments(newComId)
})

onMounted(async () => {
  // 1. Fetch Companies (Super Admin Case)
  try {
    const compRes = await fetchCompanies()
    const compData = compRes.data?.data || []
    if (Array.isArray(compData) && compData.length > 0) {
      companies.value = compData.map(c => ({
        label: c.companyName, 
        value: c.companyId 
      }))
      companies.value.unshift({ label: '전체 회사', value: '' })
    }
  } catch (e) {
    // 403 Forbidden etc. -> Not Super Admin
    if (e.response && e.response.status !== 403) {
      alert(`회사 목록 로드 실패: ${e.message}`)
    }
  }

  // 2. Initial Departments Fetch (Current Company or Selected)
  await fetchDepartments(filters.comId)

  // 3. Initial Search
  handleSearch()
})
</script>

<style scoped>
/* Reusing Admin Common Styles */
.page-container { width: 100%; padding: 0; }

.page-header {
  margin-bottom: 24px;
  display: flex; align-items: baseline; gap: 12px;
}
.title {
  font-size: 24px; font-weight: 700; color: #111827;
  letter-spacing: -0.02em; margin: 0;
}
.subtitle { font-size: 14px; color: #6b7280; font-weight: 500; }

.card {
  background: white;
  border-radius: 16px; 
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
}

.error-alert {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
}
.error-alert h3 { margin: 0 0 8px 0; font-size: 16px; }
.error-alert p { margin: 4px 0; font-size: 14px; }

.debug-alert {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}
.debug-alert h3 { margin: 0 0 8px 0; font-size: 16px; }
.debug-alert pre { 
  background: white; padding: 12px; border-radius: 8px; 
  overflow-x: auto; font-size: 12px; 
}

.filter-card { 
  padding: 24px; 
  position: relative;
  z-index: 10;
}
.filter-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.filter-group { display: flex; flex-direction: column; gap: 8px; }
.filter-label { font-size: 12px; font-weight: 700; color: #374151; }
.form-input, .form-select {
  height: 42px; width: 200px;
  border: 1px solid #d1d5db; border-radius: 8px;
  padding: 0 14px; font-size: 14px; color: #111827;
  background-color: #f9fafb;
}
.form-input:focus, .form-select:focus {
  outline: none; background-color: white; border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.btn-search {
  height: 42px; padding: 0 28px;
  background: #111827; color: white;
  font-size: 14px; font-weight: 600;
  border-radius: 8px; border: none; cursor: pointer;
}
.btn-search:hover { background: #1f2937; }

.list-card { padding: 0; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; user-select: none; /* 텍스트 선택 방지 */ }
.data-table th {
  background: #f9fafb; padding: 18px 24px; text-align: left;
  font-size: 12px; font-weight: 600; color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}
.data-table td {
  padding: 18px 24px; border-bottom: 1px solid #f1f5f9;
  font-size: 14px; color: #334155; vertical-align: middle;
}
.clickable-row { 
  cursor: pointer; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.4s ease backwards; 
}
.clickable-row:hover { 
  background: #f8fafc; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03); 
  z-index: 1; position: relative;
}

.title {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
  margin: 0;
}
.clickable-row:active {
  transform: scale(0.995);
  background: #f1f5f9;
}

.text-dark { color: #0f172a; }
.fw-bold { font-weight: 600; }
.text-gray { color: #94a3b8; }
.text-mono { font-family: monospace; letter-spacing: -0.02em; }
.text-small { font-size: 13px; color: #475569; }

.role-badge {
  display: inline-block; padding: 2px 8px;
  background: #eef2ff; color: #4f46e5;
  border-radius: 4px; font-size: 11px; font-weight: 600;
}

.status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 99px;
  font-size: 12px; font-weight: 600;
  background: #f3f4f6; color: #4b5563;
}
.status-pill.ACTIVE { background: #ecfdf5; color: #059669; }
.status-pill.ACTIVE .status-dot { background: #10b981; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; }

.loading-spinner {
  width: 32px; height: 32px; margin: 0 auto;
  border: 3px solid #e5e7eb; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.no-data td { text-align: center; padding: 80px; color: #94a3b8; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
