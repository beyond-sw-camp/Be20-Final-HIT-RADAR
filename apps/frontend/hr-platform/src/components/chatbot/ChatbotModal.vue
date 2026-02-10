<template>
  <div v-if="chat.opened" class="overlay" @click.self="chat.close()">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          <span class="bot-badge">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="5" ry="5" fill="url(#cute-bot-gradient-modal)" stroke="white" stroke-width="0" />
              <line x1="12" y1="4" x2="12" y2="1" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="1" r="1.5" fill="#3b82f6" />
              <circle cx="8" cy="11" r="2.5" fill="white" />
              <circle cx="16" cy="11" r="2.5" fill="white" />
              <circle cx="8" cy="11" r="1" fill="#333" />
              <circle cx="16" cy="11" r="1" fill="#333" />
              <path d="M10 16c.5.5 1.5.5 2 0" stroke="white" stroke-width="1.5" stroke-linecap="round" />
              <circle cx="5.5" cy="13.5" r="1" fill="#ff90b3" opacity="0.6"/>
              <circle cx="18.5" cy="13.5" r="1" fill="#ff90b3" opacity="0.6"/>
              <defs>
                <linearGradient id="cute-bot-gradient-modal" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#93C5FD" />
                  <stop offset="100%" stop-color="#3B82F6" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          HR 챗봇
        </div>
        <div class="modal-actions">
          <button class="btn ghost" @click="clearChat">초기화</button>
          <button class="btn ghost" @click="chat.close()">✕</button>
        </div>
      </div>

      <div class="modal-body" ref="bodyEl">
        <ChatMessage v-for="(m,i) in chat.messages" :key="i" :msg="m" />
      </div>

      <div class="modal-foot">
        <input class="chat-input" v-model="input" :placeholder="inputPlaceholder"
               @keydown.enter="onEnter" />
        <button class="btn primary" @click="send">전송</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch, computed } from 'vue'
import { useChatbotStore } from '@/stores/chatbotStore'
import ChatMessage from './ChatMessage.vue'

const chat = useChatbotStore()
const input = ref('')
const bodyEl = ref(null)

const inputPlaceholder = computed(() => {
  return '인사 제도/규정에 대해 질문하세요.';
});

function scrollBottom() {
  if (!bodyEl.value) return
  bodyEl.value.scrollTop = bodyEl.value.scrollHeight
}

function send() {
  const t = input.value.trim()
  if (!t) return
  chat.sendUser(t)
  input.value = ''
}

function clearChat() {
  chat.clear();
}

watch(
  () => chat.messages.length,
  async () => {
    await nextTick()
    scrollBottom()
  }
)

function onEnter(e) {
  if (e.isComposing) return
  send()
}
</script>

<style scoped>
.selected-category-display {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 4px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9em;
  color: #333;
}

.selected-category-display strong {
  color: #007bff;
}

.btn-clear-category {
  margin-left: 10px;
  font-size: 0.8em;
  padding: 2px 6px;
}
</style>
