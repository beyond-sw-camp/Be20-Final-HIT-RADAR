<template>
  <div class="split-layout">
    <!-- Left: Branding Section -->
    <div class="brand-section">
      <div class="brand-content">
        <div class="brand-logo" @click="goHome">
          <BrandLogo size="34" class="logo-mark" />
          <span class="logo-text">HRADAR</span>
        </div>
        <h1 class="brand-slogan">
          Data-driven<br />
          HR Management<br />
          Starts Here.
        </h1>
        <p class="brand-desc">
          데이터 기반의 인재 관리 솔루션을 경험해보세요.<br />
          간편한 신청으로 바로 시작할 수 있습니다.
        </p>
      </div>
      <div class="brand-footer">
        © 2025 HRADAR Inc.
      </div>
    </div>

    <!-- Right: Form Section -->
    <div class="form-section">
      <button class="back-btn-float" @click="goHome">
        <span class="icon">←</span> Back
      </button>
      <div class="form-wrapper">
        <CompanyApplyForm @apply-success="onSuccess" @back="goHome" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CompanyApplyForm from '@/components/auth/CompanyApplyForm.vue'
import BrandLogo from '@/components/common/BrandLogo.vue'

const router = useRouter()

const onSuccess = () => {
  alert('신청이 성공적으로 접수되었습니다.\n담당자가 확인 후 이메일로 결과를 안내해 드립니다.')
  router.push('/home')
}

const goHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.split-layout {
  display: flex;
  height: 100vh; /* Fixed height to prevent body scroll */
  width: 100%;
  background: white;
  user-select: none;
  -webkit-user-select: none;
  cursor: default;
  overflow: hidden; /* Hide scrollbars from animations */
}

/* --- Animations --- */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* --- Left Side --- */
.brand-section {
  flex: 0.8; /* Takes up about 45% */
  background: linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%);
  color: white;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
  /* Animation */
  opacity: 0;
  animation: slideInLeft 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

/* Abstract decorations for trendy look */
.brand-section::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(60px);
  animation: pulse 10s infinite alternate;
}
.brand-section::after {
  content: '';
  position: absolute;
  bottom: -50px;
  left: -50px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(50px);
  animation: pulse 12s infinite alternate-reverse;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.1); opacity: 0.8; }
}

.brand-content {
  position: relative;
  z-index: 10;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 80px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.brand-logo:hover { opacity: 0.8; }

.logo-mark {
  margin-right: 8px;
}
.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-slogan {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 24px;
  background: linear-gradient(to right, #ffffff, #94a3b8);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-desc {
  font-size: 1.1rem;
  color: #94a3b8;
  line-height: 1.6;
}

.brand-footer {
  font-size: 0.85rem;
  color: #475569;
  position: relative;
  z-index: 10;
}

/* --- Right Side --- */
.form-section {
  flex: 1.2; /* Takes up about 55% */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow-y: auto;
  /* Animation */
  opacity: 0;
  animation: slideInRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s forwards; /* 0.2s delay */
}

/* Back button float animation */
.back-btn-float {
  opacity: 0;
  animation: fadeIn 0.5s ease 0.8s forwards;
  
  position: absolute;
  top: 30px;
  right: 30px;
  
  /* Shared Back Button Style */
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
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.03);
  transition: all 0.2s;
  z-index: 10;
}
.back-btn-float:hover {
  color: #0f172a;
  border-color: #cbd5e1;
  transform: translateX(-2px);
  background: white; /* Override hover bg if needed */
}
.back-btn-float .icon { font-size: 1.1rem; line-height: 1; margin-bottom: 2px; }

.form-wrapper {
  width: 100%;
  max-width: 580px;
  padding: 40px;
}

@media (max-width: 1024px) {
  .brand-slogan { font-size: 2.5rem; }
}

@media (max-width: 768px) {
  .split-layout { flex-direction: column; }
  .brand-section { flex: none; padding: 40px; animation: fadeIn 0.8s ease forwards; }
  .brand-logo { margin-bottom: 40px; }
  .brand-slogan { font-size: 2rem; }
  .form-section { padding: 20px 0; animation: fadeIn 0.8s ease 0.2s forwards; }
  .form-wrapper { padding: 20px; }
}
</style>
