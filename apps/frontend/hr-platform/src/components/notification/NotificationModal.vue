<template>
  <div class="modal">
    <div class="header">
      <span>알림</span>
      <button class="close" @click="$emit('close')">✕</button>
    </div>

    <ul class="list">
      <li
        v-for="n in store.notifications"
        :key="n.id"
        :class="{ unread: !n.read }"
        @click="go(n)"
      >
        <div class="content">
          <div class="title">{{ n.title }}</div>
          <div class="msg">{{ n.message }}</div>
          <div class="time">{{ formatTime(n.createdAt) }}</div>
        </div>

        <div class="actions" @click.stop>
          <button
            v-if="!n.read"
            class="read"
            @click="store.read(n.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </button>
          <button
            class="remove"
            @click="store.remove(n.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </li>

      <li v-if="store.notifications.length === 0" class="empty">
        알림이 없습니다.
      </li>
    </ul>

    <!-- 맨 아래 전체 읽기 -->
    <div class="footer">
      <button
        class="read-all"
        :disabled="store.unreadCount === 0"
        @click="readAll"
      >
        전체 읽기
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notificationStore'

const router = useRouter()
const store = useNotificationStore()

async function go(n) {
  if (!n.read) {
    await store.read(n.id)
  }
  if (n.linkUrl) {
    await router.push(n.linkUrl)
  }
}

async function readAll() {
  await store.readAll()
}

function formatTime(iso) {
  return new Date(iso).toLocaleString()
}
</script>

<style scoped>
.modal {
  height: auto;
  max-height: 80vh;
  display: flex;
  flex-direction: column;

  position: absolute;
  right: 0;
  top: 42px;
  width: 360px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0,0,0,.18);
  overflow: hidden;
  z-index: 10001;
  color: #0f172a;                    /* 기본 텍스트 색 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}

.close {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #64748b;
}

.close:hover {
  color: #0f172a;
}

.list {
  flex: 1;
  overflow-y: auto;

  padding: 0;
  margin: 0;
  list-style: none;
}

li {
  position: relative;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  background: #fff;
  cursor: pointer;
}

/* unread 배경 레이어 */
li.unread::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #f0f7ff;
  z-index: 0;
}

/* 실제 내용은 위로 */
li > * {
  position: relative;
  z-index: 1;
}

li:last-child {
  border-bottom: none;
}
/* 안 읽은 알림 강조 */
li.unread {
  background: #f0f7ff;
}

.content {
  flex: 1;
  padding-right: 60px; /* 아이콘 버튼 공간 확보 */
}

.title {
  font-weight: 700;
  margin-bottom: 4px;
  font-size: 14px;
}

.msg {
  font-size: 13px;
  color: #475569;
  margin: 0;
  padding: 0;
  line-height: 1.4;
}

.time {
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.actions {
  position: absolute;
  top: 14px;
  right: 16px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
}

/* 버튼 스타일 */
.actions button {
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  border: 1px solid transparent;
  background: #f8fafc;
  color: #334155;
  transition: all .15s ease;
}

.actions button svg {
  width: 14px;
  height: 14px;
}

/* 읽음 버튼 */
.actions button:not(.remove) {
  border-color: #c7d2fe;
  color: #1d4ed8;
  background: #eef2ff;
}

.actions button:not(.remove):hover {
  background: #e0e7ff;
}

/* 삭제 버튼 */
.actions .remove {
  border-color: #fecaca;
  color: #dc2626;
  background: #fef2f2;
}

.actions .remove:hover {
  background: #fee2e2;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
}

.footer {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
  background: #fafafa;
}

.read-all {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  border: 1px solid #c7d2fe;
  background: #eef2ff;
  color: #1d4ed8;
  cursor: pointer;
  transition: all .15s ease;
}

.read-all:hover:not(:disabled) {
  background: #e0e7ff;
}

.read-all:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

</style>
