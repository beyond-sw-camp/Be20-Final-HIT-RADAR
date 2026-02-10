import api from './axios.js';

/* ---------------------------
 * 부서 관리 (Department)
 * --------------------------- */

/**
 * 부서 등록
 * POST /departments
 * @param {Object} data - { "parentDeptId": null, "deptName": "...", "deptCode": "..." }
 */
export function createDepartment(data) {
    return api.post('/api/v1/departments', data);
}

/**
 * 부서 수정
 * PATCH /departments/{deptId}
 * @param {Number} deptId
 * @param {Object} data - { "deptName": "...", "managerId": ..., "common": ... }
 */
export function updateDepartment(deptId, data) {
    return api.patch(`/api/v1/departments/${deptId}`, data);
}

/**
 * 부서 삭제
 * DELETE /departments/{deptId}
 * @param {Number} deptId
 */
export function deleteDepartment(deptId) {
    return api.delete(`/api/v1/departments/${deptId}`);
}

/**
 * 부서 단건 조회
 * GET /departments/query/{deptId}
 * @param {Number} deptId
 */
export function getDepartmentById(deptId) {
    return api.get(`/api/v1/departments/query/${deptId}`);
}

/**
 * 회사별 부서 전체 조회
 * GET /departments/query
 */
export function getAllDepartmentsByCompany(comId) {
    return api.get('/api/v1/departments/query', { params: { comId } });
}

/**
 * 조직도 조회
 * GET /departments/query/organization-chart
 */
export function getOrganizationChart() {
    return api.get('/api/v1/departments/query/organization-chart');
}

/**
 * 부서원 조회
 * GET /departments/query/{deptId}/members
 * @param {Number} deptId
 */
export function getDepartmentMembers(deptId) {
    return api.get(`/api/v1/departments/query/${deptId}/members`);
}
