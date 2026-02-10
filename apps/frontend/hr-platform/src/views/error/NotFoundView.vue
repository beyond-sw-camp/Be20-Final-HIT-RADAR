<template>
  <div class="not-found-container">
    <div class="content">
      <h1 class="error-code">404</h1>
      <h2 class="title">페이지를 찾을 수 없습니다</h2>
      <p class="description">
        요청하신 페이지가 사라졌거나, 잘못된 경로로 접근하셨습니다.<br />
        입력하신 주소가 정확한지 다시 한번 확인해 주세요.
      </p>
      <div class="actions">
        <button class="home-btn" @click="goHome">홈으로 돌아가기</button>
        <button class="back-btn" @click="goBack">이전 페이지</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa; /* 부드러운 회색 배경 */
  color: #333;
  font-family: 'Pretendard', sans-serif;
  text-align: center;
}

.content {
  max-width: 600px;
  padding: 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #e9ecef; /* 흐릿한 배경 텍스트 느낌 */
  margin: 0;
  line-height: 1;
  letter-spacing: -5px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  margin-top: -40px; /* error-code 위로 살짝 겹치게 */
  margin-bottom: 20px;
  position: relative; /* z-index를 위해 */
  color: #2c3e50;
}

.description {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.6;
  margin-bottom: 40px;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.home-btn {
  background-color: #4f46e5; /* 브랜드 컬러 (예시) */
  color: white;
}

.home-btn:hover {
  background-color: #4338ca;
  transform: translateY(-2px);
}

.back-btn {
  background-color: #e9ecef;
  color: #495057;
}

.back-btn:hover {
  background-color: #dee2e6;
  transform: translateY(-2px);
}
</style>
