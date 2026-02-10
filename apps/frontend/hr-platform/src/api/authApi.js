 import api from './axios.js';

/* ---------------------------
 * 로그인
 * --------------------------- */
export function loginApi(loginId, password, companyCode) {
  return api.post('/api/auth/login', { loginId, password, companyCode }, { skipAuth: true });
}

/* ---------------------------
 * 토큰 재발급
 * --------------------------- */
export function refreshApi() {
  return api.post(
    '/api/auth/token-reissue',
    {},
    { skipAuth: true }
  );
}

/* ---------------------------
 * 로그아웃
 * --------------------------- */
export function logoutApi() {
  return api.post('/api/auth/logout');
}


//
// /* ---------------------------
//  * 회원가입
//  * --------------------------- */
// export function registerApi(payload) {
//   return api.post('/users', payload);
// }
//
// /* ---------------------------
//  * 중복 체크
//  * --------------------------- */
// export function checkLoginIdApi(loginId) {
//   return api.get('/users/exists/login-id', {
//     params: { loginId }
//   });
// }
//
// export function checkNicknameApi(nickname) {
//   return api.get('/users/exists/nickname', {
//     params: { nickname }
//   });
// }
//
// /* ---------------------------
//  * 이메일 인증번호 발송
//  * --------------------------- */
// export function sendEmailCodeApi({ email, purpose }) {
//   return api.post('/auth/email', { email, purpose });
// }
//
// /* ---------------------------
//  * 이메일 인증번호 검증
//  * --------------------------- */
// export function verifyEmailCodeApi({ email, code, purpose }) {
//   return api.post('/auth/code', { email, code, purpose });
// }
//
// /* ---------------------------
//  * 비밀번호 재설정
//  * --------------------------- */
// export function resetPasswordApi(resetToken, newPassword) {
//   return api.post('/users/reset-password', {
//     resetToken,
//     newPassword
//   });
// }
//
// export const findIdApi = async (token) => {
//   return await api.get(`/users/id`, {
//     params: { token }
//   }).then(res => res.data);
// };
