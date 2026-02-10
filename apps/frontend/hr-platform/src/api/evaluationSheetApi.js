/* evaluationSheetApi.js */
import axios from './axios.js'

/**
 * 평가 문항지 조회
 */
export const fetchEvaluationSheet = (cycleId, evalTypeId) => {
  return axios.get(
    `/api/v1/evaluation-cycles/${cycleId}/types/${evalTypeId}/sections`
  )
}
