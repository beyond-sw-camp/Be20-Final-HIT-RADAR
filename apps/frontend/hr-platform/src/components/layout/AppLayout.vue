<template>
  <div class="app">
    <Header />
    <div class="main">
      <Sidebar />
      <main class="content">
        <router-view v-slot="{ Component, route }">          <transition name="fade" >
          <component :is="Component" :key="route.fullPath" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Chatbot Components -->
    <ChatbotButton />
    <ChatbotModal />
  </div>
</template>

<script setup>
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import ChatbotButton from '@/components/chatbot/ChatbotButton.vue'
import ChatbotModal from '@/components/chatbot/ChatbotModal.vue'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content {
  flex: 1;
  overflow-y: auto;
  background-color: #f8fafc; /* Light gray background for content area */
}

/* Page Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
