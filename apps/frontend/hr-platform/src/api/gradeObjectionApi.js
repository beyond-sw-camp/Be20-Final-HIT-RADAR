import axios from './axios.js'

/**
 * 개인 등급에 대한 이의제기 등록
 */
export const registerGradeObjection = ({ individualGradeId, objectionReason }) => {
  return axios.post('/api/v1/grade-objections', {
    individualGradeId,
    objectionReason,
  })
}

/**
 * 이의제기 승인
 */
export const acceptGradeObjection = (objectionId, result) => {
  return axios.post(`/api/v1/grade-objections/${objectionId}/accept`, {
    result,
  })
}

/**
 * 이의제기 반려
 */
export const rejectGradeObjection = (objectionId, result) => {
  return axios.post(`/api/v1/grade-objections/${objectionId}/reject`, {
    result,
  })
}

/**
 * 개인 등급에 대한 이의제기 목록 조회
 */
export const fetchGradeObjectionsByIndividualGrade = (individualGradeId) => {
  return axios.get('/api/v1/grade-objections', {
    params: {
      individualGradeId,
    },
  })
}

/**
 * 부서별 이의제기 목록 조회
 */
export const fetchGradeObjectionsByDepartment = () => {
  return axios.get(`/api/v1/grade-objections/departments`)
}

/**
 * 회사 전체 이의제기 목록 조회
 */
export const fetchAllGradeObjections = () => {
  return axios.get('/api/v1/grade-objections/companies/me')
}
