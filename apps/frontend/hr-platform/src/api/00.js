import axios from './axios.js'

/* 컨텐츠 목록 조회 */
export const fetchReportsByMe = (params) => {
  return axios.get('/api/v1/competency-report/me', {
    params
  });
}

/* 컨텐츠 목록 조회 */
export const fetchReportsByAll
  = (params) => {
  return axios.get('/api/v1/competency-report/all', {
    params
  });
}

/* 컨텐츠 목록 조회 */
export const fetchReportsByDept
  = (params) => {
  return axios.get('/api/v1/competency-report/all', {
    params
  });
}

2
/* 컨텐츠 생성 조회 */
export const fetchCreatedReports
  = (params) => {
  return axios.get('/api/v1/competency-report/all', {
    params
  });
}
