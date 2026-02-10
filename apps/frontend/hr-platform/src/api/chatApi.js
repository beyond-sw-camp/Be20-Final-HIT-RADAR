import api from './axios.js';

/**
 * 사용자 메시지 전송
 */
export function sendChatApi({ message, sessionId }) {
  return api.post('/api/chat', {
    message,
    sessionId,
  })
}

/**
 * 채팅 로그 조회 (나중에)
 */
export function fetchChatHistoryApi() {
  return api.get('/api/chat/history');
}

/**
 * 채팅 로그 초기화 (나중에)
 */
export function clearChatApi() {
  return api.delete('/api/chat/history');
}
