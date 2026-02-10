import api from '@/api/axios'

// 목록 조회
export function fetchUserAccounts(params) {
  return api.get('/api/v1/user-accounts', { params })
}

// 이름으로 사용자 검색
export function searchUsers(query) {
  return api.get('/api/v1/user-accounts', { params: { name: query } });
}

// 상세 조회
export function fetchUserAccountDetail(accId) {
  return api.get(`/api/v1/user-accounts/${accId}`)
}

// (관리자용) Login ID 조회
export function fetchAdminLoginId(accId) {
  return api.get(`/api/v1/adminAccounts/${accId}/login-id`)
}

// 비밀번호 변경
export function changeMyPassword(data) {
  return api.patch('/api/v1/users/me/password', data)
}

// 사용자 정보 수정
export function updateUserAccount(accId, data) {
  return api.patch(`/api/v1/users/${accId}`, data)
}

// 비밀번호 초기화 (계정 ID 기반)
export function resetUserPassword(accId) {
  return api.patch(`/api/v1/users/${accId}/reset-password`)
}

