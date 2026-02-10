import axios from './axios.js'

// 등록
export const createDistributionRule = (gradeId, data) => {
  return axios.post(
    `/api/v1/grades/${gradeId}/distribution-rule`,
    {
      minRatio: data.minRatio,
      maxRatio: data.maxRatio,
    },
  )
}

// 수정
export const updateDistributionRule = (gradeId, data) => {
  return axios.put(
    `/api/v1/grades/${gradeId}/distribution-rule`,
    {
      minRatio: data.minRatio,
      maxRatio: data.maxRatio,
    },
  )
}

// 삭제
export const deleteDistributionRule = (gradeId) => {
  return axios.delete(
    `/api/v1/grades/${gradeId}/distribution-rule`,
  )
}
