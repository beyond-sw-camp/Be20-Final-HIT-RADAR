<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <div class="header-left">
            <i class="pi pi-file-excel header-icon"></i>
            <h2>사원 일괄 등록</h2>
          </div>
          <button class="close-btn" @click="close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-body custom-scrollbar">
          <!-- Step 1: Upload Area -->
          <div class="step-card upload-card">
            <div class="guide-header">
              <span class="step-badge">STEP 01</span>
              <h3>파일 업로드 및 템플릿</h3>
            </div>
            
            <div class="upload-controls">
              <div 
                class="drop-zone" 
                :class="{ 'has-file': selectedFile }"
                @click="$refs.fileInput.click()"
              >
                <i :class="selectedFile ? 'pi pi-file-check' : 'pi pi-cloud-upload'"></i>
                <div class="drop-text">
                  <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
                  <span v-else>파일(CSV)을 드래그하거나 클릭하여 선택하세요</span>
                </div>
                <input type="file" ref="fileInput" accept=".csv" hidden @change="handleFileSelect" />
              </div>

              <div class="action-buttons">
                <button class="btn-modern secondary" @click="handleDownloadTemplate">
                  <i class="pi pi-download"></i> 템플릿 받기
                </button>
                <button 
                  class="btn-modern primary" 
                  :disabled="!selectedFile || loading" 
                  @click="handlePreview"
                >
                  <i class="pi pi-search"></i> 미리보기
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Preview Summary & Table -->
          <Transition name="slide">
            <div v-if="previewData" class="step-card preview-card">
              <div class="guide-header">
                <span class="step-badge">STEP 02</span>
                <h3>데이터 검증 결과</h3>
              </div>

              <div class="stats-grid">
                <div class="stat-item total">
                  <div class="stat-label">전체</div>
                  <div class="stat-value">{{ totalCount }}</div>
                </div>
                <div class="stat-item success">
                  <div class="stat-label">유효</div>
                  <div class="stat-value">{{ validCount }}</div>
                </div>
                <div class="stat-item error">
                  <div class="stat-label">오류</div>
                  <div class="stat-value">{{ invalidCount }}</div>
                </div>
              </div>

              <div class="table-frame">
                <div class="table-scroll custom-scrollbar">
                  <table class="modern-table">
                    <thead>
                      <tr>
                        <th width="50">No</th>
                        <th style="min-width: 100px">이름</th>
                        <th style="min-width: 180px">이메일</th>
                        <th style="min-width: 130px">전화번호</th>
                        <th style="min-width: 100px">사번</th>
                        <th style="min-width: 120px">로그인ID</th>
                        <th style="min-width: 120px">비밀번호</th>
                        <th style="min-width: 100px">부서</th>
                        <th style="min-width: 100px">직위</th>
                        <th style="min-width: 80px">성별</th>
                        <th style="min-width: 120px">생년월일</th>
                        <th style="min-width: 120px">입사일</th>
                        <th style="min-width: 120px">상태</th>
                        <th style="min-width: 200px">검증 메시지</th>
                        <th width="50"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in previewData.rows" :key="row.rowNumber" :class="{ 'row-error': !row.valid }">
                        <td class="text-secondary">{{ row.rowNumber }}</td>
                        <td><input v-model="row.name" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.email" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.phoneNo" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.employeeNo" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.loginId" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.password" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.deptName" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.positionName" class="table-input" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.gender" class="table-input center" placeholder="M/F" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.birth" class="table-input center" placeholder="YYYY-MM-DD" @input="onRowEdit(row)" /></td>
                        <td><input v-model="row.hireDate" class="table-input center" placeholder="YYYY-MM-DD" @input="onRowEdit(row)" /></td>
                        <td>
                          <span :class="['status-badge', row.valid ? 'success' : 'error']">
                            {{ row.valid ? '정상' : '오류' }}
                          </span>
                        </td>
                        <td :class="['message-cell', { 'error-text': !row.valid }]">
                          {{ row.failReason || '검증 완료' }}
                        </td>
                        <td class="text-center">
                          <button class="btn-delete-text" @click="removeRow(index)">
                            삭제
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="modal-footer">
          <button class="btn-modern ghost" @click="close">창 닫기</button>
          <button 
            class="btn-modern primary-gradient" 
            :disabled="!canRegister" 
            @click="handleRegister"
          >
            <i class="pi pi-check-circle" v-if="!loading"></i>
            <span class="spinner-small" v-if="loading"></span>
            {{ loading ? '처리 중...' : '전체 등록' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { downloadCsvTemplate, previewCsv, registerCsv } from '@/api/employeeApi'

const props = defineProps({
  visible: Boolean
})
const emit = defineEmits(['close', 'success'])

const fileInput = ref(null)
const selectedFile = ref(null)
const previewData = ref(null)
const loading = ref(false)

const totalCount = computed(() => previewData.value ? previewData.value.rows.length : 0)
const validCount = computed(() => previewData.value ? previewData.value.rows.filter(r => r.valid).length : 0)
const invalidCount = computed(() => previewData.value ? previewData.value.rows.filter(r => !r.valid).length : 0)

const canRegister = computed(() => {
  return previewData.value && !loading.value && previewData.value.rows.length > 0
})

const onRowEdit = (row) => {
    // Client-side Re-validation
    // We check if all required fields are filled.
    // Note: Strict validation (duplicate checks, etc.) still happens on backend.
    const required = ['name', 'email', 'employeeNo', 'loginId', 'password', 'gender', 'birth'];
    const missing = required.filter(field => !row[field] || row[field].toString().trim() === '');
    
    if (missing.length === 0) {
        row.valid = true;
        row.failReason = '(수정됨 - 등록 가능)';
    } else {
        row.valid = false;
        row.failReason = '필수 입력 누락: ' + missing.join(', ');
    }
}

const close = () => {
  reset()
  emit('close')
}

const reset = () => {
  selectedFile.value = null
  previewData.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('CSV 파일만 업로드할 수 있습니다.')
      event.target.value = ''
      return
    }
    selectedFile.value = file
    previewData.value = null
  }
}

const handleDownloadTemplate = async () => {
  try {
    // API now returns the Blob directly
    const blob = await downloadCsvTemplate()
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', '사원등록_템플릿.csv')
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    window.URL.revokeObjectURL(url) // Clean up
  } catch (e) {
    alert('템플릿 다운로드 실패')
  }
}

const handlePreview = async () => {
  if (!selectedFile.value) return
  
  loading.value = true
  const formData = new FormData()
  formData.append('file', selectedFile.value)

  try {
    const res = await previewCsv(formData)
    previewData.value = res.data.data
  } catch (e) {
    alert('검증 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const removeRow = (index) => {
  previewData.value.rows.splice(index, 1)
  // Update counts locally based on remaining rows
  // This is a simple approximation. For strict counts, we'd need to re-evaluate validity.
  // For now, we trust the visual removal.
  if (previewData.value.rows.length === 0) {
      previewData.value = null
  }
}

const handleRegister = async () => {
  if (!previewData.value || previewData.value.rows.length === 0) return
  
  // We allow sending all rows, trusting the user has fixed errors or deleted bad rows.
  // The backend will validate again.
  if (!confirm(`총 ${previewData.value.rows.length}명의 사원 정보를 등록하시겠습니까?`)) return

  loading.value = true
  
  // Send ALL rows in the table
  const requestData = previewData.value.rows.map(row => ({
    name: row.name,
    email: row.email,
    employeeNo: row.employeeNo,
    loginId: row.loginId,
    password: row.password, // Use actual password from CSV/Input
    hireDate: row.hireDate,
    deptName: row.deptName,
    positionName: row.positionName,
    birth: row.birth,
    gender: row.gender,
    phoneNo: row.phoneNo
  }))

  try {
    const res = await registerCsv(requestData)
    alert(`성공적으로 ${res.data.data.successCount}명의 사원이 등록되었습니다.`)
    emit('success')
    close()
  } catch (e) {
    console.error(e)
    alert('등록 중 실패했습니다: ' + (e.response?.data?.message || '오류 발생'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Modal Structure - Aligned with Notification/Chatbot Style */
.modal-overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 2000; backdrop-filter: blur(4px);
}
.modal-container {
  background: #ffffff;
  width: 900px;
  max-width: 95vw;
  height: 80vh;
  border-radius: 14px; /* Matches NotificationModal */
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(0,0,0,.18); /* Matches NotificationModal */
  overflow: hidden;
  color: #0f172a;
}

/* Header - Simplified like Chatbot/Notification */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  font-weight: 700;
  border-bottom: 1px solid #e5e7eb;
}
.header-left { display: flex; align-items: center; gap: 10px; }
.header-icon { font-size: 1.2rem; color: #10b981; }
.header-left h2 { font-size: 1rem; font-weight: 700; color: #0f172a; }

.close-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.15s;
}
.close-btn:hover { color: #0f172a; }

/* Body Area */
.modal-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 20px; }

/* Cards & Sections - Cleaned up */
.step-card { 
  background: #ffffff; 
  border: 1px solid #f1f5f9; 
  border-radius: 12px; 
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.guide-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.step-badge { 
  background: #eff6ff; color: #1d4ed8; font-size: 10px; font-weight: 800;
  padding: 2px 8px; border-radius: 999px; border: 1px solid #c7d2fe;
}
.guide-header h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }

/* Drop Zone */
.upload-controls { display: flex; flex-direction: column; gap: 12px; }
.action-buttons { display: flex; gap: 10px; }

.drop-zone {
  border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px;
  text-align: center; cursor: pointer; transition: all 0.2s ease;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  background: #f8fafc;
}
.drop-zone:hover { border-color: #3b82f6; background: #f1f7ff; }
.drop-zone.has-file { border-color: #10b981; background: #f0fdf4; border-style: solid; }
.drop-zone i { font-size: 2rem; color: #94a3b8; }
.has-file i { color: #10b981; }
.drop-text { color: #64748b; font-size: 0.85rem; }
.file-name { color: #0f172a; font-weight: 700; font-size: 0.95rem; }

/* Statistics Grid */
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
.stat-item { padding: 12px; border-radius: 10px; text-align: center; background: #fff; border: 1px solid #f1f5f9; }
.stat-label { font-size: 0.75rem; color: #64748b; margin-bottom: 2px; font-weight: 600; }
.stat-value { font-size: 1.25rem; font-weight: 800; }
.stat-item.total .stat-value { color: #1e293b; }
.stat-item.success .stat-value { color: #10b981; }
.stat-item.error .stat-value { color: #ef4444; }

/* Table Section */
.table-frame { 
  background: white; border: 1px solid #e2e8f0; border-radius: 8px; 
  overflow: hidden; max-height: 500px; /* Increased height */
  box-shadow: 0 1px 2px rgba(0,0,0,0.05); /* Subtle shadow */
}
.table-scroll { overflow: auto; height: 100%; }
.modern-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.85rem; }
.modern-table th { 
  background: #f8fafc; padding: 12px 16px; text-align: left; 
  font-weight: 600; color: #475569; position: sticky; top: 0; z-index: 10;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap; /* Prevent header wrapping */
}
.modern-table td { 
  padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; 
  vertical-align: middle;
}
.row-error { background-color: #fff1f2; } /* Lighter red for error rows */
.table-input { 
  width: 100%; border: 1px solid transparent; background: transparent; 
  padding: 6px 8px; border-radius: 4px; transition: 0.2s;
}
.table-input:hover, .table-input:focus { background: white; border-color: #cbd5e1; outline: none; box-shadow: 0 0 0 2px rgba(226, 232, 240, 0.5); }

/* Status Badges */
.status-badge { 
  display: inline-flex; align-items: center; justify-content: center;
  padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;
  min-width: 60px; /* Ensure minimum width */
}
/* User requested: Pass=Blue, Error=Red */
.status-badge.success { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; } /* Blue */
.status-badge.error { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; } /* Red */
.error-text { color: #dc2626; font-weight: 500; font-size: 0.8rem; }

/* Footer */
.modal-footer {
  padding: 16px 24px; background: #ffffff; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 12px;
}

/* Buttons - Matches Style Palette */
.btn-modern {
  display: flex; align-items: center; gap: 8px; padding: 10px 20px; 
  border-radius: 8px; font-weight: 600; font-size: 0.9rem; 
  cursor: pointer; border: 1px solid transparent; transition: all 0.2s ease;
}
.btn-modern.primary { 
  background: #eff6ff; border-color: #bfdbfe; color: #2563eb; 
}
.btn-modern.primary:hover:not(:disabled) { background: #dbeafe; }
.btn-modern.secondary { 
  background: #ffffff; border-color: #e2e8f0; color: #475569; 
}
.btn-modern.secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-modern.ghost { background: transparent; color: #64748b; }
.btn-modern.ghost:hover { background: #f1f5f9; color: #0f172a; }
.btn-modern.primary-gradient {
  background: #0f172a; color: #ffffff; border-color: #0f172a; /* Solid dark theme */
}
.btn-modern.primary-gradient:hover:not(:disabled) { background: #1e293b; }
.btn-modern:disabled { opacity: 0.5; cursor: not-allowed; }

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-enter-from { opacity: 0; transform: translateY(20px); }

/* Helpers */
.center { text-align: center; }
.spinner-small {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Delete Button Visibility */
.btn-delete-text {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 6px 0; /* Vertical padding only */
  width: 100%; /* Fill cell width */
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap; /* Keep text on one line */
  display: flex; align-items: center; justify-content: center;
}
.btn-delete-text:hover {
  background: #dc2626;
  color: white;
  border-color: #dc2626;
  font-weight: 700;
}
</style>
