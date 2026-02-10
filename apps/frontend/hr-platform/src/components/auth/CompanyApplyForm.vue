<template>
  <div class="apply-container-trendy">
    <form class="apply-content-trendy" @submit.prevent="submitApply">
      <div class="form-header">
        <h2 class="form-title">서비스 신청</h2>
        <p class="form-subtitle">회사 정보를 입력하고 바로 시작하세요.</p>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label for="companyName">회사명</label>
          <input
            id="companyName"
            name="companyName"
            v-model="form.companyName"
            placeholder="상호명을 입력하세요"
            @blur="validateField('companyName')"
            @input="validateField('companyName')"
            class="input-modern"
            :class="{ error: errors.companyName }"
            autocomplete="off"
            spellcheck="false"
          />
          <Transition name="error-slide">
            <span v-if="errors.companyName" class="error-msg">{{ errors.companyName }}</span>
          </Transition>
        </div>

        <div class="form-group">
          <label for="bizNo">사업자등록번호</label>
          <input
            id="bizNo"
            name="bizNo"
            v-model="form.bizNo"
            placeholder="'-' 없이 숫자만"
            @blur="validateField('bizNo')"
            @input="validateField('bizNo')"
            class="input-modern"
            :class="{ error: errors.bizNo }"
          />
          <Transition name="error-slide">
            <span v-if="errors.bizNo" class="error-msg">{{ errors.bizNo }}</span>
          </Transition>
        </div>

        <div class="form-group">
          <label for="comTel">대표 전화번호</label>
          <input
            id="comTel"
            name="comTel"
            v-model="form.comTel"
            placeholder="연락 가능한 번호"
            @blur="validateField('comTel')"
            @input="validateField('comTel')"
            class="input-modern"
            :class="{ error: errors.comTel }"
          />
          <Transition name="error-slide">
            <span v-if="errors.comTel" class="error-msg">{{ errors.comTel }}</span>
          </Transition>
        </div>

        <div class="form-group full-width">
          <label for="address">사업장 주소</label>
          <input
            id="address"
            name="address"
            v-model="form.address"
            placeholder="도로명 주소 입력"
            @blur="validateField('address')"
            @input="validateField('address')"
            class="input-modern"
            :class="{ error: errors.address }"
          />
          <Transition name="error-slide">
            <span v-if="errors.address" class="error-msg">{{ errors.address }}</span>
          </Transition>
        </div>

        <div class="divider"></div>

        <div class="form-group">
          <label for="adminName">성명</label>
          <input
            id="adminName"
            name="adminName"
            v-model="form.name"
            placeholder="담당자 이름"
            @blur="validateField('name')"
            @input="validateField('name')"
            class="input-modern"
            :class="{ error: errors.name }"
          />
          <Transition name="error-slide">
            <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
          </Transition>
        </div>

        <div class="form-group">
          <label for="adminEmail">이메일</label>
          <input
            id="adminEmail"
            name="adminEmail"
            v-model="form.email"
            type="email"
            placeholder="example@company.com"
            @blur="validateField('email')"
            @input="validateField('email')"
            class="input-modern"
            :class="{ error: errors.email }"
          />
          <Transition name="error-slide">
            <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
          </Transition>
        </div>

        <div class="form-group full-width">
          <label for="adminLoginId">로그인 ID</label>
          <input
            id="adminLoginId"
            name="adminLoginId"
            v-model="form.loginId"
            placeholder="로그인에 사용할 ID"
            @blur="validateField('loginId')"
            @input="validateField('loginId')"
            class="input-modern"
            :class="{ error: errors.loginId }"
          />
          <Transition name="error-slide">
            <span v-if="errors.loginId" class="error-msg">{{ errors.loginId }}</span>
          </Transition>
        </div>
      </div>

      <div class="form-actions">
        <button
          class="btn-submit-modern"
          @click="submitApply"
          :disabled="loading"
        >
          {{ loading ? '처리중...' : '신청하기' }}
        </button>
        <button
          type="button"
          class="btn-cancel-modern"
          @click="$emit('back')"
        >
          취소
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { applyCompanyApi } from '@/api/comApp'

const emit = defineEmits(['apply-success', 'back'])

const form = reactive({
  companyName: '',
  bizNo: '',
  comTel: '',
  address: '',
  name: '',
  email: '',
  loginId: ''
})

const errors = reactive({
  companyName: '',
  bizNo: '',
  comTel: '',
  address: '',
  name: '',
  email: '',
  loginId: ''
})

const loading = ref(false)

const validateField = (field) => {
  if (!form[field]) {
    errors[field] = '정보를 입력해주세요.'
  } else {
    errors[field] = ''
  }
}

const isFormValid = computed(() => {
  return Object.keys(form).every(k => form[k]) && Object.values(errors).every(e => !e)
})

const submitApply = async () => {
  Object.keys(form).forEach(validateField)
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    await applyCompanyApi({ ...form })
    emit('apply-success')
  } catch (err) {
    const msg = err.response?.data?.message || err.customMessage || '신청 중 오류가 발생했습니다.'
    alert(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.apply-container-trendy {
  width: 100%;
}

.apply-content-trendy {
  width: 100%;
}

.form-header {
  margin-bottom: 32px;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: -0.03em;
}

.form-subtitle {
  font-size: 1rem;
  color: #64748b;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px 16px;
  margin-bottom: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.input-modern {
  height: 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 0.95rem;
  color: #0f172a;
  background: white;
  transition: all 0.2s ease;
  user-select: text; /* Ensure text is selectable */
  -webkit-user-select: text;
  cursor: text;
}

.input-modern::placeholder {
  color: #94a3b8;
}

.input-modern:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-modern.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.error-msg {
  font-size: 0.75rem;
  color: #ef4444;
  margin-left: 2px;
}

.divider {
  grid-column: 1 / -1;
  height: 1px;
  background: #f1f5f9;
  margin: 8px 0;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-submit-modern {
  height: 52px;
  background: #2563eb; /* Trust Blue */
  color: white;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: none;
}
.btn-submit-modern:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: none;
}
.btn-submit-modern:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.btn-cancel-modern {
  height: 48px;
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-cancel-modern:hover {
  background: #f8fafc;
  color: #0f172a;
}

@media (max-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
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
