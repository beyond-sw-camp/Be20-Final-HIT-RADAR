import api from './axios'

/**
 * 사원 등록 (with 계정)
 * POST /employees
 */
export function createEmployee(data) {
    return api.post('/api/v1/employees', data)
}

/**
 * 사원 인사발령 (부서, 직위, 사번 변경)
 * PATCH /employees/{empId}/assignment
 */
export function updateEmployeeAssignment(empId, data) {
    return api.patch(`/api/v1/employees/${empId}/assignment`, data)
}

/**
 * 사원 인사발령 이력 조회 (단건)
 * GET /employees/{empId}/movement-histories
 */
export function fetchEmployeeMovementHistory(empId) {
    return api.get(`/api/v1/employees/${empId}/movement-histories`)
}

/**
 * 회사 전체 인사발령 이력 조회
 * GET /employees/movement-histories
 */
export function fetchAllMovementHistories() {
    return api.get('/api/v1/employees/movement-histories')
}

/**
 * 사원 목록 조회
 * GET /employees (with EmployeeListRequest)
 */
export function fetchEmployees(params) {
    return api.get('/api/v1/employees', { params })
}

/**
 * 사원 단건 조회
 * GET /employees/{empId}
 */
export function fetchEmployeeDetail(empId) {
    return api.get(`/api/v1/employees/${empId}`)
}

/**
 * 사원 프로필 수정
 * PATCH /employees/{empId}/profile
 */
export function updateEmployeeProfile(empId, data) {
    return api.patch(`/api/v1/employees/${empId}/profile`, data)
}

/**
 * 사원 프로필 사진 업로드
 * POST /employees/{empId}/profile-image
 */
export function uploadEmployeeProfileImage(empId, formData) {
    return api.post(`/api/v1/employees/${empId}/profile-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}



/**
 * 사원 삭제
 * DELETE /employees/{empId}
 */
// ... (previous content)
export function deleteEmployee(empId) {
    return api.delete(`/api/v1/employees/${empId}`)
}

/**
 * 사원 역할 수정
 * PUT /employees/{empId}/roles
 */
export function updateEmployeeRoles(empId, roleIds) {
    return api.put(`/api/v1/employees/${empId}/roles`, { roleIds })
}

// --- CSV Bulk Registration ---

export const downloadCsvTemplate = async () => {
    const res = await api.get('/api/v1/employees/csv/template', {
        responseType: 'blob'
    })
    return res.data
}

export const previewCsv = (formData) => {
    return api.post('/api/v1/employees/csv/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
}

export const registerCsv = (data) => {
    return api.post('/api/v1/employees/csv/register', data)
}
