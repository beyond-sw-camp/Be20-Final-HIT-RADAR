<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-left">
          <h2>{{ isEditMode ? '권한 정보 수정' : '새 권한 등록' }}</h2>
        </div>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body custom-scrollbar">
        <form @submit.prevent="handleSubmit">
          <div class="info-section">
            <h3 class="section-title">기본 정보</h3>
            <div class="form-container">
              
              <!-- 권한 키 (생성 시에만 입력) -->
              <div class="form-group" v-if="!isEditMode">
                <label class="form-label">
                  권한 키 (Key) <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.permKey" 
                  class="form-input"
                  maxlength="100" 
                  placeholder="예: USER_READ" 
                  required 
                />
                <small class="form-hint">시스템 고유 식별 키입니다. (저장 후 변경 불가)</small>
              </div>

              <!-- 권한 키 (수정 시 읽기 전용) -->
              <div class="form-group" v-else>
                 <label class="form-label">권한 키 (Key)</label>
                 <input type="text" :value="form.permKey" class="form-input readonly" readonly />
              </div>

              <div class="form-group">
                <label class="form-label">
                  권한 명 (Name) <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.name" 
                  class="form-input"
                  maxlength="255" 
                  placeholder="예: 사용자 조회" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  경로 (Route Path) <span class="required">*</span>
                </label>
                <input 
                  type="text" 
                  v-model="form.routePath" 
                  class="form-input"
                  maxlength="255" 
                  placeholder="예: /users" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">설명</label>
                <textarea 
                  v-model="form.description" 
                  class="form-textarea"
                  maxlength="255" 
                  rows="3"
                  placeholder="권한에 대한 설명을 입력하세요."
                ></textarea>
              </div>

            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-cancel" @click="$emit('close')">취소</button>
            <button type="submit" class="btn-submit" :disabled="loading">
              {{ loading ? '저장 중...' : '저장' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const props = defineProps({
  editData: { type: Object, default: null } // null이면 생성 모드
})

const emit = defineEmits(['close', 'submit'])

const isEditMode = ref(false)
const loading = ref(false)

const form = reactive({
  permId: null,
  permKey: '',
  name: '',
  routePath: '',
  description: ''
})

onMounted(() => {
  if (props.editData) {
    isEditMode.value = true
    form.permId = props.editData.permId
    form.permKey = props.editData.permKey
    form.name = props.editData.name
    // null safety
    form.routePath = props.editData.routePath || ''
    form.description = props.editData.description || ''
  } else {
    isEditMode.value = false
  }
})

const handleSubmit = async () => {
  loading.value = true
  // Emit event to parent to handle API call
  // Parent will handle success/failure and close modal
  try {
    emit('submit', { ...form }, isEditMode.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Reusing styles from AdminUserAccountDetailModal mostly */
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(2px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; animation: fadeIn 0.2s ease;
}

.modal-container {
  width: 500px; max-width: 90%; max-height: 85vh;
  background: white; border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex; flex-direction: column; overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  padding: 24px 28px; display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-bottom: 1px solid #f2f2f2;
}
.modal-header h2 { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin: 0; }
.btn-close {
  background: none; border: none; font-size: 28px; color: #a0a0a0;
  cursor: pointer; line-height: 1; margin-top: -4px; margin-right: -8px;
}
.btn-close:hover { color: #333; }

.modal-body { padding: 28px; overflow-y: auto; flex: 1; }

.info-section { margin-bottom: 24px; }
.section-title { font-size: 0.9rem; color: #666; font-weight: 600; margin-bottom: 12px; }

.form-container { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 14px; font-weight: 600; color: #374151; }
.required { color: #ef4444; }

.form-input, .form-textarea {
  width: 100%; padding: 10px 14px;
  border: 1px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #1f2937;
  transition: all 0.2s;
  background-color: #f9fafb;
}
.form-input:focus, .form-textarea:focus {
  outline: none; background-color: white; border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
.form-textarea { resize: none; }
.form-input.readonly { background-color: #f3f4f6; color: #6b7280; cursor: not-allowed; }
.form-hint { font-size: 12px; color: #9ca3af; margin-top: 2px; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  margin-top: 28px; padding-top: 20px; border-top: 1px solid #f2f2f2;
}

.btn-cancel {
  padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;
  background: #f3f4f6; color: #4b5563; border: none; cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover { background: #e5e7eb; }

.btn-submit {
  padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 14px;
  background: #3b82f6; color: white; border: none; cursor: pointer;
  transition: background 0.2s;
}
.btn-submit:hover { background: #2563eb; }
.btn-submit:disabled { background: #9ca3af; cursor: not-allowed; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes scaleUp { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
