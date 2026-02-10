<template>
  <div class="page-container">
    <div class="section-title">
      <div>
        <h1>공지 작성</h1>
        <div class="sub">새로운 공지사항을 작성하여 등록합니다.</div>
      </div>
    </div>

    <div class="card form-card">
      <NoticeForm
        submit-label="작성 완료"
        @submit="handleSubmit"
        @cancel="router.back()"
      />
    </div>
  </div>
</template>

<script setup>
import { useNoticeStore } from '@/stores/noticeStore'
import { useRouter } from 'vue-router'
import NoticeForm from '@/components/notice/NoticeForm.vue'

const store = useNoticeStore()
const router = useRouter()

async function handleSubmit(payload) {
  const { title, content, categoryId, attachments } = payload
  try {
    await store.createNotice({ title, content, categoryId }, attachments)
    router.push({ name: 'notice-list' })
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
</style>