<template>
  <div class="page-container">
    <!-- Page Header -->
    <div class="page-header">
      <h2 class="title">회사 관리</h2>
    </div>

    <!-- Filter Card -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group-main">
          <div class="filter-input-row">
            <div class="filter-group">
              <label class="filter-label">회사명</label>
              <input 
                type="text" 
                v-model="keyword" 
                placeholder="회사명 검색..." 
                class="form-input"
                @keyup.enter="handleSearch"
              />
            </div>
            <div class="filter-actions">
              <button class="btn-search" @click="handleSearch">검색</button>
            </div>
          </div>
          <div class="filter-sub-row">
            <label class="checkbox-wrapper">
              <input type="checkbox" v-model="includeDeleted" @change="handleSearch" />
              <span class="check-ui"></span>
              <span class="label-text">삭제된 회사 포함</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- List Card -->
    <div class="card list-card">
      <table class="data-table">
        <colgroup>
          <col style="width: 10%" />
          <col style="width: 24%" />
          <col style="width: 14%" />
          <col style="width: 14%" />
          <col style="width: 10%" />
          <col style="width: 16%" />
          <col style="width: 12%" />
        </colgroup>
        <thead>
          <tr>
            <th>회사코드</th>
            <th>회사명</th>
            <th>사업자 번호</th>
            <th>대표 전화</th>
            <th>상태</th>
            <th>생성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="no-data">
            <td colspan="7">
              <div class="loading-spinner"></div>
            </td>
          </tr>
          <tr v-else-if="companies.length === 0" class="no-data">
            <td colspan="7">등록된 회사가 없습니다.</td>
          </tr>
          <tr 
            v-else 
            v-for="com in companies" 
            :key="com.companyId" 
            class="clickable-row" 
            @click="openEditModal(com)"
          >
            <td class="text-mono text-primary fw-bold">{{ com.comCode || '-' }}</td>
            <td class="fw-bold text-dark">{{ com.companyName }}</td>
            <td class="text-mono">{{ com.bizNo || '-' }}</td>
            <td class="text-mono">{{ com.comTel || '-' }}</td>
            <td>
              <span 
                class="status-pill" 
                :class="{ 'APPROVED': !com.isDeleted || com.isDeleted === 'N', 'REJECTED': com.isDeleted === 'Y' }"
              >
                <span class="status-dot"></span>
                {{ (!com.isDeleted || com.isDeleted === 'N') ? '정상' : '삭제됨' }}
              </span>
            </td>
            <td class="text-gray text-mono">{{ formatDateShort(com.createdAt) }}</td>
            <td @click.stop>
              <div class="action-buttons">
                <button 
                  v-if="!com.isDeleted || com.isDeleted === 'N'"
                  class="btn-action reject" 
                  @click="handleDelete(com.companyId)"
                >삭제</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination (Notice Style) -->
      <div v-if="totalPages > 0" class="pagination">
        <button @click="changePage(1)" :disabled="currentPage <= 1" class="btn-page ghost" title="First Page">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="11 17 6 12 11 7"></polyline>
            <polyline points="18 17 13 12 18 7"></polyline>
          </svg>
        </button>
        <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1" class="btn-page ghost" title="Previous Page">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <span class="page-count">
          <span class="current">{{ currentPage }}</span>
          <span class="divider">/</span>
          <span class="total">{{ totalPages }}</span>
        </span>

        <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages" class="btn-page ghost" title="Next Page">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <button @click="changePage(totalPages)" :disabled="currentPage >= totalPages" class="btn-page ghost" title="Last Page">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <CompanyFormModal 
      v-model="form"
      :show="showModal"
      :submitting="submitting"
      :show-save="false"
      :show-delete="true"
      @close="closeModal"
      @submit="handleUpdate"
      @delete="() => handleDelete(currentTargetId)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import CompanyFormModal from '@/components/company/CompanyFormModal.vue'
import { 
  fetchCompanies, 
  fetchCompanyDetail, 
  updateCompany, 
  deleteCompany 
} from '@/api/companyApi'

const companies = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const keyword = ref('')
const includeDeleted = ref(false)

// Pagination state
const currentPage = ref(1)
const totalPages = ref(0)
const pageSize = ref(15)

const form = ref({
  comName: '',
  address: '',
  bizNo: '',
  ceoName: '',
  comEmail: '',
  foundDate: '',
  comTel: '',
})
const currentTargetId = ref(null)

const loadCompanies = async () => {
  loading.value = true
  try {
    const res = await fetchCompanies({ 
      'cond.keyword': keyword.value,
      'cond.includeDeleted': includeDeleted.value,
      'page.page': currentPage.value,
      'page.size': pageSize.value
    })
    
    // PageResponse structure
    const responseData = res.data?.data
    
    if (responseData && responseData.items) {
      // Normal PageResponse path
      companies.value = responseData.items || []
      totalPages.value = responseData.page?.totalPages || 0
      currentPage.value = responseData.page?.currentPage || 1
    } else if (Array.isArray(responseData)) {
      // Fallback for direct List path
      companies.value = responseData
      totalPages.value = 1
      currentPage.value = 1
    } else {
      companies.value = []
      totalPages.value = 0
    }
    
  } catch (e) {
    console.error('Failed to load companies', e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadCompanies()
}

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadCompanies()
}

onMounted(loadCompanies)

const openEditModal = async (com) => {
  currentTargetId.value = com.companyId
  try {
    const res = await fetchCompanyDetail(com.companyId)
    const detail = res.data?.data
    form.value = {
      comName: detail.companyName,
      address: detail.address || '',
      bizNo: detail.bizNo || '',
      ceoName: detail.ceoName || '',
      comEmail: detail.comEmail || '',
      foundDate: detail.foundDate || '',
      comTel: detail.comTel || '',
    }
    showModal.value = true
  } catch (e) {
    console.error('Failed to load company detail', e)
    alert('회사 정보를 불러오지 못했습니다.')
  }
}

const closeModal = () => {
  showModal.value = false
}

const handleUpdate = async () => {
  submitting.value = true
  try {
    await updateCompany(currentTargetId.value, form.value)
    alert('회사 정보가 수정되었습니다.')
    closeModal()
    await loadCompanies()
  } catch (e) {
    console.error('Update failed', e)
    alert('수정에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('정말 이 회사를 삭제하시겠습니까? 관련 데이터가 모두 삭제될 수 있습니다.')) return
  try {
    await deleteCompany(id)
    alert('회사가 삭제되었습니다.')
    showModal.value = false
    await loadCompanies()
  } catch (e) {
    console.error('Delete failed', e)
    alert('삭제에 실패했습니다.')
  }
}

const formatDateShort = (ts) => {
  if (!ts) return '-'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
</script>

<style scoped>
/* Common Styles aligned with AdminComAppList.vue */
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
  font-weight: 800;
  color: var(--primary);
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

.filter-group-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.filter-input-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.filter-sub-row {
  display: flex;
  padding-left: 2px;
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

.form-input {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 14px;
  width: 240px;
  color: #111827;
  transition: all 0.2s ease-in-out;
  background-color: #f9fafb;
}
.form-input:focus {
  outline: none;
  background-color: white;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  cursor: pointer;
}
.checkbox-wrapper input { display: none; }
.check-ui {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
}
.checkbox-wrapper input:checked + .check-ui {
  background: #3b82f6;
  border-color: #3b82f6;
}
.check-ui::after {
  content: "";
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: none;
  margin-bottom: 2px;
}
.checkbox-wrapper input:checked + .check-ui::after {
  display: block;
}
.label-text {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.filter-actions {
  display: flex;
  align-items: center; 
  height: 42px;
}

.btn-search {
  height: 42px;
  padding: 0 28px;
  background: #3b82f6;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}
.btn-search:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
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
  user-select: none;
}

.data-table th {
  background: #f9fafb;
  padding: 18px 24px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #475569;
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
  text-align: center;
}
.data-table tr:last-child td { border-bottom: none; }

.clickable-row { 
  cursor: pointer; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.clickable-row:hover { 
  background: #f8fafc; 
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  position: relative; z-index: 1;
}

.text-dark { color: #0f172a; }
.fw-bold { font-weight: 600; }
.text-gray { color: #94a3b8; font-size: 13px; }
.text-mono { font-family: monospace; letter-spacing: -0.02em; }
.text-primary { color: #3b82f6; }

.no-data td {
  text-align: center;
  padding: 100px;
  color: #94a3b8;
  font-size: 15px;
}

/* Pagination Styles (Notice Style) */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border-top: 1px solid #f1f5f9;
}
.page-count {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 12px;
  font-size: 14px;
}
.current { font-weight: 700; color: #111827; }
.divider { color: #94a3b8; }
.total { color: #64748b; }

.btn-page {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-page:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.btn-page:not(:disabled):hover {
  background: #f8fafc;
  color: #111827;
  border-color: #cbd5e1;
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

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

.action-buttons {
  display: flex;
  gap: 6px;
  justify-content: center;
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
.btn-action.reject { background: #fee2e2; color: #ef4444; }
.btn-action.reject:hover { background: #fecaca; }

@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
