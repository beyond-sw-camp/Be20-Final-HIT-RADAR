import { defineStore } from 'pinia'
import {
  fetchNotifications,
  markNotificationRead,
  deleteNotification,
  markAllNotificationsRead,
} from '@/api/notificationApi'

function normalizeNotification(n) {
  return {
    ...n,
    read: n.read === true || n.read === 'Y',
    linkUrl: n.linkUrl ?? null, // ✅ linkUrl 추가
  }
}

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    loaded: false,
  }),

  getters: {
    unreadCount(state) {
      return state.notifications.filter((n) => !n.read).length
    },
  },

  actions: {
    async load() {
      if (this.loaded) return

      try {
        const res = await fetchNotifications()
        if (res && res.data) {
          this.notifications = Array.isArray(res.data) ? res.data.map(normalizeNotification) : []
        }
        this.loaded = true
      } catch (error) {
        console.error('Failed to load notifications:', error)
        this.notifications = []
        // Don't set loaded to true so it can retry later if needed, 
        // or set it to true to stop repeated failing attempts.
        this.loaded = true
      }
    },

    push(notification) {
      const normalized = normalizeNotification(notification)

      const idx = this.notifications.findIndex(
        (n) => n.id === normalized.id
      )

      if (idx !== -1) {
        this.notifications[idx] = {
          ...this.notifications[idx],
          ...normalized,
        }
      } else {
        this.notifications.unshift(normalized)
      }
    },

    async read(id) {
      await markNotificationRead(id)

      this.notifications = this.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    },

    async remove(id) {
      await deleteNotification(id)
      this.notifications = this.notifications.filter((n) => n.id !== id)
    },

    clear() {
      this.notifications = []
      this.loaded = false
    },

    async readAll() {
      if (this.unreadCount === 0) return

      await markAllNotificationsRead()

      this.notifications = this.notifications.map((n) => ({
        ...n,
        read: true,
      }))
    },
  },
})
