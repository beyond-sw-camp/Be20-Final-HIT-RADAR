<template>
  <div class="page-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>규정을 불러오는 중입니다...</p>
    </div>
    
    <div v-else-if="!document" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>문서를 찾을 수 없습니다.</p>
      <button @click="goBack" class="btn secondary">목록으로 돌아가기</button>
    </div>

    <div v-else-if="document" class="content-wrapper">
      <!-- Header / Title Area -->
      <div class="header-section">
        <button @click="goBack" class="btn ghost back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          목록
        </button>
      </div>

      <div class="card detail-card">
        <div class="card-hd detail-header">
           <div class="meta-row top">
             <span class="badge">{{ document.category }}</span>
           </div>
           <h1 class="doc-title">{{ document.title }}</h1>
        </div>

        <div class="card-bd detail-body">
           <div v-if="document.chunks && document.chunks.length > 0" class="chunks-list">
             <div
              v-for="chunk in document.chunks"
              :key="chunk.index"
              class="detail-chunk"
            >
              <h4 class="chunk-title">{{ chunk.section }}</h4>
              <p class="chunk-content">{{ chunk.content }}</p>
            </div>
           </div>
           <div v-else class="empty-content">
             내용이 없습니다.
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documentStore'

const route = useRoute()
const router = useRouter()
const store = useDocumentStore()

const document = ref(null)
const loading = ref(true)

onMounted(async () => {
  const documentId = route.params.id
  if (documentId) {
    const fetchedDoc = await store.fetchDocumentById(documentId)
    document.value = fetchedDoc
  }
  loading.value = false
})

function goBack() {
  router.push({ name: 'policy' })
}
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0 auto;
}

/* Header & Navigation */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding-left: 8px;
  color: var(--text-sub);
}
.back-btn:hover {
  color: var(--text-main);
  background: rgba(255,255,255,0.05);
}

/* Detail Card */
.detail-card {
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  background: var(--card);
}

/* Detail Header */
.detail-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px 40px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-soft);
}
.meta-row {
  display: flex;
  align-items: center;
}
.badge {
  background: rgba(45, 212, 191, 0.1); /* Teal tint matching Policy View */
  color: var(--good);
  border: 1px solid rgba(45, 212, 191, 0.2);
  padding: 4px 12px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
}
.doc-title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  color: var(--text-main);
  margin: 0;
}

/* Content Body */
.detail-body {
  padding: 40px;
  min-height: 300px;
  background: var(--panel);
}
.chunks-list {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.detail-chunk {
  /* Remove box styling, make it look like a document flow */
  border-bottom: 1px solid var(--border);
  padding-bottom: 30px;
}
.detail-chunk:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.chunk-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.chunk-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 18px;
  background: var(--primary);
  border-radius: 2px;
}

.chunk-content {
  font-size: 16px;
  color: var(--text-main);
  line-height: 1.8;
  white-space: pre-wrap;
  margin: 0;
}

.empty-content {
  text-align: center;
  color: var(--text-sub);
  padding: 40px;
  font-style: italic;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  items-align: center;
  justify-content: center;
  padding: 80px 0;
  text-align: center;
  color: var(--text-sub);
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}
</style>
