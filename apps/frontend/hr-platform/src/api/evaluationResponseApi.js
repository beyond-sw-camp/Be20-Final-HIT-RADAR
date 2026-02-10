/*evaluationResponseApi.js*/
import axios from './axios.js'

export const saveEvaluationResponseDraft = (data) => {
  return axios.put(
    '/api/v1/evaluation-responses/draft',
    data
  )
}
export const submitEvaluationResponse = (assignmentId) => {
  return axios.post(
    `/api/v1/evaluation-responses/${assignmentId}/submit`
  )
}
export const fetchEvaluationResponses = (assignmentId) => {
  return axios.get(
    `/api/v1/evaluation-responses/${assignmentId}`
  )
}

//피평가자 기준 조회
export const fetchEvaluateeEvaluationResult = (
  evaluateeId,
  cycleId,
  evalTypeId
) => {
  return axios.get(
    `/api/v1/evaluation-results/evaluatee/${evaluateeId}`,
    {
      params: {
        cycleId,
        evalTypeId,
      },
    }
  )
}

//내 기준 조회
export const fetchMyEvaluationResult = (
  cycleId,
  evalTypeId
) => {
  return axios.get(
    `/api/v1/evaluation-results/evaluatee/me`,
    {
      params: {
        cycleId,
        evalTypeId,
      },
    }
  )
}
