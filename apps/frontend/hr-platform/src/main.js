import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/authStore'

import './assets/styles/theme.css'
import './assets/styles/base.css'
import './assets/styles/app.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import { useUiStore } from '@/stores/uiStore'
useUiStore(pinia).initTheme()

const auth = useAuthStore()
auth.loadFromStorage()

app.mount('#app')
