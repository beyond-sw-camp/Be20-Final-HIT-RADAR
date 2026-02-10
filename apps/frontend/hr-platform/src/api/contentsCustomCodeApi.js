import axios from './axios.js'

/* 그룹 코드 목록 조회 */
export const fetchGroupCodes = () => {
  return axios.get('/api/v1/contents/custom-code/groups');
}

/* 커스텀 코드 목록 조회 */
export const fetchCustomCodeByGroupCode = (params) => {
  return axios.get('/api/v1/contents/custom-code/customCodes', {
    params
  });
};

/* 커스텀 코드 등록 */
export const createCustomCode = (payload) => {
  return axios.post('/api/v1/contents/custom-code', payload);
}

/* 같은지 확인 */
export const existCustomCode = (customCode) =>
  axios.get('/api/v1/contents/custom-code/existCustomCode', {
    params: { customCode }
  })

/* 커스텀 코드 삭제 */
export const deleteCustomCodes = (payload) => {
  return axios.post('/api/v1/contents/custom-code/delete', payload);
}

/* 커스텀 목록들 가져오기 */
export const fetchCustomCodes = () => {
  return axios.get('/api/v1/contents/custom-code');
}
