/* evaluationTypeApi.js */
import axios from './axios.js'

//회차에 평가유형 추가
export const createEvaluationType = (data) => {
  return axios.post(
    '/api/v1/evaluation-types',
    data
  )
}

//수정
export const updateEvaluationType = (evalTypeId, data) => {
  return axios.put(
    `/api/v1/evaluation-types/${evalTypeId}`,
    data
  )
}
//삭제
export const deleteEvaluationType = (evalTypeId) => {
  return axios.delete(
    `/api/v1/evaluation-types/${evalTypeId}`
  )
}
//조회
export const fetchEvaluationTypes = () => {
  return axios.get(
    '/api/v1/evaluation-types'
  )
}
