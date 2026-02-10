import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'light',
  }),
  actions: {
    initTheme() {
      this.theme = 'light'
      document.documentElement.setAttribute('data-theme', 'light')
    },
  },
})
