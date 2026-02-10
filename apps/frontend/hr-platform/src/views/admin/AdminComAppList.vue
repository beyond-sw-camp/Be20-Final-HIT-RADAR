<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">회사 신청 관리</h2>
    </div>

    <!-- Filter Card -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">회사명</label>
           <input v-model="filters.companyName" placeholder="검색어 입력" @keyup.enter="handleSearch" class="form-input" autocomplete="new-password" spellcheck="false" />
        </div>
        <div class="filter-group">
          <label class="filter-label">사업자번호</label>
           <input v-model="filters.bizNo" placeholder="번호 입력" @keyup.enter="handleSearch" class="form-input" autocomplete="new-password" spellcheck="false" />
        </div>
        <div class="filter-group">
          <label class="filter-label">상태</label>
          <ModernSelect 
            v-model="filters.status" 
            :options="statusOptions" 
            placeholder="전체 상태"
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
          <col style="width: 14%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 17%" />
          <col style="width: 10%" />
          <col style="width: 10%" />
          <col style="width: 9%" />
        </colgroup>
        <thead>
          <tr>
            <th>회사명</th>
            <th>회사코드</th>
            <th>사업자번호</th>
            <th>생성자명</th>
            <th>회사연락처</th>
            <th>회사주소</th>
            <th>상태</th>
            <th>신청일시</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="no-data">
            <td colspan="9">
              <div class="loading-spinner"></div>
            </td>
          </tr>
          <tr v-else-if="list.length === 0" class="no-data">
            <td colspan="9">데이터가 없습니다.</td>
          </tr>
          <tr 
            v-else 
            v-for="item in list" 
            :key="item.appId || item.applicationId"
            @click="openDetailModal(item.appId || item.applicationId)"
            class="clickable-row"
          >
            <td class="fw-bold text-dark">{{ item.companyName || item.comName || item.name }}</td>
            <td class="text-mono text-primary fw-bold">{{ item.companyCode || item.comCode || '-' }}</td>
            <td class="text-mono">{{ item.bizNo || item.businessNo || item.businessNumber }}</td>
            <td :title="item.createrName || item.creatorName || item.adminName">
              {{ item.createrName || item.creatorName || item.adminName || item.name || '-' }}
            </td>
            <td class="text-mono">{{ item.comTel || item.tel || item.phone || '-' }}</td>
            <td class="text-small">{{ item.address || item.comAddress || item.addr || '-' }}</td>
            <td>
              <span :class="['status-pill', item.status]">
                <span class="status-dot"></span>
                {{ formatStatus(item.status) }}
              </span>
            </td>
            <td class="text-gray text-mono">{{ formatDate(item.createdAt || item.appliedAt || item.createdDate) }}</td>
            <td @click.stop>
              <div class="action-buttons" v-if="item.status === 'PENDING' || item.status === 'SUBMITTED'">
                <button class="btn-action approve" @click="handleApprove(item.appId || item.applicationId, $event)">승인</button>
                <button class="btn-action reject" @click="handleReject(item.appId || item.applicationId, $event)">반려</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail Modal -->
    <AdminComAppDetailModal 
      v-if="showModal" 
      :appId="selectedId" 
      @close="closeModal" 
      @refresh="handleSearch"
    />
    
    
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { searchCompanyApplications, approveCompanyApplication, rejectCompanyApplication } from '@/api/comApp'
import AdminComAppDetailModal from './AdminComAppDetailModal.vue'
import ModernSelect from '@/components/common/ModernSelect.vue'

const loading = ref(false)
const list = ref([])
const showModal = ref(false)
const selectedId = ref(null)

const filters = reactive({
  companyName: '',
  bizNo: '',
  status: ''
})

const statusOptions = [
  { label: '전체 상태', value: '' },
  { label: '제출됨 (SUBMITTED)', value: 'SUBMITTED' },
  { label: '승인완료 (APPROVED)', value: 'APPROVED' },
  { label: '반려됨 (REJECTED)', value: 'REJECTED' }
]

onMounted(() => {
  handleSearch()
})

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await searchCompanyApplications({ ...filters })
    const data = res.data.data
    // console.log('API Response:', data)

    if (Array.isArray(data)) {
      list.value = data
    } else if (data && Array.isArray(data.items)) {
      list.value = data.items
    } else if (data && Array.isArray(data.applications)) {
         list.value = data.applications
    } else if (data && Array.isArray(data.content)) { 
         list.value = data.content
    } else {
      list.value = []
    }
  } catch (e) {
    console.error(e)
    alert(`데이터 로드 실패: ${e.response?.data?.message || e.message}`)
  } finally {
    loading.value = false
  }
}

const openDetailModal = (id) => {
  if (!id) {
    console.error('No ID found for item')
    return
  }
  selectedId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedId.value = null
}

const formatDate = (ts) => {
  if (!ts) return '-'
  return new Date(ts).toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute:'2-digit'
  })
}

const formatStatus = (status) => {
  const map = {
    PENDING: '승인대기',
    SUBMITTED: '제출됨',
    APPROVED: '승인완료',
    REJECTED: '반려',
  }
  return map[status] || status
}

const handleApprove = async (id, event) => {
  if (event) event.stopPropagation()
  if (confirm('이 신청을 승인하시겠습니까?')) {
    try {
      await approveCompanyApplication(id)
      alert('승인되었습니다.')
      handleSearch()
    } catch (e) {
      console.error(e)
      alert('승인 처리에 실패했습니다.')
    }
  }
}

const handleReject = async (id, event) => {
  if (event) event.stopPropagation()
  const reason = prompt('반려 사유를 입력하세요:')
  if (reason) {
    try {
      await rejectCompanyApplication(id, reason)
      alert('반려되었습니다.')
      handleSearch()
    } catch (e) {
      console.error(e)
      alert('반려 처리에 실패했습니다.')
    }
  }
}
</script>

<style scoped>
/* Common Styles */
.page-container {
  width: 100%;
  padding: 0;
}


.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: baseline; 
  gap: 12px;
}
.title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  margin: 0;
}
.subtitle {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* --- Card Common --- */
.card {
  background: white;
  border-radius: 16px; 
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); 
}

/* --- Filter Card --- */
.filter-card {
  padding: 24px;
  position: relative;
  z-index: 10;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.filter-label {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}
.form-input, .form-select {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  width: 220px;
  color: #111827;
  transition: all 0.2s ease-in-out;
  background-color: #f9fafb;
}
.form-input:focus, .form-select:focus {
  outline: none;
  background-color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  align-items: center; 
  height: 42px;
}

.btn-search {
  height: 42px;
  padding: 0 28px;
  background: #111827;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.btn-search:hover {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* --- Table --- */
.list-card {
  padding: 0;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
}

.data-table {
  width: 100%;
  border-collapse: collapse; 
  user-select: none; /* Text selection disabled */
}

.data-table th {
  background: #f9fafb;
  padding: 18px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.data-table td {
  padding: 18px 24px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
  vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }

.clickable-row { 
  cursor: pointer; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.4s ease backwards;
}
.clickable-row:hover { 
  background: #f8fafc; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  position: relative; z-index: 1;
}
.clickable-row:active {
  transform: scale(0.995);
  background: #f1f5f9;
}

.text-dark { color: #0f172a; }
.fw-bold { font-weight: 600; }
.text-gray { color: #94a3b8; font-size: 13px; }
.text-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; letter-spacing: -0.02em; }
.text-small { font-size: 13px; color: #475569; }
.text-primary { color: #3182f6; }

.no-data td {
  text-align: center;
  padding: 100px;
  color: #94a3b8;
  font-size: 15px;
}

/* --- Modern Status Pills --- */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

/* Styles */
.status-pill.PENDING { background-color: #fff7ed; color: #9a3412; }
.status-pill.PENDING .status-dot { background-color: #f97316; }

.status-pill.SUBMITTED { background-color: #eff6ff; color: #1e40af; }
.status-pill.SUBMITTED .status-dot { background-color: #3b82f6; }

.status-pill.APPROVED { background-color: #f0fdf4; color: #166534; }
.status-pill.APPROVED .status-dot { background-color: #22c55e; }

.status-pill.REJECTED { background-color: #fef2f2; color: #991b1b; }
.status-pill.REJECTED .status-dot { background-color: #ef4444; }

.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 0.8s linear infinite;
}

/* --- Action Buttons --- */
.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.approve {
  background: #3366cc; color: white;
}
.btn-action.approve:hover {
  background: #254eda;
}

.btn-action.reject {
  background: #d32f2f; color: white;
}
.btn-action.reject:hover {
  background: #b71c1c;
}

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.title {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
  margin: 0;
}
</style>
