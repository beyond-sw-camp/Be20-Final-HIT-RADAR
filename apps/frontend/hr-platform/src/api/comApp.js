import api from './axios.js';


export function applyCompanyApi(payload) {
  return api.post('/api/v1/company-applications/submit', payload, { skipAuth: true });
}

export function searchCompanyApplications(params) {
  return api.get('/api/v1/company-applications', { params });
}

export function getCompanyApplicationDetail(applicationId) {
  return api.get(`/api/v1/company-applications/${applicationId}`);
}

export function approveCompanyApplication(applicationId) {
  return api.post(`/api/v1/company-applications/${applicationId}/approve`);
}

export function rejectCompanyApplication(applicationId, reason) {
  return api.post(`/api/v1/company-applications/${applicationId}/reject`, { reason });
}
