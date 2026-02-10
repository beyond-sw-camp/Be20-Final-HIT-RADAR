import axios from '@/api/axios';

// 권한 목록 조회
export function getPermissions() {
    return axios.get('/api/v1/permissions');
}

// 권한 생성 (ADMIN Only)
export function createPermission(data) {
    return axios.post('/api/v1/permissions', data);
}

// 권한 수정 (ADMIN Only)
export function updatePermission(permId, data) {
    return axios.patch(`/api/v1/permissions/${permId}`, data);
}

// 권한 삭제 (ADMIN Only)
export function deletePermission(permId) {
    return axios.delete(`/api/v1/permissions/${permId}`);
}
