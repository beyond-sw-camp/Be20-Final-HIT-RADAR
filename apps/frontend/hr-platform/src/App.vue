<template>
  <RouterView />
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { connectSSE, disconnectSSE, reconnectSSE, getSseToken } from '@/api/notificationSse.js'
import { useNotificationStore } from '@/stores/notificationStore.js'
import { useAuthStore } from '@/stores/authStore.js'

const notificationStore = useNotificationStore()
const auth = useAuthStore()
const onMessage = (data) => {
  notificationStore.push(data)
}
let notificationsReady = false

onMounted(() => {
  auth.loadFromStorage()
})

const setupNotifications = async () => {
  if (!auth.isLoggedIn || notificationsReady) return
  notificationsReady = true
  try {
    await notificationStore.load()
    connectSSE(onMessage)
  } catch (error) {
    notificationsReady = false
    console.error('Failed to setup notifications:', error)
  }
}

const handleVisibilityChange = async () => {
  if (!auth.isLoggedIn) return
  if (document.visibilityState === 'visible') {
    await setupNotifications()
    reconnectSSE()
  } else {
    disconnectSSE(onMessage)
  }
}

const handleBeforeUnload = () => {
  disconnectSSE(onMessage)
}

const handleStorage = async (event) => {
  if (event.key !== 'accessToken') return
  if (!auth.isLoggedIn) return
  const current = localStorage.getItem('accessToken')
  if (current && current !== getSseToken()) {
    notificationsReady = false
    await setupNotifications()
    reconnectSSE()
  }
}

// 로그인 상태 변화에만 반응
watch(
  () => auth.isLoggedIn,
  async (loggedIn, wasLoggedIn) => {
    // 로그인된 상태면 항상 알림 초기화 시도
    if (loggedIn) {
      await setupNotifications()
      return
    }

    // 로그아웃으로 "전환"될 때만 SSE 해제
    if (!loggedIn && wasLoggedIn) {
      disconnectSSE()
      notificationStore.clear()
      notificationsReady = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('storage', handleStorage)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('storage', handleStorage)
})
</script>
