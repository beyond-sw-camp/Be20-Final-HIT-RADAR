import axios from './axios.js'

// 질문 생성
export const createEvaluationQuestion = (sectionId, payload) => {
  return axios.post(
    `/api/v1/evaluation-sections/${sectionId}/questions`,
    payload
  )
}

// 질문 수정
export const updateEvaluationQuestion = (questionId, payload) => {
  return axios.put(
    `/api/v1/evaluation-sections/questions/${questionId}`,
    payload
  )
}

// 질문 삭제
export const deleteEvaluationQuestion = (questionId) => {
  return axios.delete(
    `/api/v1/evaluation-sections/questions/${questionId}`
  )
}
