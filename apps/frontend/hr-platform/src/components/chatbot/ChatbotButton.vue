<template>
  <button class="chatbot-fab" @click="chat.toggle()">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" class="chatbot-icon">
       <!-- Cute Round Robot Face -->
      <rect x="2" y="4" width="20" height="16" rx="5" ry="5" fill="url(#cute-bot-gradient)" stroke="white" stroke-width="0" />
      <!-- Antennas -->
      <line x1="12" y1="4" x2="12" y2="1" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/>
      <circle cx="12" cy="1" r="1.5" fill="#3b82f6" />
      
      <!-- Big Eyes -->
      <circle cx="8" cy="11" r="2.5" fill="white" />
      <circle cx="16" cy="11" r="2.5" fill="white" />
      <circle cx="8" cy="11" r="1" fill="#333" />
      <circle cx="16" cy="11" r="1" fill="#333" />
      
      <!-- Small Smile -->
      <path d="M10 16c.5.5 1.5.5 2 0" stroke="white" stroke-width="1.5" stroke-linecap="round" />
      <!-- Cheeks -->
      <circle cx="5.5" cy="13.5" r="1" fill="#ff90b3" opacity="0.6"/>
      <circle cx="18.5" cy="13.5" r="1" fill="#ff90b3" opacity="0.6"/>

      <defs>
        <linearGradient id="cute-bot-gradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#93C5FD" />
          <stop offset="100%" stop-color="#3B82F6" />
        </linearGradient>
      </defs>
    </svg>
  </button>
</template>

<script setup>
import { useChatbotStore } from '@/stores/chatbotStore'
const chat = useChatbotStore()
</script>
