import api from '@/api/axios'

// API for Approval Document commands

// 임시저장 (Draft) or 상신 (Submit if docId is null and mode is SUBMIT)
export const createApprovalDraft = (request) => {
  return api.post('/api/v1/approvals/draft', request);
};

// 상신 (Submit) - specifically for already drafted documents
export const submitApproval = (docId) => {
  return api.post(`/api/v1/approvals/${docId}/submit`);
};

// 결재 문서 신규 생성 및 바로 상신
export const submitNewApproval = (requestData) => {
  return api.post('/api/v1/approvals/submit', requestData);
};

// 승인 (Approve)
export const approveApproval = (docId) => {
  return api.post(`/api/v1/approvals/${docId}/approve`);
};

// 반려 (Reject)
export const rejectApproval = (docId, reason) => {
  return api.post(`/api/v1/approvals/${docId}/reject`, null, { params: { reason } });
};

// 회수 (Withdraw)
export const withdrawApproval = (docId) => {
  return api.post(`/api/v1/approvals/${docId}/withdraw`);
};


// API for Approval Document queries

// 내 문서함 조회
export const fetchMyDocuments = () => {
  return api.get('/api/v1/approvals/my-documents');
};

// 결재 문서함 조회 (내게 온 결재)
export const fetchApprovalTasks = () => {
  return api.get('/api/v1/approvals/approval-tasks');
};

// 반려 문서함 조회
export const fetchRejectedDocuments = () => {
  return api.get('/api/v1/approvals/rejected-documents');
};

// 참조 문서함 조회
export const fetchReferenceDocuments = () => {
  return api.get('/api/v1/approvals/references');
};

// 결재 문서 상세 조회
export const fetchApprovalDetail = (docId) => {
  return api.get(`/api/v1/approvals/${docId}`);
};

// 관리자용 모든 결재 문서 조회
export const fetchAdminAllDocuments = (params) => {
  return api.get('/api/v1/approvals/all-document', { params });
};

// 관리자용 결재 문서 상세 조회
export const fetchAdminApprovalDetail = (docId) => {
  return api.get(`/api/v1/approvals/admin/${docId}`);
};

// 결재 문서 유형 조회
export const fetchApprovalDocumentTypes = () => {
  return api.get('/api/v1/approval-types');
};

// 결재 문서에 댓글 추가
export const addApprovalComment = (docId, content, parentCommentId = null) => {
  const requestBody = { content };
  if (parentCommentId !== null) {
    requestBody.parentCommentId = parentCommentId;
  }
  return api.post(`/api/v1/approvals/${docId}/comments`, requestBody);
};

// API for Approval Document Type Management
export const createApprovalDocumentType = (data) => {
  return api.post('/api/v1/approval-types', data);
};

export const updateApprovalDocumentType = (typeId, data) => {
  return api.put(`/api/v1/approval-types/${typeId}`, data);
};

export const deleteApprovalDocumentType = (typeId) => {
  return api.delete(`/api/v1/approval-types/${typeId}`);
};

export const fetchApprovalDocumentTypeDetail = (typeId) => {
  return api.get(`/api/v1/approval-types/${typeId}`);
};
export const fetchApprovalAttendanceCategories = () => {
  return api.get('/api/v1/approval-types/categories');
}

export const fetchManagementDocumentTypes = () => {
  return api.get('/api/v1/approval-types/manage');
};
