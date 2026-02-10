<template>
  <div class="notification-wrapper">
    <button class="bell-btn" @click="toggle">
      <svg viewBox="0 0 24 24" class="bell-icon">
        <path
          d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z"
        />
      </svg>

      <span v-if="unreadCount > 0" class="badge">
        {{ unreadCount }}
      </span>
    </button>

    <NotificationModal
      v-if="open"
      @close="open = false"
    />
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import NotificationModal from './NotificationModal.vue'
import { useNotificationStore } from '@/stores/notificationStore'

const open = ref(false)
const store = useNotificationStore()

const { unreadCount } = storeToRefs(store)

function toggle() {
  open.value = !open.value
}

</script>


<style scoped>
.notification-wrapper {
  position: relative;
}

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  color: inherit;
}

.bell-icon {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #e53935;
  color: white;
  font-size: 10px;
  font-weight: bold;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
