/* evaluationSectionApi.js */
import axios from './axios.js'

//섹션 생성
export const createEvaluationSection = (cycleEvalTypeId, data) => {
  return axios.post(
    `/api/v1/cycle-evaluation-types/${cycleEvalTypeId}/sections`,
    data
  )
}

//섹션 수정
export const updateEvaluationSection = (sectionId, data) => {
  return axios.put(
    `/api/v1/cycle-evaluation-types/sections/${sectionId}`,
    data
  )
}

//섹션 삭제
export const deleteEvaluationSection = (sectionId) => {
  return axios.delete(
    `/api/v1/cycle-evaluation-types/sections/${sectionId}`
  )
}
