import axios from './axios.js'

export async function fetchDocuments() {
  const res = await axios.get('/api/v1/docs')
  return res.data.data.documents
}

export async function fetchDocumentDetail(id) {
  const res = await axios.get(`/api/v1/docs/${id}`)
  return res.data.data
}

export async function previewDocumentCsv(file) {
  const form = new FormData()
  form.append('file', file)

  const res = await axios.post('/api/v1/docs/preview', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function createDocument(payload) {
  const res = await axios.post('/api/v1/docs', payload)
  return res.data
}

export async function updateDocument(id, payload) {
  const res = await axios.put(`/api/v1/docs/${id}`, payload)
  return res.data
}

export async function deleteDocument(id) {
  const res = await axios.delete(`/api/v1/docs/${id}`)
  return res.data
}

export async function downloadDocumentTemplate() {
  const res = await axios.get('/api/v1/docs/template', {
    responseType: 'blob'
  })
  return res.data
}

