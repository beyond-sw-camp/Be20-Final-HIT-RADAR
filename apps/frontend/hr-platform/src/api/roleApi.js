import axios from '@/api/axios';

// 역할 목록 조회 (회사 내)
export function getRoles() {
    return axios.get('/api/v1/roles');
}

// 커스텀 역할 생성
export function createRole(data) {
    return axios.post('/api/v1/roles', data);
}

// 역할 수정
export function updateRole(roleId, data) {
    return axios.put(`/api/v1/roles/${roleId}`, data);
}

// 역할 삭제
export function deleteRole(roleId) {
    return axios.delete(`/api/v1/roles/${roleId}`);
}

// 현재 사용자의 권한 목록 조회 (키값 리스트)
export function getMyPermissionsApi() {
    return axios.get('/api/v1/roles/my-permissions');
}

// 시스템 전체 권한 및 경로 매핑 정보 조회 (PermissionResponse 리스트)
export function getPermissionMappingsApi() {
    return axios.get('/api/v1/roles/permissions');
}
