import axios from './axios.js'

//개인 등급 등록
export const assignIndividualGrade = (data) => {
  return axios.post('/api/v1/individual-grades', {
    cycleId: data.cycleId,
    empId: data.empId,
    gradeId: data.gradeId,
    gradeReason: data.gradeReason,
  })
}

//수정
export const updateIndividualGrade = (individualGradeId, data) => {
  return axios.put(`/api/v1/individual-grades/${individualGradeId}`, {
    gradeId: data.gradeId,
    gradeReason: data.gradeReason,
  })
}


//삭제
export const deleteIndividualGrade = (individualGradeId) => {
  return axios.delete(`/api/v1/individual-grades/${individualGradeId}`)
}


//제출
export const submitIndividualGrade = (individualGradeId) => {
  return axios.post(`/api/v1/individual-grades/${individualGradeId}/submit`)
}

//승인
export const approveIndividualGrade = (individualGradeId) => {
  return axios.post(`/api/v1/individual-grades/${individualGradeId}/approve`)
}

//부여 현황 조회
export const fetchEmployeeGradeStatusList = (cycleId) => {
  return axios.get('/api/v1/individual-grades/employees', {
    params: {
      cycleId,
    },
  })
}

//내 개인 등급 조회
export const fetchMyIndividualGrade = (cycleId) => {
  return axios.get('/api/v1/individual-grades/my', {
    params: {
      cycleId,
    },
  })
}

// 이의제기 승인 + 등급 수정
export const approveIndividualGradeByObjection = (individualGradeId, data) => {
  return axios.post(
    `/api/v1/individual-grades/${individualGradeId}/approve-by-objection`,
    {
      gradeId: data.gradeId,
      gradeReason: data.gradeReason,
    }
  )
}
