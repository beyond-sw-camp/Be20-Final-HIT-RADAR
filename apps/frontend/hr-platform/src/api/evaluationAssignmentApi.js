import axios from './axios.js'

//평가자 기준 내가 평가해야할 배정 목록 조회
export const fetchAssignmentsByEvaluator = () => {
  return axios.get(
    '/api/v1/evaluation-assignments/evaluator'
  )
}

//회차 + 평가 유형 기준 전체 평가 배정 조회
export const fetchAssignmentsByCycleEvalType = (cycleEvalTypeId) => {
  return axios.get(
    `/api/v1/evaluation-assignments/cycle-eval-types/${cycleEvalTypeId}`
  )
}

//평가 배정 생성
export const createEvaluationAssignments = (cycleEvalTypeId, data) => {
  return axios.post(
    `/api/v1/cycle-evaluation-types/${cycleEvalTypeId}/assignments`,
    data
  )
}

// 평가 배정 삭제 (단건)
export const deleteEvaluationAssignment = (assignmentId) => {
  return axios.delete(
    `/api/v1/cycle-evaluation-types/assignments/${assignmentId}`
  )
}

//부서별 배정 조회
export const fetchDeptEvaluationAssignmentDetails = (deptId) => {
  return axios.get(
    '/api/v1/evaluation-assignments/department/details',
    {
      params: { deptId },
    }
  )
}
