<template>
  <section class="narrow-container">
    <div class="section-title">
      <div>
        <h1>회사 정보 관리</h1>
      </div>
    </div>

    <div v-if="loading" class="loading-state">데이터를 불러오는 중...</div>

    <div v-else-if="company" class="company-detail">
      <div class="grid cols-1">
        <!-- Basic Info Card -->
        <BaseCard>
          <div class="card-hd">
            <h2>기본 정보</h2>
          </div>
          <div class="card-bd info-list">
            <div class="info-item">
              <span class="label">회사명</span>
              <span class="value">{{ company.companyName }}</span>
            </div>
            <div class="info-item">
              <span class="label">회사코드</span>
              <span class="value">{{ company.comCode || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">주소</span>
              <span class="value">{{ company.address || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">설립일</span>
              <span class="value">{{ company.foundDate || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">사업자 등록번호</span>
              <span class="value">{{ company.bizNo || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">대표자명</span>
              <span class="value">{{ company.ceoName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">대표 전화</span>
              <span class="value">{{ company.comTel || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">이메일</span>
              <span class="value">{{ company.comEmail || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">등록일</span>
              <span class="value">{{ company.createdAt?.split('T')[0] || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">최근 수정일</span>
              <span class="value">{{ company.updatedAt?.split('T')[0] || '-' }}</span>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Action Footer -->
      <div class="action-footer">
        <button class="btn primary" @click="openEditModal">
          <i class="pi pi-pencil"></i> 정보 수정
        </button>
        <button class="btn danger outline" @click="handleDelete" v-if="!company.isDeleted || company.isDeleted === 'N'">
          삭제하기
        </button>
      </div>

    </div>

    <div v-else class="empty-state">
      <i class="pi pi-exclamation-circle"></i>
      <p>회사 정보를 불러올 수 없습니다.</p>
    </div>

    <!-- Edit Modal -->
    <CompanyFormModal 
      v-model="form"
      :show="showModal"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleUpdate"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import CompanyFormModal from '@/components/company/CompanyFormModal.vue'
import { fetchMyCompany, updateCompany, deleteCompany } from '@/api/companyApi'

const company = ref(null)
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)

const form = ref({
  comName: '',
  address: '',
  bizNo: '',
  ceoName: '',
  comEmail: '',
  foundDate: '',
  comTel: '',
  description: ''
})

const loadCompany = async () => {
  loading.value = true
  try {
    const res = await fetchMyCompany()
    company.value = res.data?.data
  } catch (error) {
    console.error('Failed to load company info', error)
  } finally {
    loading.value = false
  }
}

onMounted(loadCompany)

const openEditModal = () => {
  if (!company.value) return
  const detail = company.value
  
  form.value = {
    comName: detail.companyName,
    address: detail.address || '',
    bizNo: detail.bizNo || '',
    ceoName: detail.ceoName || '',
    comEmail: detail.comEmail || '',
    foundDate: detail.foundDate || '',
    comTel: detail.comTel || '',
    description: detail.description || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleUpdate = async () => {
  if (!company.value) return
  submitting.value = true
  try {
    await updateCompany(company.value.companyId, form.value)
    alert('회사 정보가 수정되었습니다.')
    closeModal()
    await loadCompany()
  } catch (error) {
    console.error('Update failed', error)
    alert('수정에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('정말 회사를 삭제하시겠습니까? 돌이킬 수 없습니다.')) return
  try {
    await deleteCompany(company.value.companyId)
    alert('회사가 삭제되었습니다.')
    await loadCompany()
  } catch (error) {
    console.error('Delete failed', error)
    alert('삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
.narrow-container {
  max-width: 720px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.company-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-list {
  display: flex;
  flex-direction: column;
}
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}
.info-item:last-child {
  border-bottom: none;
}
.label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.value {
  font-weight: 500;
  color: #1e293b;
}



.action-footer {
  display: flex;
  flex-direction: row-reverse; /* Put primary on right */
  justify-content: flex-start;
  gap: 12px;
  margin-top: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.btn {
  height: 42px;
  padding: 0 20px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.grid { display: grid; gap: 24px; }
.cols-2 { grid-template-columns: 1fr 1fr; }

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
