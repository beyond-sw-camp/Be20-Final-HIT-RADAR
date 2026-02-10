import api from './axios'

/**
 * 내 회사 정보 조회
 * GET /company/my
 */
export function fetchMyCompany() {
    return api.get('/api/v1/company/my')
}

/**
 * 회사 목록 조회 (검색 포함)
 * GET /company
 */
export function fetchCompanies(params) {
    return api.get('/api/v1/company', { params })
}

/**
 * 회사 상세 조회
 * GET /company/{companyId}
 */
export function fetchCompanyDetail(companyId) {
    return api.get(`/api/v1/company/${companyId}`)
}

/**
 * 회사 정보 수정
 * PATCH /company/{comId}
 */
export function updateCompany(comId, data) {
    return api.patch(`/api/v1/company/${comId}`, data)
}

/**
 * 회사 삭제
 * DELETE /company/{comId}
 */
export function deleteCompany(comId) {
    return api.delete(`/api/v1/company/${comId}`)
}
