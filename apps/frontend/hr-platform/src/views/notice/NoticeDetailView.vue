<template>
  <div class="page-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>공지사항을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="!notice" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>공지사항을 찾을 수 없습니다.</p>
      <button @click="goBack" class="btn secondary">목록으로 돌아가기</button>
    </div>

    <div v-else class="content-wrapper">
      <!-- Header / Title Area -->
      <div class="header-section">
        <button @click="goBack" class="btn ghost back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          목록
        </button>
        <div class="action-buttons">
          <!-- Author Actions -->
          <button @click="goToEdit" class="btn secondary small">수정</button>
          <button @click="handleDelete" class="btn danger small">삭제</button>
        </div>
      </div>

      <div class="card detail-card">
        <div class="card-hd detail-header">
           <!-- Top Row: Category only -->
           <div class="meta-row top">
             <span class="badge">{{ notice.categoryName }}</span>
           </div>

           <h1 class="notice-title">{{ notice.title }}</h1>

           <!-- Bottom Row: Author | Date | Modifier -->
           <div class="meta-row bottom">
             <div class="author-info">
               <span class="author-name">작성자 : {{ notice.createdByName }}</span>
             </div>
             <div class="meta-divider"></div>
             <div class="date-info">
               <span>등록일 : {{ formatDateTime(notice.createdAt) }}</span>
             </div>
             <div class="meta-divider" v-if="notice.updatedAt"></div>
             <div class="update-info" v-if="notice.updatedAt">
               <span>최종 수정 : {{ formatDateTime(notice.updatedAt) }} <span v-if="notice.updatedByName">({{ notice.updatedByName }})</span></span>
             </div>
           </div>
        </div>

        <div class="card-bd detail-body">
          <div class="notice-content" v-html="processedContent"></div>
        </div>

        <!-- Attachments Section -->
        <div v-if="notice.attachments && notice.attachments.length > 0" class="card-ft attachments-section">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            첨부파일 ({{ notice.attachments.length }})
          </h3>
          <div class="attachment-list">
            <a
              v-for="(file, index) in notice.attachments"
              :key="index"
              :href="getAttachmentUrl(file.url)"
              target="_blank"
              rel="noopener noreferrer"
              class="attachment-item"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
              <span class="filename">{{ file.originalName }}</span>
              <span class="download-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useNoticeStore } from '@/stores/noticeStore';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const store = useNoticeStore();
const router = useRouter();
const route = useRoute();
const noticeId = route.params.id;

const notice = computed(() => store.currentNotice);
const loading = computed(() => store.loading);
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || apiBaseUrl

const processedContent = computed(() => {
  return processContent(notice.value?.content || '')
})

onMounted(() => {
  store.fetchNoticeDetail(noticeId);
});

function goBack() {
  router.push({ name: 'notice-list' });
}

function goToEdit() {
  router.push({ name: 'notice-edit', params: { id: noticeId } });
}

async function handleDelete() {
  if (confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
    try {
      await store.deleteNotice(noticeId);
      router.push({ name: 'notice-list' });
    } catch (error) {
      console.error('Failed to delete notice:', error);
    }
  }
}

function formatDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function processContent(content) {
  if (!content) return ''
  if (!fileBaseUrl) return content

  return content.replace(/<img[^>]+src="([^">]+)"/g, (match, src) => {
    if (src.startsWith('http')) return match
    if (!src.startsWith('/')) return match
    const baseUrl = fileBaseUrl.endsWith('/') ? fileBaseUrl.slice(0, -1) : fileBaseUrl
    return match.replace(src, `${baseUrl}${src}`)
  })
}

function getAttachmentUrl(url) {
  if (!url) return url
  if (url.startsWith('http')) return url
  if (!fileBaseUrl) return url
  const baseUrl = fileBaseUrl.endsWith('/') ? fileBaseUrl.slice(0, -1) : fileBaseUrl
  const clean = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${clean}`
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
.action-buttons {
  display: flex;
  gap: 8px;
}

/* Detail Card */
.detail-card {
  overflow: hidden;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

/* Detail Header */
.detail-header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px 32px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-soft); /* Slightly different bg for header maybe? */
}
.meta-row {
  display: flex;
  align-items: center;
}
.meta-row.top {
  justify-content: space-between;
}
.badge {
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid rgba(79, 124, 255, 0.2);
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
}
.date {
  font-size: 13px;
  color: var(--text-muted);
}
.notice-title {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--text-main);
  margin: 0;
}
.meta-row.bottom {
  gap: 16px;
  font-size: 13px;
  color: var(--text-sub);
}
.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.avatar-placeholder {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
}
.author-name {
  font-weight: 500;
  color: var(--text-main);
}
.meta-divider {
  width: 1px;
  height: 12px;
  background: var(--border);
}

/* Content Body */
.detail-body {
  padding: 40px 32px;
  min-height: 300px;
}
.notice-content {
  line-height: 1.8;
  font-size: 15px;
  color: var(--text-main);
}
.notice-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 16px 0;
  box-shadow: var(--shadow-sm);
}
.notice-content :deep(p) {
  margin-bottom: 16px;
}

/* Attachments */
.attachments-section {
  background: var(--bg-soft);
  padding: 20px 32px;
  border-top: 1px solid var(--border);
}
.attachments-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-sub);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  color: var(--text-main);
  transition: all 0.2s;
}
.attachment-item:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
  transform: translateY(-1px);
}
.file-icon {
  color: var(--text-sub);
}
.attachment-item:hover .file-icon {
  color: var(--primary);
}
.download-icon {
  opacity: 0;
  transition: opacity 0.2s;
}
.attachment-item:hover .download-icon {
  opacity: 1;
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
