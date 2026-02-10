import axios from './axios.js'

// 등록
export const createDistributionPolicy = (teamGradeId, data) => {
  return axios.post(
    `/api/v1/distribution-policies/${teamGradeId}`,
    {
      memberGradeId: data.memberGradeId,
      minRatio: data.minRatio,
      maxRatio: data.maxRatio,
    }
  )
}

// 수정
export const updateDistributionPolicy = (policyId, data) => {
  return axios.put(
    `/api/v1/distribution-policies/${policyId}`,
    {
      minRatio: data.minRatio,
      maxRatio: data.maxRatio,
    }
  )
}

// 삭제
export const deleteDistributionPolicy = (policyId) => {
  return axios.delete(
    `/api/v1/distribution-policies/${policyId}`
  )
}
// 팀 등급 기준 전체 조회
export const fetchDistributionPolicies = (teamGradeId) => {
  return axios.get(
    `/api/v1/distribution-policies/team-grades/${teamGradeId}`
  )
}

// 단건 조회
export const fetchDistributionPolicy = (teamGradeId, memberGradeId) => {
  return axios.get(
    `/api/v1/distribution-policies/team-grades/${teamGradeId}/member-grades/${memberGradeId}`
  )
}


