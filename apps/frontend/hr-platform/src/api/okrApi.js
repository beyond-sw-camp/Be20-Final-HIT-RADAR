import axios from './axios'

/**
 * 특정 Goal의 OKR 목록 조회
 * GET /api/v1/goals/{goalId}/okrs
 */
export const fetchGoalOkrs = (goalId) => {
  return axios.get(`/api/v1/goals/${goalId}/okrs`)
}

/**
 * OKR(Key Result) 상세 + 로그 조회
 * GET /api/v1/key-results/{keyResultId}/detail
 */
export const fetchOkrDetail = (keyResultId) => {
  return axios.get(`/api/v1/key-results/${keyResultId}/detail`)
}

export const createOkrProgress = (goalId, keyResultId, payload) =>
  axios.post(`/api/v1/goals/${goalId}/key-results/${keyResultId}/progress`, payload)

//KR 추가
export const createKeyResult = (goalId, data) =>
  axios.post(`/api/v1/goals/${goalId}/key-results`, data)
