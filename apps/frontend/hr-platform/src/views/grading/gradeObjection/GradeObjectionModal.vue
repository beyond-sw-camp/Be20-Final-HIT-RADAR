<template>
  <div class="modal-backdrop">
    <div class="modal-card">
      <!-- Header -->
      <div class="modal-header">
        <div>
          <h3 class="modal-title">이의 제기</h3>
          <p class="subtitle">
            개인 등급에 대한 이의 사유를 작성해주세요.
          </p>
        </div>
        <button class="btn-close" @click="$emit('close')">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="field">
          <label>이의 사유</label>
          <textarea
            v-model="objectionReason"
            rows="4"
            class="textarea"
            placeholder="이의 제기 사유를 입력하세요"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn ghost" @click="$emit('close')">취소</button>
        <button class="btn danger" @click="submit">
          이의 제기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  individualGradeId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['close', 'submitted'])

const objectionReason = ref('')

const submit = () => {
  if (!objectionReason.value.trim()) {
    alert('이의 제기 사유를 입력해야 합니다.')
    return
  }

  emit('submitted', {
    individualGradeId: props.individualGradeId,
    objectionReason: objectionReason.value,
  })

  emit('close')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-card {
  width: 420px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
}

.modal-body {
  padding: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  color: #6b7280;
}

.textarea {
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  resize: none;
}

.textarea:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.modal-footer {
  padding: 14px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.btn.ghost {
  background: #f3f4f6;
  color: #374151;
}

.btn.danger {
  background: #fee2e2;
  color: #b91c1c;
}
</style>
