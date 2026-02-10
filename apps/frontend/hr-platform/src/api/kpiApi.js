import axios from './axios'

//Goal의 KPI 목록
export const fetchGoalKpis = (goalId) =>
  axios.get(`/api/v1/goals/${goalId}/kpis`)


// KPI 상세 + 로그
export const fetchKpiDetail = (kpiId) =>
  axios.get(`/api/v1/kpis/${kpiId}/detail`)

export const createKpiProgress = (goalId, kpiId, payload) =>
  axios.post(`/api/v1/goals/${goalId}/kpis/${kpiId}/progress`, payload)

//kpi 추가
export const createKpi = (goalId, data) =>
  axios.post(`/api/v1/goals/${goalId}/kpis`, data)

