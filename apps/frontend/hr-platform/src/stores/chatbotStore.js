import { defineStore } from 'pinia'
import { sendChatApi } from '@/api/chatApi'

// Simple unique ID generator for sessionId
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const useChatbotStore = defineStore('chatbot', {
  state: () => ({
    opened: false,
    messages: [
      { from: 'bot', text: '안녕하세요! 인사 제도/규정 관련해서 무엇을 도와드릴까요?' },
    ],
    sessionId: generateUniqueId(), // Initialize sessionId
  }),

  actions: {
    toggle() {
      this.opened = !this.opened
    },
    close() {
      this.opened = false
    },
    clear() {
      this.messages = [
        { from: 'bot', text: '안녕하세요! 인사 제도/규정 관련해서 무엇을 도와드릴까요?' },
      ]
      this.sessionId = generateUniqueId() // Reset sessionId on chat clear
    },
    async sendUser(text) {
      this.messages.push({ from: 'user', text })

      try {
        const response = await sendChatApi({
          message: text,
          sessionId: this.sessionId,
        });
        this.messages.push({ from: 'bot', text: response.data.answer });
      } catch (error) {
        console.error('Error sending chat message:', error);
        this.messages.push({ from: 'bot', text: '죄송합니다. 메시지를 보내는 데 실패했습니다. 다시 시도해 주세요.' });
      }
    },
  },
})
