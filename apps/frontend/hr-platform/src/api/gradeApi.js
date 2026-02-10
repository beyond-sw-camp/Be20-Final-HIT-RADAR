import axios from './axios.js'

// 회사 등급 목록 조회
export const fetchCompanyGrades = () => {
  return axios.get('/api/v1/grades')
}

// 회사 등급 등록
export const createCompanyGrade = (data) => {
  return axios.post('/api/v1/grades', {
    gradeName: data.gradeName,
    gradeOrder: data.gradeOrder,
  })
}

// 회사 등급 수정
export const updateCompanyGrade = (gradeId, data) => {
  return axios.put(`/api/v1/grades/${gradeId}`, {
    gradeName: data.gradeName,
    gradeOrder: data.gradeOrder,
  })
}

// 회사 등급 삭제
export const deleteCompanyGrade = (gradeId) => {
  return axios.delete(`/api/v1/grades/${gradeId}`)
}
