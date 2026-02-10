// stores/documentStore.ts
import { defineStore } from 'pinia'
import {
  fetchDocuments,
  previewDocumentCsv,
  createDocument as createDocumentApi, // Renamed for clarity
  fetchDocumentDetail,
  updateDocument as updateDocumentApi,
  deleteDocument as deleteDocumentApi,
} from '@/api/documentApi'

export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [],
    selected: null,
    preview: null
  }),

  actions: {
    /* =========================
       문서
    ========================= */
    async loadDocuments() {
      this.documents = await fetchDocuments()
    },

    async select(doc) {
      const detail = await fetchDocumentDetail(doc.id)
      this.selected = detail
    },

    setDocument(document) {
      this.selected = document
    },

    async fetchDocumentById(id) {
      const detail = await fetchDocumentDetail(id);
      this.selected = detail; // Optional: keep the 'selected' state in sync
      return detail;
    },

    /* =========================
       CRUD operations
    ========================= */
    async createDocument(payload) {
      await createDocumentApi(payload)
      await this.loadDocuments() // Refresh list after creation
    },

    async updateDocument(id, payload) {
      await updateDocumentApi(id, payload)
      await this.loadDocuments() // Refresh list after update
      if (this.selected && this.selected.id === id) {
        this.selected = { ...this.selected, ...payload } // Update selected if it's the one being edited
      }
    },

    async deleteDocument(id) {
      await deleteDocumentApi(id)
      await this.loadDocuments() // Refresh list after deletion
      if (this.selected && this.selected.id === id) {
        this.selected = null // Clear selected if it was deleted
      }
    },

    /* =========================
       CSV → Preview
    ========================= */
    async uploadCsv(file) {
      const res = await previewDocumentCsv(file)

      // 서버 응답 구조 그대로 매핑
      this.preview = {
        docTitle: res.data.docTitle,
        chunks: res.data.chunks.map(c => ({
          section: c.section,
          content: c.content
        }))
      }
    },

    /* =========================
       Preview 편집
    ========================= */
    addChunk() {
      this.preview.chunks.push({
        section: '',
        content: ''
      })
    },

    removeChunk(index) {
      this.preview.chunks.splice(index, 1)
    },

    clearPreview() {
      this.preview = null
    },

    /* =========================
       최종 등록
    ========================= */
    async commitPreview(category) {
      if (!this.preview) return

      this.preview.category = category // Assign category from argument

      await this.createDocument(this.preview) // Use the new createDocument action

      // 등록 후 처리
      this.preview = null
    }
  }
})
