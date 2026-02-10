<template>
  <div class="page-container">
    <div class="section-title">
      <div>
        <h1>공지사항 수정</h1>
        <div class="sub">기존 공지사항 내용을 수정합니다.</div>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>공지사항 정보를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="notice" class="card form-card">
      <NoticeForm
        :notice="notice"
        submit-label="수정 완료"
        @submit="handleSubmit"
        @cancel="router.back()"
      />
    </div>
    
    <div v-else class="empty-state">
      <p>공지사항을 찾을 수 없습니다.</p>
      <button @click="router.back()" class="btn secondary">뒤로 가기</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'
import { useRouter, useRoute } from 'vue-router'
import NoticeForm from '@/components/notice/NoticeForm.vue'

const store = useNoticeStore()
const router = useRouter()
const route = useRoute()
const noticeId = route.params.id

const notice = computed(() => store.currentNotice)
const loading = computed(() => store.loading && !store.currentNotice)

onMounted(() => {
  store.fetchNoticeDetail(noticeId)
})

async function handleSubmit(payload) {
  const { title, content, categoryId, attachments, deletedAttachmentIds } = payload
  try {
    await store.updateNotice(noticeId, { title, content, categoryId, deletedAttachmentIds }, attachments)
    router.push({ name: 'notice-detail', params: { id: noticeId } })
  } catch (e) {
    console.error(e)
    // The alert is now handled by the Axios interceptor
  }
}
</script>

<style scoped>
.page-container {
  max-width: 900px;
  margin: 0 auto;
}
.form-card {
  padding: 30px;
  margin-top: 10px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
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
</style>