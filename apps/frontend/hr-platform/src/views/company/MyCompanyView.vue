<template>
  <section class="narrow-container">
    <div class="section-title">
      <div>
        <h1>내 회사 정보</h1>
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

    </div>

    <div v-else class="empty-state">
      <i class="pi pi-exclamation-circle"></i>
      <p>회사 정보를 불러올 수 없습니다.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { fetchMyCompany } from '@/api/companyApi'

const company = ref(null)
const loading = ref(false)

const loadCompany = async () => {
  loading.value = true
  try {
    const res = await fetchMyCompany()
    company.value = res.data?.data
  } catch (e) {
    console.error('Failed to load company info', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadCompany)
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

.loading-state, .empty-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
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
