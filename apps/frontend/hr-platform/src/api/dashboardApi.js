import axios from './axios.js'

/**
 * 개인 업무 기여도 조회 API
 */
export const fetchMyContribution = () => {
  return axios.get('/api/v1/my-dashboard/contribution');
};
export const fetchEmpContribution = (selectedEmpId) => {
  return axios.get("/api/v1/my-dashboard/contribution/emp", {
    params: { empId: selectedEmpId }
  })
}

/**
 * 협업지수 조회 API
 */
export const fetchMyCollaboration = () => {
  return axios.get('/api/v1/my-dashboard/collaboration');
};

export const fetchEmpCollaboration = (selectedEmpId) => {
  return axios.get("/api/v1/my-dashboard/collaboration/emp", {
    params: { empId: selectedEmpId }
  })
}

/**
 * 직무만족도 조회 API
 */
export const fetchJobSatisfaction = () => {
  return axios.get('/api/v1/my-dashboard/job-satisfaction');
};

export const fetchEmpJobSatisfaction = (selectedEmpId) => {
  return axios.get("/api/v1/my-dashboard/job-satisfaction/emp", {
    params: { empId: selectedEmpId }
  })
}

/**
 * 업무 안정성 조회 API
 */
export const fetchJobStable = (startYm, endYm) => {
  return axios.get("/api/v1/my-dashboard/rejections/monthly", {
    params: { startYm, endYm}
  })
}

export const fetchEmpJobStable = (empId, startYm, endYm) => {
  return axios.get("/api/v1/my-dashboard/rejections/monthly/emp", {
    params: { empId, startYm, endYm}
  })
}
