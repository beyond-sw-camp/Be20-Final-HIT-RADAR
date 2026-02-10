import axios from './axios.js'


/* 컨텐츠 목록 조회 */
export const fetchContents = (params) => {
  return axios.get('/api/v1/learning-contents', {
    params
  });
}

/* 컨텐츠 등록 */
export const createContent = (payload) => {
  return axios.post('/api/v1/learning-contents', payload);
}

/* 컨텐츠 상세 */
export const fetchContentDetail = (id) => {
  return axios.get(`/api/v1/learning-contents/${id}`)
}

/* 컨텐츠 등록 */
export const updateContent = (payload) => {
  return axios.put('/api/v1/learning-contents', payload);
}

/* 컨텐츠 삭제 */
export const deleteContent = (contentId) => {
  return axios.delete(`/api/v1/learning-contents/${contentId}`)
}
