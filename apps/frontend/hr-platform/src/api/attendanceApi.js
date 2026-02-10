import axios from './axios';

// --- IP 정책 관리 (Admin) ---

/**
 * 회사 전체 IP 정책 목록 조회
 * @param {number} comId - 회사 ID
 */
export const fetchIpPolicies = async (comId) => {
  return axios.get('/api/v1/admin/ip-policies', {
    params: { comId }
  });
};

export const fetchActiveIpPolicies = async (comId) => {
  return axios.get('/api/v1/admin/ip-policies/active', {
    params: { comId }
  });
};

/**
 * 신규 IP 정책 등록
 * @param {object} policyData - RegisterIpPolicyRequest
 */
export const createIpPolicy = async (policyData) => {
  return await axios.post(`/api/v1/attendance/ip-policies`, policyData);
};

/**
 * IP 정책 수정 (내용)
 * @param {number} policyId - IP 정책 ID
 * @param {object} policyData - UpdateIpPolicyRequest
 */
export const updateIpPolicy = async (policyId, policyData) => {
  return await axios.patch(`/api/v1/attendance/ip-policies/${policyId}`, policyData);
};

/**
 * IP 정책 상태 변경 (활성/비활성)
 * @param {number} policyId - IP 정책 ID
 * @param {object} statusData - ChangeIpPolicyRequest ({ enabled: boolean })
 */
export const changeIpPolicyStatus = async (policyId, statusData) => {
  return await axios.patch(`/api/v1/attendance/ip-policies/${policyId}/status`, statusData);
};


/**
 * IP 정책 삭제
 * @param {number} policyId - IP 정책 ID
 */
export const deleteIpPolicy = async (policyId) => {
  return await axios.delete(`/api/v1/attendance/ip-policies/${policyId}`);
};

export const fetchAttendanceIpPolicies = async (comId) => {
  return axios.get('/api/v1/admin/ip-policies/attendance', {
    params: { comId }
  });
};


// --- 사원 출퇴근 관리 ---

/**
 * 출/퇴근 처리 (IP 기반)
 */
export const processAttendance = async () => {
  return await axios.post(`/api/v1/attendance/check`);
};

/**
 * 나의 오늘 근태 상세 정보 조회
 * @param {number} targetEmpId - 직원 ID
 * @param {string} workDate - 조회 날짜 (YYYY-MM-DD)
 */
export const fetchMyTodayAttendance = async (targetEmpId, workDate) => {
  return await axios.get(`/api/v1/attendance/detail`, { params: { targetEmpId, workDate } });
};



// 캘린더 전용 조회 (사원 / 부서 공용)
export const fetchAttendanceCalendar = async ({
  targetEmpId,
  targetDeptId,
  fromDate,
  toDate
}) => {
  return await axios.get('/api/v1/attendance/calendar', {
    params: {
      targetEmpId,
      targetDeptId,
      fromDate,
      toDate
    }
  });
};

// 사원 근태 상세 조회 (하루)
export const fetchAttendanceDetail = async ({
  targetEmpId,
  workDate
}) => {
  return await axios.get('/api/v1/attendance/detail', {
    params: {
      targetEmpId,
      workDate
    }
  });
};
