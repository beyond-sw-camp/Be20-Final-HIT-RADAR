<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content premium-modal">
      <div class="modal-hd">
        <div class="modal-title">
          <div class="bot-badge">
            <i class="pi pi-building"></i>
          </div>
          <span>회사 상세 정보</span>
        </div>
        <button class="btn-close ghost" @click="$emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-bd">
        <form @submit.prevent="$emit('submit')" id="companyForm" class="form-grid">
           <!-- Row 1 -->
           <div class="form-group">
            <label class="label">회사명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="modelValue.comName" 
              placeholder="회사 이름을 입력하세요" 
              class="input"
            />
          </div>
          <div class="form-group">
            <label class="label">사업자 등록번호</label>
            <input 
              type="text" 
              v-model="modelValue.bizNo" 
              placeholder="000-00-00000" 
              class="input"
            />
          </div>

          <!-- Row 2 -->
          <div class="form-group">
            <label class="label">대표자명</label>
             <input 
                type="text" 
                v-model="modelValue.ceoName" 
                placeholder="대표자 성함을 입력하세요" 
                class="input"
              />
          </div>
          <div class="form-group">
            <label class="label">설립일</label>
            <input 
              type="date" 
              v-model="modelValue.foundDate" 
              class="input"
            />
          </div>

          <!-- Row 3 -->
           <div class="form-group">
            <label class="label">회사 이메일</label>
             <input 
                type="email" 
                v-model="modelValue.comEmail" 
                placeholder="example@company.com" 
                class="input"
              />
          </div>
          <div class="form-group">
            <label class="label">대표 전화</label>
             <input 
                type="text" 
                v-model="modelValue.comTel" 
                placeholder="02-0000-0000" 
                class="input"
              />
          </div>

          <!-- Row 4 (Full Width) -->
           <div class="form-group full-width">
            <label class="label">주소</label>
            <input 
              type="text" 
              v-model="modelValue.address" 
              placeholder="회사 주소를 입력하세요" 
              class="input"
            />
          </div>
        </form>
      </div>

      <div class="modal-ft">
        <button v-if="showDelete" type="button" class="btn danger" @click="$emit('delete')" :disabled="submitting">
          데이터 삭제
        </button>
        <div class="right-actions">
          <button type="button" class="btn outline" @click="$emit('close')" :disabled="submitting">
            취소
          </button>
          <button type="submit" class="btn primary" :disabled="submitting" form="companyForm">
            저장
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  submitting: Boolean,
  showSave: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'submit', 'delete', 'update:modelValue'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.premium-modal {
  background: white;
  width: min(720px, 94vw);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-hd {
  padding: 24px 24px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.bot-badge {
  width: 38px;
  height: 38px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-close:hover {
  background: #f1f5f9;
  color: #475569;
}

.modal-bd {
  padding: 0 24px 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}
.required { color: #ef4444; }

.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
.input.disabled-input {
  background: #f8fafc;
  color: #475569;
}

.modal-ft {
  padding: 16px 24px 24px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
}
.right-actions {
  display: flex;
  gap: 12px;
}

.btn {
  height: 46px;
  border-radius: 12px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn.outline { background: white; border-color: #e2e8f0; color: #64748b; }
.btn.outline:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.btn.danger { background: #fee2e2; border-color: #fecaca; color: #ef4444; }
.btn.danger:hover:not(:disabled) { background: #fecaca; }
.btn.primary { background: #3b82f6; border-color: #3b82f6; color: white; }
.btn.primary:hover:not(:disabled) { background: #2563eb; border-color: #2563eb; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
