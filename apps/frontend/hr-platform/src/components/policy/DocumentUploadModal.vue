<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal-surface">
      <div class="modal-header">
        <h2 class="modal-title">
          {{ isEditMode ? '문서 수정' : '새 문서 업로드' }}
        </h2>
        <button class="btn ghost icon-btn close-btn" @click="close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div class="modal-body">
        <!-- Edit Mode -->
        <div v-if="isEditMode" class="edit-mode-container">
          <!-- Meta Info -->
          <div class="form-section">
             <div class="form-row">
               <div class="form-group category-group">
                 <label class="label">카테고리</label>
                 <input 
                   class="input" 
                   type="text" 
                   v-model="docType" 
                   placeholder="예: 인사규정" 
                   required 
                 />
               </div>
               <div class="form-group title-group">
                 <label class="label">문서 제목</label>
                 <input 
                   class="input title-input" 
                   v-model="editedDocument.docTitle" 
                   placeholder="제목을 입력하세요" 
                   required 
                 />
               </div>
             </div>
          </div>

          <!-- Chunks List -->
           <div class="chunks-section">
             <div class="section-header">
               <h3 class="sub-title">문서 내용 (복수 섹션)</h3>
               <button class="btn secondary small" @click="addChunk">
                 + 섹션 추가
               </button>
             </div>
             
             <div class="chunks-list">
               <div v-for="(c, i) in editedDocument.chunks" :key="i" class="chunk-card">
                  <div class="chunk-header">
                    <span class="chunk-badge">SECTION {{ i + 1 }}</span>
                    <button class="btn ghost icon-btn xs danger" @click="removeChunk(i)" title="삭제">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  <div class="chunk-body">
                    <input
                      class="input chunk-title-input"
                      placeholder="섹션 제목 (예: 제 1조 목적)"
                      v-model="c.section"
                    />
                    <textarea
                      class="input chunk-content-input"
                      placeholder="내용을 입력하세요"
                      v-model="c.content"
                    />
                  </div>
               </div>
             </div>
           </div>
        </div>

        <!-- Upload Mode -->
        <div v-else class="upload-mode-container">
          <div class="upload-area">
             <input
              ref="fileInput"
              type="file"
              accept=".csv"
              hidden
              @change="onFile"
            />
            <div class="upload-zone" @click="fileInput.click()">
              <div class="icon-circle">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              </div>
              <div class="upload-text">
                <h3>CSV 파일 선택</h3>
                <p>클릭하여 파일을 찾아보세요</p>
              </div>
            </div>
            
            <div class="template-download">
               <button class="btn ghost small" @click="downloadTemplate">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  CSV 템플릿 다운로드
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer" v-if="isEditMode">
         <button class="btn secondary" @click="close">취소</button>
         <button class="btn primary" @click="saveDocument" :disabled="isSaveDisabled">저장하기</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useDocumentStore } from '@/stores/documentStore'
import { downloadDocumentTemplate } from '@/api/documentApi'

const props = defineProps({
  mode: {
    type: String,
    default: 'create' // 'create' or 'edit'
  },
  document: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'document-saved'])
const store = useDocumentStore()
const fileInput = ref(null)
const editedDocument = reactive({
  id: null,
  docTitle: '',
  chunks: []
})

const docType = ref('') // Default to empty string

const isEditMode = computed(() => props.mode === 'edit')

// Watch for changes in props.document to update editedDocument
watch(() => props.document, (newDoc) => {
  if (newDoc && isEditMode.value) {
    editedDocument.id = newDoc.id
    editedDocument.docTitle = newDoc.title // assuming 'title' for display
    editedDocument.chunks = newDoc.chunks ? JSON.parse(JSON.stringify(newDoc.chunks)) : []
    docType.value = newDoc.category || '' // Initialize docType from category
  } else {
    // Reset for create mode or if document is cleared
    editedDocument.id = null
    editedDocument.docTitle = ''
    editedDocument.chunks = []
    docType.value = ''
  }
}, { immediate: true })

const isSaveDisabled = computed(() => {
  return !docType.value.trim() || !editedDocument.docTitle.trim();
})


function close() {
  emit('close')
}

async function onFile(e) {
  const file = e.target.files[0]
  if (!file) return

  try {
    await store.uploadCsv(file)
    await nextTick()
    emit('document-saved') // Notify parent that document was saved (created)
  } catch (e) {
    alert('CSV 업로드 실패: ' + e.message)
  }
}

async function saveDocument() {
  try {
    const payload = {
      docTitle: editedDocument.docTitle,
      chunks: editedDocument.chunks,
      category: docType.value // Add selected category to payload
    }
    await store.updateDocument(editedDocument.id, payload)
    alert('문서가 성공적으로 수정되었습니다.')
    emit('document-saved') // Notify parent that document was saved (updated)
  } catch (error) {
    alert('문서 수정에 실패했습니다: ' + error.message)
  }
}

function addChunk() {
  editedDocument.chunks.push({
    section: '',
    content: ''
  })
}

function removeChunk(index) {
  editedDocument.chunks.splice(index, 1)
}

async function downloadTemplate() {
  const blob = await downloadDocumentTemplate()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'document_template.csv'
  a.click()

  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-surface {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 16px;
  width: 600px;
  max-width: 95vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Edit Mode Styles */
.edit-mode-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-row {
  display: flex;
  gap: 16px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.category-group {
  width: 140px;
  flex-shrink: 0;
}
.title-group {
  flex: 1;
}
.label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sub);
}
.input {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  color: var(--text-main);
  outline: none;
  font-size: 14px;
  width: 100%;
}
.input:focus {
  border-color: var(--primary);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.sub-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-sub);
  margin: 0;
}

.chunks-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chunk-card {
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}
.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0,0,0,0.03);
  border-bottom: 1px solid var(--border);
}
.chunk-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-sub);
  letter-spacing: 0.5px;
}
.chunk-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.chunk-title-input {
  font-weight: 600;
  border-color: transparent;
  background: transparent;
  padding: 0;
  border-radius: 0;
  border-bottom: 1px dashed var(--border);
}
.chunk-title-input:focus {
  border-bottom-style: solid;
}
.chunk-content-input {
  min-height: 80px;
  border: none;
  background: transparent;
  padding: 0;
  resize: vertical;
}

/* Upload Mode Styles */
.upload-mode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-soft);
  width: 100%;
  margin-bottom: 20px;
}
.upload-zone:hover {
  border-color: var(--primary);
  background: rgba(79, 124, 255, 0.05);
}
.icon-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--panel);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}
.upload-text h3 { margin: 0 0 4px; font-size: 16px; }
.upload-text p { margin: 0; color: var(--text-sub); font-size: 13px; }

.template-download {
  text-align: center;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: var(--bg-soft);
}
</style>
