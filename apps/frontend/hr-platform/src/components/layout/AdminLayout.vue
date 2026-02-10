<template>
  <div class="admin-layout">
    <!-- Header -->
    <header class="admin-header">
      <div class="header-left">
        <div class="brand" @click="goHome">
          <BrandLogo size="36" class="logo" />
          <div class="brand-text">
            <div class="brand-title">HRADAR Admin</div>
            <div class="brand-sub">통합 관리자 시스템</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="logout-btn" @click="logout">로그아웃</button>
      </div>
    </header>

    <div class="admin-body">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="section-title">시스템 관리</div>
        <nav class="nav">
          <RouterLink to="/admin/company/manage" class="nav-item" active-class="active">
            <span>회사 정보 관리</span>
            <span class="arrow">›</span>
          </RouterLink>
          <RouterLink to="/admin/company-applications" class="nav-item" active-class="active">
            <span>회사 신청 관리</span>
            <span class="arrow">›</span>
          </RouterLink>
          <RouterLink to="/admin/user-accounts" class="nav-item" active-class="active">
            <span>사용자 계정 관리</span>
            <span class="arrow">›</span>
          </RouterLink>
          <RouterLink to="/admin/permissions" class="nav-item" active-class="active">
            <span>권한 레지스트리</span>
            <span class="arrow">›</span>
          </RouterLink>
          <!-- Future Admin Menus -->
        </nav>
      </aside>

      <!-- Content -->
      <main class="admin-content">
        <RouterView />
      </main>
    </div>

    <!-- Chatbot Components (Removed unused) -->
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import BrandLogo from '@/components/common/BrandLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

const goHome = () => router.push('/home')

const logout = async () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    await authStore.logout()
    router.push('/home')
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc; /* Light gray bg like main app */
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* ===== Header ===== */
.admin-header {
  height: 56px;
  background-color: white;
  border-bottom: 1px solid #e6e8ec;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  flex-shrink: 0;
}

.header-left { display: flex; align-items: center; }
.brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.logo {
  cursor: pointer;
}
.brand-text { display: flex; flex-direction: column; line-height: 1.1; }
.brand-title { font-size: 15px; font-weight: 700; color: #1f2937; }
.brand-sub { font-size: 11px; color: #6b7280; }

.header-right { display: flex; align-items: center; gap: 12px; }
.logout-btn {
  font-size: 12px; padding: 6px 10px; border-radius: 6px;
  border: 1px solid #e6e8ec; background: #ffffff; color: #374151;
  cursor: pointer; transition: all 0.15s;
}
.logout-btn:hover { background: #f4f6f8; }

/* ===== Body ===== */
.admin-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ===== Sidebar ===== */
.admin-sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e6e8ec;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 9px; font-weight: 600; color: #8b95a1;
  margin: 16px 0 6px 8px; letter-spacing: 0.02em;
}

.nav { display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  padding: 9px 12px; font-size: 11px; font-weight: 500; color: #2f343d;
  border-radius: 8px; display: flex; justify-content: space-between; align-items: center;
  cursor: pointer; text-decoration: none; transition: all 0.15s;
}
.nav-item:hover { background: #f4f6f8; }
.nav-item.active { background: #1f4fd8; color: white; }
.nav-item.active:hover { background: #1f4fd8; }
.nav-item .arrow { font-size: 15px; color: #9aa1ad; }
.nav-item.active .arrow { color: rgba(255,255,255,0.7); }

/* ===== Content ===== */
.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}
</style>
