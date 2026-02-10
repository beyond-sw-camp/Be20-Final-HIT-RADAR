import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';

import {
  loginApi,
  logoutApi,
  refreshApi,
} from '@/api/authApi';
import { fetchEmployeeDetail } from '@/api/employeeApi';
import { getMyPermissionsApi, getPermissionMappingsApi } from '@/api/roleApi';

import router from '@/router';

export const useAuthStore = defineStore('auth', () => {

  /* ----------------------------
   * state
   * ---------------------------- */
  const accessToken = ref(null);
  const emptyUser = () => ({
    userId: null,
    role: '',
    companyId: null,
    employeeId: null,
    departmentId: null,
    name: '',
    department: '',
    jobTitle: '',
    email: '',
    position: '',
    image: null, // Add image field
  })



  const user = ref(emptyUser())
  const permissions = ref([])
  const permissionMappings = ref({}) // { '/route/path': 'PERM_KEY' } 형태의 동적 매핑 데이터
  const loading = ref(false);

  /* ----------------------------
   * getters
   * ---------------------------- */
  const isLoggedIn = computed(() => !!accessToken.value && !!user.value?.userId);
  const isAdmin = computed(() => (user.value?.role || '').toUpperCase() === 'ADMIN');
  const hasPermission = (permKey) => {
    if (isAdmin.value) return true; // ADMIN은 모든 권한 허용
    return permissions.value.includes(permKey);
  };


  /* ----------------------------
   * utils
   * ---------------------------- */
  const setAccessToken = (token) => {
    accessToken.value = token;
    token
      ? localStorage.setItem('accessToken', token)
      : localStorage.removeItem('accessToken');
  };

  const resetUser = () => {
    user.value = emptyUser()
    localStorage.removeItem('user')
  }

  const setUserFromToken = (token) => {
    try {
      const payload = jwtDecode(token)
      user.value = {
        userId: payload.sub,
        role: (payload.role || '').toUpperCase(),
        companyId: payload.companyId,
        employeeId: payload.employeeId,
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    } catch {
      user.value = null
    }
  }


  // 토큰 유효성 검증 함수
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      // exp가 없거나 만료되었으면 true 반환
      return !payload.exp || payload.exp < currentTime;
    } catch {
      return true; // 디코딩 실패 = 유효하지 않은 토큰
    }
  };

  const loadFromStorage = () => {
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');

    // 🔒 토큰 유효성 검증 추가
    if (token && !isTokenExpired(token)) {
      accessToken.value = token;
      if (userStr) {
        user.value = JSON.parse(userStr);
        // ✅ 로컬 스토리지에 상세 정보(부서 등)가 없으면 백그라운드에서 갱신
        if (user.value.employeeId && !user.value.department) {
          fetchDetailInBackground(user.value.employeeId);
        }
      }

      const permsStr = localStorage.getItem('permissions');
      if (permsStr) permissions.value = JSON.parse(permsStr);

      // ✅ [Fix] DB 데이터가 변경되었을 수 있으므로 항상 최신 권한 정보를 가져오도록 갱신
      fetchPermissions();
      fetchPermissionMappings();

      // ✅ [Fix] 만약 매핑이 비어있으면 즉시 재시도 (최초 로드 실패 대비)
      if (!permissionMappings.value || Object.keys(permissionMappings.value).length === 0) {
        fetchPermissionMappings();
      }
    } else {
      // 토큰이 없거나 만료되었으면 localStorage 클리어
      if (token) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        localStorage.removeItem('permissionMappings');
      }
    }
  };

  const fetchDetailInBackground = async (empId) => {
    try {
      const detailRes = await fetchEmployeeDetail(empId);
      const detail = detailRes.data.data || detailRes.data;

      user.value = {
        ...user.value,
        departmentId: detail.deptId || detail.department?.id,
        name: detail.name,
        department: detail.deptName || detail.department?.name || '',
        jobTitle: detail.position?.name || detail.jobTitle || '',
        email: detail.email,
        image: detail.image || null // Add image field
      };
      localStorage.setItem('user', JSON.stringify(user.value));
    } catch (error) {
      console.error('Background fetch detail failed:', error);
    }
  };

  const clearAuthState = () => {
    setAccessToken(null);
    resetUser();
    router.push('/gateway');
  };


  /* ----------------------------
   * actions
   * ---------------------------- */
  const login = async ({ loginId, password, companyCode }) => {
    loading.value = true;

    try {
      const res = await loginApi(loginId, password, companyCode);
      const { success, data, message } = res.data;

      if (!success)
        return { success: false, message: message || "로그인 실패" };

      setAccessToken(data.accessToken);
      setUserFromToken(data.accessToken);

      await fetchPermissions(); // 내 권한 목록 (키값)
      await fetchPermissionMappings(); // 전체 권한-경로 매핑 정보 (DB 실시간 데이터)

      // ✅ 추가: 사원 상세 정보 조회 (departmentId, name, departmentName 등)
      if (user.value.employeeId) {
        try {
          const detailRes = await fetchEmployeeDetail(user.value.employeeId);
          // API 응답 구조: detailRes.data (EmployeeResponseDto) 라고 가정
          // 만약 detailRes.data.data 형태라면 수정 필요. 보통 axios 설정에 따라 다름.
          // 여기서는 기존 패턴(employeeApi)이 api.get(...)을 반환하므로 detailRes.data가 본문일 가능성 높음.
          // 하지만 employeeApi.js를 보면 return api.get(...) 이므로, interceptor가 response.data를 반환하지 않는 한 detailRes.data가 맞음.
          // Backend DTO 필드명 확인 필요. (deptId, deptName, department.name 등)
          // 안전하게 처리
          const detail = detailRes.data.data || detailRes.data;

          user.value = {
            ...user.value,
            departmentId: detail.deptId || detail.department?.id,
            name: detail.name,
            department: detail.deptName || detail.department?.name || '',
            jobTitle: detail.position?.name || detail.jobTitle || '',
            email: detail.email,
            image: detail.image || null // Add image field
          };
          localStorage.setItem('user', JSON.stringify(user.value));
        } catch (error) {
          console.error('Failed to fetch employee detail:', error);
        }
      }

      return { success: true };
    } catch (e) {
      return {
        success: false,
        message: e.response?.data?.message || "로그인 오류",
      };
    } finally {
      loading.value = false;
    }
  };

  const refreshTokens = async () => {
    try {
      const res = await refreshApi();
      const { success, data } = res.data;

      if (!success) {
        throw new Error('Refresh tokens failed');
      }

      setAccessToken(data.accessToken);
      setUserFromToken(data.accessToken);

      // ✅ 추가: 리프레시 후에도 상세 정보 재조회
      if (user.value.employeeId) {
        try {
          const detailRes = await fetchEmployeeDetail(user.value.employeeId);
          const detail = detailRes.data.data || detailRes.data;

          user.value = {
            ...user.value,
            departmentId: detail.deptId || detail.department?.id,
            name: detail.name,
            department: detail.deptName || detail.department?.name || '',
            jobTitle: detail.position?.name || detail.jobTitle || '',
            email: detail.email,
            image: detail.image || null // Add image field
          };
          localStorage.setItem('user', JSON.stringify(user.value));
        } catch (error) {
          console.error('Failed to update employee detail after refresh:', error);
        }
      }
    } catch {
      clearAuthState();
    }
  };

  // const register = async (payload) => {
  //   try {
  //     const res = await registerApi(payload);
  //     const { success, message } = res.data;
  //
  //     if (!success) return { success: false, message };
  //     return { success: true };
  //   } catch (e) {
  //     return {
  //       success: false,
  //       message: e.response?.data?.message || "회원가입 오류",
  //     };
  //   }
  // };
  //
  // const checkLoginId = async (loginId) => {
  //   const res = await checkLoginIdApi(loginId);
  //   return res.data.data.exists;
  // };
  //
  // const checkNickname = async (nickname) => {
  //   const res = await checkNicknameApi(nickname);
  //   return res.data.data.exists;
  // };

  const logout = async () => {
    try {
      await logoutApi();
    } catch { /* empty */ }
    clearAuthState();
  };

  const fetchPermissions = async () => {
    try {
      if (!isLoggedIn.value) return;
      const res = await getMyPermissionsApi();
      if (res.data.success) {
        permissions.value = res.data.data;
        localStorage.setItem('permissions', JSON.stringify(permissions.value));
      }
    } catch (e) {
      console.error('Failed to fetch permissions', e);
    }
  };

  const fetchPermissionMappings = async () => {
    try {
      const res = await getPermissionMappingsApi();
      if (res.data.success) {
        // [ { routePath: '/a', permKey: 'K' }, ... ] -> { '/a': 'K' } 변환
        const list = res.data.data;
        const map = {};
        list.forEach(item => {
          if (item.routePath && item.permKey) {
            map[item.routePath] = item.permKey;
          }
        });
        permissionMappings.value = map;
        localStorage.setItem('permissionMappings', JSON.stringify(map));
      } else {
        console.error('[AuthStore] API returned success=false');
      }
    } catch (e) {
      console.error('Failed to fetch permission mappings from DB', e);
    }
  };

  const firstAccessiblePath = () => {
    if (!user.value) return '/gateway'
    if (user.value.role === 'ADMIN') return '/admin/company-applications'

    // Default to My Profile as requested
    return '/my-profile'
  }

  // const loadProfile = async () => {
  //   try {
  //     const res = await getProfileApi()
  //     const { success, data } = res.data
  //     if (!success) throw new Error()
  //
  //     profile.value = {
  //       name: data.user.name,
  //       companyName: data.company.name,
  //     }
  //
  //     localStorage.setItem('profile', JSON.stringify(profile.value))
  //   } catch {
  //     clearAuthState()
  //   }
  // }

  return {
    accessToken,
    user,
    permissions,
    permissionMappings,
    loading,

    isLoggedIn,
    isAdmin,
    hasPermission,

    setAccessToken,
    resetUser,
    setUserFromToken,
    loadFromStorage,
    clearAuthState,

    login,
    fetchPermissions,
    fetchPermissionMappings,
    refreshTokens,
    // register,
    logout,

    // checkLoginId,
    // checkNickname,
    firstAccessiblePath
  };
});
