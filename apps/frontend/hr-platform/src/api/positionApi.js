import api from './axios'

/**
 * 직위 목록 조회
 * GET /positions
 */
export function fetchPositions() {
    return api.get('/api/v1/positions')
}

/**
 * 직위 상세 조회
 * GET /positions/{positionId}
 */
export function fetchPositionDetail(positionId) {
    return api.get(`/api/v1/positions/${positionId}`)
}

/**
 * 직위 생성
 * POST /positions
 */
export function createPosition(data) {
    return api.post('/api/v1/positions', data)
}

/**
 * 직위 수정
 * PATCH /positions/{positionId}
 */
export function updatePosition(positionId, data) {
    return api.patch(`/api/v1/positions/${positionId}`, data)
}

/**
 * 직위 삭제
 * DELETE /positions/{positionId}
 */
export function deletePosition(positionId) {
    return api.delete(`/api/v1/positions/${positionId}`)
}
