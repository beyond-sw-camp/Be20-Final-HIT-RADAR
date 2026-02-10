import api from './axios'

export function fetchNotifications() {
  return api.get('/api/notifications')
}

export function markNotificationRead(id) {
  return api.post(`/api/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return api.post('/api/notifications/read-all')
}

export function deleteNotification(id) {
  return api.delete(`/api/notifications/${id}`)
}
