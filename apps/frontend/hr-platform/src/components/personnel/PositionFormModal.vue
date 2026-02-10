<template>
  <div v-if="show" class="overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">
          <div class="bot-badge">
            <i class="pi pi-cog"></i>
          </div>
          <span>{{ isEdit ? '직위 정보 수정' : '새 직위 등록' }}</span>
        </div>
        <button class="btn-close ghost" @click="$emit('close')">
          <i class="pi pi-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="form-group mb-4">
          <label class="label">직위명 <span class="required">*</span></label>
          <input 
            type="text" 
            v-model="modelValue.name" 
            placeholder="예: 사원, 대리, 부장" 
            required 
            class="input"
          />
        </div>
        <div class="form-group">
          <label class="label">순위 (서열 순서) <span class="required">*</span></label>
          <div class="rank-input-wrapper">
            <input 
              type="number" 
              v-model.number="modelValue.rank" 
              placeholder="예: 1, 2, 3..." 
              required 
              class="input rank-input"
            />
            <p class="hint">
              <i class="pi pi-info-circle"></i> 숫자가 낮을수록 서열이 높게 정렬됩니다.
            </p>
          </div>
        </div>
      </div>
      
      <div class="modal-foot">
        <button type="button" class="btn outline" style="flex: 1" @click="$emit('close')" :disabled="submitting">
          취소
        </button>
        <button type="button" class="btn primary" style="flex: 2" @click="$emit('submit')" :disabled="submitting">
          {{ submitting ? '처리 중...' : (isEdit ? '수정 완료' : '등록하기') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: Boolean,
  isEdit: Boolean,
  submitting: Boolean,
  modelValue: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'submit', 'update:modelValue'])
</script>

<style scoped>
.modal {
  width: min(400px, 94vw);
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-head {
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
  width: 36px;
  height: 36px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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

.modal-body {
  padding: 0 24px 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mb-4 { margin-bottom: 20px; }

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
  outline: none;
  transition: all 0.2s;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.hint {
  margin-top: 6px;
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.modal-foot {
  padding: 16px 24px 24px;
  display: flex;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
}

.btn {
  height: 44px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn.outline {
  background: white;
  border-color: #e2e8f0;
  color: #64748b;
}
.btn.outline:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #334155;
}

.btn.primary {
  background: #3b82f6;
  color: white;
}
.btn.primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
