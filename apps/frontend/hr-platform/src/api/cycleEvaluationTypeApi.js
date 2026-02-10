/*cycleEvaluationTypeApi.js*/
import axios from './axios.js'

export const fetchCycleEvaluationTypes = (cycleId) => {
  return axios.get(
    `/api/v1/evaluation-cycles/${cycleId}/types`
  )
}

export const saveCycleEvaluationTypes = (cycleId, data) => {
  return axios.post(
    `/api/v1/evaluation-cycles/${cycleId}/types`,
    data
  )
}
