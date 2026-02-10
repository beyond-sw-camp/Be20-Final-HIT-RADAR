<template>
  <div class="gateway-body">
    <!-- Global Navigation (Logo & Back) -->
    <header class="global-nav">
      <div class="global-logo" @click="goHome">
        <BrandLogo size="34" class="logo-mark sm" />
        <span class="logo-text sm">HRADAR</span>
      </div>
      <button class="back-btn" @click="goBack">
        <span class="icon">←</span> Back
      </button>
    </header>

    <!-- Decorative Ambient Orb -->
    <div class="gateway-deco-orb"></div>
    
    <div class="container">
      <!-- Static Layer (White Background Branding) -->
      <div class="static-layer">
        <!-- Left Branding (Visible when Overlay is Right / Login Mode) -->
        <div 
          class="brand-panel left-panel"
          :class="{ 'fade-out': isRegisterMode, 'fade-in': !isRegisterMode }"
        >
          <div class="brand-content">
            <div class="logo-wrap clickable" @click="goHome">
              <BrandLogo size="42" class="logo-mark dark" />
              <span class="logo-text dark">HRADAR</span>
            </div>
            <h1>New Here?</h1>
            <p>
              데이터 기반의 인재 관리 솔루션,<br />
              HRADAR를 처음 방문하셨나요?
            </p>
            <button class="ghost-btn dark-btn" @click="toggleMode">
              About Us
            </button>
          </div>
        </div>

        <!-- Right Branding (Visible when Overlay is Left / Info Mode) -->
        <div 
          class="brand-panel right-panel"
          :class="{ 'fade-out': !isRegisterMode, 'fade-in': isRegisterMode }"
        >
          <div class="brand-content">
            <div class="logo-wrap clickable" @click="goHome">
              <BrandLogo size="42" class="logo-mark dark" />
              <span class="logo-text dark">HRADAR</span>
            </div>
            <h1>One of Us?</h1>
            <p>
              이미 HRADAR의 파트너이신가요?<br />
              로그인하여 인사이트를 확인하세요.
            </p>
            <button class="ghost-btn dark-btn" @click="toggleMode">
              Sign In
            </button>
          </div>
        </div>
      </div>

      <!-- Sliding Overlay Layer (Blue Background Content) -->
      <div 
        class="overlay-layer" 
        :class="{ 'slide-left': isRegisterMode, 'slide-right': !isRegisterMode }"
      >
        <!-- Background Effects -->
        <div class="overlay-bg-mesh"></div>
        
        <!-- Login Form Container (Visible when Overlay is Right) -->
        <div class="form-wrapper login-wrapper" :class="{ 'active': !isRegisterMode }">
          <LoginForm @login-success="onLoginSuccess" />
        </div>

        <!-- Service Intro Link Container (Visible when Overlay is Left) -->
        <div class="form-wrapper intro-wrapper" :class="{ 'active': isRegisterMode }">
          <div class="intro-content">
            <h2>Experience the Future<br />of HR Management</h2>
            <p>
              서비스 소개 페이지에서 상세한 기능과<br />
              도입 효과를 확인해보세요.
            </p>
            <button class="btn-primary-white" @click="goToDocs">
              서비스 소개 보러가기
            </button>
            <div class="sub-link" @click="goToRegister">
              <span>바로 이용 신청하기 &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer for "Completeness" -->
    <footer class="gateway-footer">
      <div class="footer-links">
        <span>© 2025 HRADAR</span>
        <span class="divider">|</span>
        <RouterLink to="/privacy-policy">개인정보처리방침</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/terms-of-service">이용약관</RouterLink>
      </div>
      <p class="footer-desc">Data-driven HR Intelligence Solution</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginForm from '@/components/auth/LoginForm.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'

const router = useRouter()
const authStore = useAuthStore()

// State: false = Login Mode (Overlay Right), true = Intro Mode (Overlay Left)
const isRegisterMode = ref(false)

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value
}

const onLoginSuccess = () => {
  const next = authStore.firstAccessiblePath()
  router.push(next || '/my-profile')
}

const goToDocs = () => {
  router.push('/home') // Landing Page
}

const goToRegister = () => {
  router.push('/register-company')
}

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=inter:wght@400;500;600;700;800&family=noto+sans+kr:wght@400;500;700;900&display=swap');

.gateway-body {
  font-family: 'Pretendard', 'Noto Sans KR', sans-serif;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  user-select: none;
  cursor: default;
  padding: 80px 0; /* Vertical space for nav and footer */
}

/* Background Design Elements */
.gateway-body::before {
  /* Grid Pattern & Noise */
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: 
    linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
  background-size: 40px 40px, auto;
  z-index: 0;
}

.gateway-body::after {
  /* Ambient Light 1 (Top Left) */
  content: '';
  position: absolute;
  top: -20%; left: -10%;
  width: 50%; height: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
  animation: pulseLight 10s infinite alternate;
}

.gateway-deco-orb {
  /* Ambient Light 2 (Bottom Right) - we need a real element or another pseudo if supported, 
     but let's stick to using the body pseudos or adding a div in template. 
     Actually, let's just make ::after huge and complex or use multiple backgrounds.
  */
  position: absolute;
  bottom: -20%; right: -10%;
  width: 60%; height: 60%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
  filter: blur(100px);
  z-index: 0;
  animation: pulseLight 15s infinite alternate-reverse;
}

@keyframes pulseLight {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.1); opacity: 1; }
}

.container {
  background: #fff;
  border-radius: 20px;
  box-shadow: 
    0 14px 28px rgba(0,0,0,0.1), 
    0 10px 10px rgba(0,0,0,0.05);
  position: relative;
  overflow: hidden;
  width: 1000px;
  max-width: 95%;
  min-height: 600px;
  height: 640px;
  animation: cardEntrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes cardEntrance {
  0% { opacity: 0; transform: translateY(30px) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

/* --- Footer --- */
.gateway-footer {
  position: absolute;
  bottom: 24px;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 50;
  color: #94a3b8;
  font-size: 0.8rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 6px;
}
.footer-links a { color: #64748b; text-decoration: none; transition: color 0.2s; }
.footer-links a:hover { color: #2563eb; }
.divider { opacity: 0.3; }
.footer-links a:hover { color: #2563eb; }
.divider { opacity: 0.3; }
.footer-desc { font-size: 0.75rem; opacity: 0.7; }

/* --- Global Nav --- */
.global-nav {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  padding: 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
}

.global-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.global-logo:hover { opacity: 1; }
.logo-mark.sm { 
  margin-right: 4px;
}
.logo-text.sm { font-size: 1.1rem; font-weight: 700; color: #1e293b; letter-spacing: -0.02em; }

.back-btn {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 99px;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
}
.back-btn:hover {
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateX(-2px);
}
.back-btn .icon { font-size: 1.1rem; line-height: 1; margin-bottom: 2px; }

/* --- Static Layer (Branding) --- */
.static-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.brand-panel {
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.6s ease-in-out;
  padding: 0 40px;
}

.left-panel {
  left: 0;
  transform: translateX(-10%);
}
.left-panel.fade-in {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
.left-panel.fade-out {
  opacity: 0;
  transform: translateX(-20%);
  pointer-events: none;
}

.right-panel {
  right: 0;
  transform: translateX(10%);
}
.right-panel.fade-in {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}
.right-panel.fade-out {
  opacity: 0;
  transform: translateX(20%);
  pointer-events: none;
}

.brand-content {
  text-align: center;
}

.logo-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 24px;
}
.logo-wrap.clickable {
  cursor: pointer;
  transition: opacity 0.2s;
}
.logo-wrap.clickable:hover {
  opacity: 0.8;
}
.logo-mark.dark {
  margin-right: 6px;
}
.logo-text.dark {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.brand-content h1 {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 16px;
}

.brand-content p {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.5;
}

.ghost-btn.dark-btn {
  padding: 12px 32px;
  border-radius: 24px;
  border: 2px solid #0f172a;
  background: transparent;
  color: #0f172a;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.ghost-btn.dark-btn:hover {
  background: #0f172a;
  color: white;
  transform: translateY(-2px);
}


/* --- Overlay Layer (Forms) --- */
.overlay-layer {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 60%;
  background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
  z-index: 10;
  transition: all 0.7s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(0,0,0,0.2);
}

.overlay-bg-mesh {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0.2;
  background-image: 
    radial-gradient(at 0% 0%, rgba(255,255,255,0.2) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(255,255,255,0.1) 0px, transparent 50%);
  pointer-events: none;
}

/* Slide Logic */
.overlay-layer.slide-right {
  transform: translateX(66.66%); 
  clip-path: polygon(80px 0, 100% 0, 100% 100%, 0 100%);
}

.overlay-layer.slide-left {
  transform: translateX(0);
  clip-path: polygon(0 0, 100% 0, calc(100% - 80px) 100%, 0 100%);
}

/* Forms inside Overlay */
.form-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease-in-out;
  padding: 0 60px;
}

/* Login Wrapper */
.login-wrapper {
  padding-left: 80px; 
}
.login-wrapper.active {
  opacity: 1; transform: translateX(0); z-index: 5; pointer-events: auto; visibility: visible;
}
.login-wrapper:not(.active) {
  opacity: 0; transform: translateX(50px); z-index: 0; pointer-events: none; visibility: hidden;
}

/* Intro Wrapper */
.intro-wrapper {
  padding-right: 80px;
}
.intro-wrapper.active {
  opacity: 1; transform: translateX(0); z-index: 5; pointer-events: auto; visibility: visible;
}
.intro-wrapper:not(.active) {
  opacity: 0; transform: translateX(-50px); z-index: 0; pointer-events: none; visibility: hidden;
}

/* Intro Content Styling */
.intro-content {
  text-align: center;
  color: white;
}
.intro-content h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 20px;
}
.intro-content p {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 30px;
  line-height: 1.6;
}
.btn-primary-white {
  padding: 14px 32px;
  border-radius: 12px;
  background: white;
  color: #2563eb;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.btn-primary-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0,0,0,0.2);
}

.sub-link {
  margin-top: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.sub-link:hover {
  opacity: 1;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 900px) {
  .gateway-body { background: white; }
  .container { width: 100%; height: 100%; border-radius: 0; box-shadow: none; }
}
</style>
