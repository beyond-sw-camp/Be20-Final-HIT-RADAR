// src/api/DeptGradeApi.js
import axios from './axios.js'

// 부서 등급 등록
export const assignDeptGrade = (data) => {
  return axios.post('/api/v1/dept-grades', data)
}

// 부서 등급 수정
export const updateDeptGrade = (deptGradeId, data) => {
  return axios.put(`/api/v1/dept-grades/${deptGradeId}`, data)
}

// 부서 등급 삭제
export const deleteDeptGrade = (deptGradeId) => {
  return axios.delete(`/api/v1/dept-grades/${deptGradeId}`)
}

// 부서 등급 제출
export const submitDeptGrade = (deptGradeId) => {
  return axios.post(`/api/v1/dept-grades/${deptGradeId}/submit`)
}

// 부서 등급 승인
export const approveDeptGrade = (deptGradeId) => {
  return axios.post(`/api/v1/dept-grades/${deptGradeId}/approve`)
}

//부서 등급 부여 현황 조회
export const fetchDeptGradeStatusList = (cycleId) => {
  return axios.get('/api/v1/dept-grades', {
    params: { cycleId }
  })
}

//내 부서 등급 조회
export const fetchMyDeptGrade = () => {
  return axios.get('/api/v1/dept-grades/my/dept')
}
