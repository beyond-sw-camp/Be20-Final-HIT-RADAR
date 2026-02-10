import api from '@/api/axios'

export const getLeavePolicies = (companyId) => {
  const params = {};
  if (companyId) params.companyId = companyId;
  return api.get('/api/v1/leave-policies', { params });
}

export const createLeavePolicy = (policyData) => {
  return api.post('/api/v1/admin/leave-policies', policyData)
}

/**
 * 부서권한이 있는 사용자가 부서 휴가 목록을 조회합니다.
 * @returns {Promise<any>}
 */
export const getDepartmentLeaves = () => {
  return api.get('/api/v1/leave/department');
};


/**
 * 휴가 신청을 위한 임시 결재 문서를 생성합니다.
 * @param {object} draftData - 임시 문서 생성 데이터
 * @returns {Promise<any>} docId를 포함하는 응답
 */
export const createLeaveDraft = (draftData) => {
  return api.post('/api/v1/leave/command/draft', draftData);
}

/**
 * 휴가 신청 데이터를 저장합니다.
 * @param {number} docId - 임시 문서 ID
 * @param {object} leaveData - 휴가 신청 데이터
 * @returns {Promise<any>}
 */
export const applyLeave = (docId, leaveData) => {
  return api.post(`/api/v1/leave/command/${docId}`, leaveData);
}

/**
 * 현재 로그인한 사용자의 모든 휴가 목록을 조회합니다.
 * @returns {Promise<any>}
 */
export const getMyLeaves = () => {
  return api.get('/api/v1/leave');
};

/**
 * 특정 휴가 ID로 상세 정보를 조회합니다.
 * @param {number} leaveId - 휴가 ID
 * @returns {Promise<any>}
 */
export const getLeaveDetail = (leaveId) => {
  return api.get(`/api/v1/leave/${leaveId}`);
};

/**
 * 특정 연차 지급 ID로 연차 정보를 조회합니다.
 * @param {number} grantId - 연차 지급 ID
 * @returns {Promise<any>}
 */
export const getLeaveGrant = (grantId) => {
  return api.get(`/api/v1/leave/grant/${grantId}`);
};

/**
 * 현재 로그인한 사용자의 모든 연차 지급 정보를 조회합니다.
 * @returns {Promise<any>}
 */
export const getMyLeaveGrants = () => {
  return api.get('/api/v1/leave/grants');
};
/**
 * 휴가 정책을 수정합니다.
 * @param {number} policyId - 정책 ID
 * @param {object} policyData - 수정할 정책 데이터
 * @returns {Promise<any>}
 */
export const updateLeavePolicy = (policyId, policyData) => {
  return api.patch(`/api/v1/admin/leave-policies/${policyId}`, policyData);
};

/**
 * 휴가 정책을 삭제합니다.
 * @param {number} policyId - 정책 ID
 * @returns {Promise<any>}
 */
export const deleteLeavePolicy = (policyId) => {
  return api.delete(`/api/v1/admin/leave-policies/${policyId}`);
};
