import axios from './axios.js'


/* 부서 목록 조회 */
export const fetchDepts = () => {
  return axios.get('/api/v1/departments/query');
}
