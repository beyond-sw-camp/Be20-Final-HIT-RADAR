import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {

    // 로그인/회원가입/리프레시 같은 곳에서만 skipAuth: true를 명시적으로 줄 것
    if (config.skipAuth) return config;

    const authStore = useAuthStore();

    // 새로고침 직후 대비: 메모리에 없으면 localStorage에서 복구
    if (!authStore.accessToken) {
      authStore.loadFromStorage();
    }

    const token = authStore.accessToken;

    if (token) {
      // headers 객체 보장
      config.headers = config.headers || {};

      // 이미 Authorization을 명시한 경우는 건들지 않음
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 백엔드 AuthUserArgumentResolver가 요구하는 X- 헤더들 주입
      if (authStore.user) {
        if (authStore.user.userId) config.headers['X-User-Id'] = authStore.user.userId;
        if (authStore.user.role) config.headers['X-User-Role'] = authStore.user.role;
        if (authStore.user.companyId) config.headers['X-Company-Id'] = authStore.user.companyId;
        if (authStore.user.employeeId) config.headers['X-Employee-Id'] = authStore.user.employeeId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;

// 응답 인터셉터 (공통 에러 처리)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    if (!error.response) {
      alert("서버에 연결할 수 없습니다.\n잠시 후 다시 시도해주세요.");
      return Promise.reject(error);
    }


    const { status, data } = error.response;
    const url = originalRequest.url || '';

    // 서버에서 내려주는 특정 에러 메시지가 있으면 최우선으로 표시 (단, 401은 토큰 리프레시 로직이 있으므로 제외)
    if (status !== 401 && data?.message) {
      alert(data.message);
    }

    if (data?.message) {
      error.customMessage = data.message;
    }

    if ((status === 500 || status === 503) && !data?.message) { // 메시지가 없을 때만 일반 서버 오류 표시
      alert("서비스 오류가 발생했습니다. 관리자에게 문의해주세요.");
      return Promise.reject(error);
    }

    // 401이 아닌 상황은 그대로 throw
    if (status !== 401) return Promise.reject(error);

    // auth 관련 엔드포인트의 401 무한 루프 방지를 위해 그대로 throw
    if (url.includes('/api/v1/auth/')) return Promise.reject(error);

    // access token이 없는 상황도 그대로 throw
    if (!authStore.accessToken) {
      authStore.clearAuthState();
      router.replace('/gateway');
      return Promise.reject(error);
    }

    // 이미 재시도한 요청이면 그대로 실패
    if (originalRequest._retry) return Promise.reject(error);

    // 일반 보호 API의 401 중 한 번만 refresh 시도
    if (isRefreshing) return Promise.reject(error);

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await authStore.refreshTokens();
      isRefreshing = false;

      // 401로 실패햇던 기존 요청을 다시 수행
      originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`;
      return api(originalRequest);
    } catch (e) {
      isRefreshing = false;
      authStore.clearAuthState();
      return Promise.reject(e);
    }
  },
);

export default api
