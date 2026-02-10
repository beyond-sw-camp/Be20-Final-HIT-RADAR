<template>
  <div class="login-container">
    <form class="login-content" @submit.prevent="login">
      <h1>Sign in</h1>

      <div class="field">
        <input
          id="companyCode"
          name="companyCode"
          v-model="companyCode"
          placeholder="Company Code"
          @blur="validateCompanyCode"
          @input="validateCompanyCode"
          autocomplete="organization"
          spellcheck="false"
        />
        <Transition name="error-slide">
          <p v-if="errors.companyCode" class="error">
            {{ errors.companyCode }}
          </p>
        </Transition>
      </div>

      <div class="field">
        <input
          id="loginId"
          name="loginId"
          v-model="loginId"
          placeholder="ID"
          @blur="validateLoginId"
          @input="validateLoginId"
          autocomplete="username"
          spellcheck="false"
        />
        <Transition name="error-slide">
          <p v-if="errors.loginId" class="error">
            {{ errors.loginId }}
          </p>
        </Transition>
      </div>

      <div class="field">
        <input
          id="password"
          name="password"
          v-model="password"
          type="password"
          placeholder="Password"
          @blur="validatePassword"
          @input="validatePassword"
          autocomplete="current-password"
          spellcheck="false"
        />
        <Transition name="error-slide">
          <p v-if="errors.password" class="error">
            {{ errors.password }}
          </p>
        </Transition>
      </div>

      <p v-if="serverError" class="server-error">
        {{ serverError }}
      </p>

      <button
        class="btn-lg-primary"
        @click="login"
        :disabled="auth.loading || !isFormValid"
      >
        {{ auth.loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
const emit = defineEmits(['login-success'])

const loginId = ref('')
const password = ref('')
const companyCode = ref('')

const errors = ref({ display: 'none', companyCode: '', loginId: '', password: '' })
const serverError = ref('')

const auth = useAuthStore()

/* ----------------------
 * Validation & Login
 * ---------------------- */
const validateCompanyCode = () => {
  errors.value.companyCode = !companyCode.value ? '회사 코드를 입력해주세요.' : ''
}
const validateLoginId = () => {
  errors.value.loginId = !loginId.value ? '아이디를 입력해주세요.' : ''
}
const validatePassword = () => {
  errors.value.password = !password.value ? '비밀번호를 입력해주세요.' : ''
}

const isFormValid = computed(() => {
  return (
    companyCode.value &&
    loginId.value &&
    password.value &&
    !errors.value.companyCode &&
    !errors.value.loginId &&
    !errors.value.password
  )
})

const login = async () => {
  validateCompanyCode()
  validateLoginId()
  validatePassword()

  if (!isFormValid.value) return

  serverError.value = ''

  const result = await auth.login({
    loginId: loginId.value,
    password: password.value,
    companyCode: companyCode.value,
  })

  if (result.success) {
    emit('login-success')
  } else {
    serverError.value = result.message || '로그인에 실패했습니다.'
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-content {
  width: 320px;
  padding: 20px;
}

h1 {
  margin-bottom: 28px;
  font-size: 24px;
  font-weight: 800;
  color: #ffffff; /* White text for blue bg */
  text-align: center;
  letter-spacing: -0.02em;
}

.field {
  margin-bottom: 16px;
}

input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  font-size: 0.95rem;
  color: #ffffff; /* White input text */
  background: rgba(255, 255, 255, 0.1); /* Glass effect */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  transition: all 0.2s;
  user-select: text;
  cursor: text;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.2);
  border-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
}

.error {
  margin-top: 6px;
  font-size: 13px;
  color: #ef4444;
  margin-left: 4px;
}

.server-error {
  margin: 8px 0 16px;
  font-size: 14px;
  color: #ef4444;
  text-align: center;
  background: #fef2f2;
  padding: 8px;
  border-radius: 8px;
}

/* --- Button --- */
.btn-lg-primary {
  width: 100%;
  height: 52px;
  margin-top: 12px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  box-shadow:
    0 10px 25px rgba(37, 99, 235, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
}

.btn-lg-primary:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow:
    0 15px 35px rgba(37, 99, 235, 0.4),
    inset 0 1px 0 rgba(255,255,255,0.2);
}

.btn-lg-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  background: #94a3b8;
}

/* Error Transition */
.error-slide-enter-active,
.error-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  max-height: 24px;
  opacity: 1;
  overflow: hidden;
}
.error-slide-enter-from,
.error-slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-5px);
  margin-top: 0;
}
</style>
