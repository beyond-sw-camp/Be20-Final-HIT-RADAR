import axios from './axios.js'

/* 태그 등록*/
export const createTag = (payload) => {
  return axios.post('/api/v1/tags', payload);
}

/* 태그 목록 조회 */
export const fetchTags = (params) => {
  return axios.get('/api/v1/tags', {
    params
  });
}

export const deleteTags = (payload) => {
  return axios.post('/api/v1/tags/delete', payload);
}

/* 태그 목록 조회 */
export const fetchTagsByTagName = (params) => {
  return axios.get(`/api/v1/tags/${params}`);
}