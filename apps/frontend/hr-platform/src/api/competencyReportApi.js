import axios from './axios.js'

/* 나의 리포트 목록 조회 */
export const fetchReportsByMe = (params) => {
  return axios.get('/api/v1/competency-report/me', {
    params
  });
}

/* 리포트 목록 조회 */
export const fetchReportsByAll
  = (params) => {
  return axios.get('/api/v1/competency-report/all', {
    params
  });
}

/* 리포트 회차 목록 조회 */
export const fetchReportsByCycle = (params) => {
  return axios.get('/api/v1/competency-report/cycle', {
    params
  });
}

export const fetchReportsByDept
  = (params) => {
  return axios.get('/api/v1/competency-report/all', {
    params
  });
}


/* 리포트 생성 여부 목록 조회 */
export const fetchCreatedReports
  = (params) => {
  return axios.get('/api/v1/competency-report/generated', {
    params
  });
}
//
/* 리포트 상세 조회 */
export const fetchReportsByCompetencyReportId = (id) => {
  return axios.get(`/api/v1/competency-report/${id}`);
}

/* 리포트 생성 */
export const createCompetencyReport = (payload) => {
  return axios.post('/api/v1/competency-report', payload);
}
