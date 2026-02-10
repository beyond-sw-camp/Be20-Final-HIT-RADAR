import { defineStore } from 'pinia'
import * as noticeApi from '@/api/noticeApi'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    // Data returned from the API { items, totalPages, totalCount }
    data: null,
    categories: [],
    // All search and pagination state is consolidated here
    searchCond: {
      keyword: '',
      categoryId: '',
      sortKey: 'CREATED_AT',
      sortDir: 'DESC',
      page: 1,
      size: 10,
    },
    currentNotice: null,
    loading: false
  }),

  actions: {
    // CATEGORY CRUD
    async fetchCategories() {
      try {
        const response = await noticeApi.fetchNoticeCategories()
        this.categories = response.data.data
      } catch (error) {
        console.error('Failed to fetch notice categories:', error)
      }
    },
    async createCategory(categoryName) {
      await noticeApi.createNoticeCategory(categoryName)
      await this.fetchCategories()
    },
    async updateCategory(id, categoryName) {
      await noticeApi.updateNoticeCategory(id, categoryName)
      await this.fetchCategories()
    },
    async deleteCategory(id) {
      await noticeApi.deleteNoticeCategory(id)
      await this.fetchCategories()
    },

    // NOTICE SEARCH
    async searchNotices() {
      this.loading = true
      
      const params = {
        'page.page': this.searchCond.page,
        'page.size': this.searchCond.size,
        'cond.sortKey': this.searchCond.sortKey,
        'cond.sortDir': this.searchCond.sortDir,
      }

      if (this.searchCond.keyword) {
        params['cond.keyword'] = this.searchCond.keyword
      }
      if (this.searchCond.categoryId) {
        params['cond.categoryId'] = this.searchCond.categoryId
      }

      try {
        const response = await noticeApi.searchNotices(params)
        const responseData = response.data.data
        this.data = {
          items: responseData.items,
          totalPages: responseData.page.totalPages,
          totalCount: responseData.page.totalCount,
        }
        this.searchCond.page = responseData.page.page // Sync page number from response
      } finally {
        this.loading = false
      }
    },

    // Action for when filters (keyword, category, etc.) are changed
    setFilters(newFilters) {
      this.searchCond = { ...this.searchCond, ...newFilters, page: 1 } // Reset to page 1
      this.searchNotices()
    },

    // Action for when only the page number changes
    setPage(newPage) {
      if (this.searchCond.page !== newPage) {
        this.searchCond.page = newPage
        this.searchNotices()
      }
    },

    // NOTICE CRUD
    async fetchNoticeDetail(id) {
      this.loading = true
      try {
        this.currentNotice = (await noticeApi.fetchNoticeDetail(id)).data.data
      } finally {
        this.loading = false
      }
    },

    async createNotice(notice, files) {
      this.loading = true
      try {
        await noticeApi.createNotice(notice, files)
        // After creating, redirect or refresh the list
        await this.setFilters({}) // Refresh list, reset to page 1
      } finally {
        this.loading = false
      }
    },

    async updateNotice(id, notice, files) {
      this.loading = true
      try {
        this.currentNotice = await noticeApi.updateNotice(id, notice, files)
        // After updating, you might want to refresh the list or the detail view
        await this.searchNotices()
      } finally {
        this.loading = false
      }
    },

    async deleteNotice(id) {
      this.loading = true;
      try {
        await noticeApi.deleteNotice(id);
      } catch (error) {
        console.error('Failed to delete notice:', error);
        throw error; // Re-throw to allow component to handle
      } finally {
        this.loading = false;
      }
    },

    // IMAGE HANDLING
    async uploadImage(file) {
      const response = await noticeApi.uploadImage(file)
      return response.data.data
    },

    async deleteImage(imageUrl) {
      await noticeApi.deleteImage(imageUrl)
    }
  }
})