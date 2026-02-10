<template>
  <form @submit.prevent="handleSubmit" class="form-container">
    <div class="form-row">
      <!-- Category -->
      <div class="form-group">
        <label for="category">카테고리</label>
        <select id="category" v-model="form.categoryId" required class="form-select">
          <option disabled value="">카테고리를 선택하세요</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
      </div>
      <!-- Title -->
      <div class="form-group title-group">
        <label for="title">제목</label>
        <input id="title" v-model="form.title" required class="form-input" />
      </div>
    </div>

    <!-- Editor -->
    <div class="form-group">
      <label>내용</label>
      <div class="editor-toolbar compact">
        <div class="toolbar-group size-group">
          <label class="size-label" for="font-size-input">크기</label>
          <input
            id="font-size-input"
            type="number"
            min="8"
            max="72"
            step="1"
            class="toolbar-input"
            v-model.number="fontSizePx"
            @change="applyFontSizePx"
            @keyup.enter="applyFontSizePx"
            aria-label="글꼴 크기(px)"
          />
          <span class="size-suffix">px</span>
        </div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            :class="{ active: formatState.bold }"
            @click="exec('bold')"
            aria-label="굵게"
          ><b>B</b></button>
          <button
            type="button"
            class="toolbar-btn"
            :class="{ active: formatState.italic }"
            @click="exec('italic')"
            aria-label="기울임"
          ><i>I</i></button>
          <button
            type="button"
            class="toolbar-btn"
            :class="{ active: formatState.underline }"
            @click="exec('underline')"
            aria-label="밑줄"
          ><u>U</u></button>
        </div>

        <div class="toolbar-group">
          <button
            type="button"
            class="toolbar-btn"
            :class="{ active: formatState.justifyLeft }"
            @click="exec('justifyleft')"
            aria-label="왼쪽 정렬"
          >L</button>
          <button
            type="button"
            class="toolbar-btn"
            :class="{ active: formatState.justifyCenter }"
            @click="exec('justifycenter')"
            aria-label="가운데 정렬"
          >C</button>
          <button
            type="button"
            class="toolbar-btn"
            :class="{ active: formatState.justifyRight }"
            @click="exec('justifyright')"
            aria-label="오른쪽 정렬"
          >R</button>
        </div>

        <label class="color-label compact">
          글자색
          <input type="color" @input="applyColor($event)" />
        </label>

        <label class="color-label compact">
          배경색
          <input type="color" @input="applyBgColor($event)" />
        </label>
      </div>

      <div v-if="selectedImage" class="image-control-bar">
        <span class="image-control-title">이미지 크기</span>
        <input
          type="range"
          min="10"
          max="100"
          step="5"
          v-model.number="imageWidthPercent"
          @input="applyImageWidth"
          aria-label="이미지 크기 조절"
        />
        <span class="image-control-value">{{ imageWidthPercent }}%</span>
      </div>

      <div
        ref="editorRef"
        contenteditable="true"
        class="editor"
        @input="handleContentInput"
        @click="handleEditorClick"
        @keyup="syncFormatState"
        @mouseup="syncFormatState"
        @drop.prevent="handleDrop"
        @dragover.prevent
        @paste="handlePaste"
      ></div>
    </div>

    <!-- Attachments -->
    <div class="form-group">
      <label>첨부파일</label>
      <input
        type="file"
        multiple
        @change="handleFileUpload"
        class="form-input-file"
        ref="fileInputRef"
        style="display: none"
      />
      <div
        class="file-drop-zone"
        @click="triggerFileInput"
        @drop.prevent="handleFileDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <p>여기에 파일을 드래그 앤 드롭하거나 클릭하여 파일을 선택하세요.</p>
      </div>
      <!-- Existing Attachments -->
      <div v-if="form.existingAttachments.length" class="file-list">
        <div class="sub-label">기존 첨부파일</div>
        <div v-for="file in form.existingAttachments" :key="file.id" class="file-item">
          <span :class="{ 'removed-text': form.deletedAttachmentIds.includes(file.id) }">
            {{ file.originalName }}
          </span>
          <button type="button" @click="toggleDeleteExisting(file.id)" class="btn-remove">
            {{ form.deletedAttachmentIds.includes(file.id) ? '복구' : '✕' }}
          </button>
        </div>
      </div>

      <!-- New Attachments -->
      <div v-if="form.attachments.length" class="file-list">
        <div v-if="form.existingAttachments.length" class="sub-label">새 첨부파일</div>
        <div v-for="item in form.attachments" :key="item.id" class="file-item">
          <span>{{ item.file.name }}</span>
          <button type="button" @click="removeFile(item.id)" class="btn-remove">✕</button>
        </div>
      </div>
    </div>

    <!-- Buttons -->
    <div class="button-group">
      <button type="button" @click="$emit('cancel')" class="btn secondary">취소</button>
      <button type="submit" class="btn primary">{{ submitLabel }}</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'

const props = defineProps({
  notice: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: '저장',
  },
})

const emit = defineEmits(['submit', 'cancel'])
const store = useNoticeStore()

const categories = computed(() => store.categories)
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const fileBaseUrl = import.meta.env.VITE_FILE_BASE_URL || apiBaseUrl

const form = ref({
  title: '',
  content: '',
  categoryId: '',
  attachments: [], // For new files to be uploaded ({ id, file })
  existingAttachments: [], // For files that are already on the notice
  deletedAttachmentIds: [], // Added for tracking deletions
})

const editorRef = ref(null)
const fileInputRef = ref(null)
const selectedImage = ref(null)
const imageWidthPercent = ref(100)
const fontSizePx = ref(14)
const formatState = ref({
  bold: false,
  italic: false,
  underline: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
})

function processContent(content) {
  if (!content) return ''
  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (!apiBase) return content

  return content.replace(/<img[^>]+src="([^">]+)"/g, (match, src) => {
    // If it starts with /api and not http, prepend base
    if (src.startsWith('/api/v1/files')) {
       const baseUrl = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase
       return match.replace(src, `${baseUrl}${src}`)
    }
    return match
  })
}

// Populate form when notice prop is provided (for editing)
watch(
  () => props.notice,
  (newNotice) => {
    if (newNotice) {
      form.value.title = newNotice.title || ''
      form.value.content = newNotice.content || ''
      form.value.categoryId = newNotice.categoryId || ''
      form.value.existingAttachments = newNotice.attachments || []
      form.value.deletedAttachmentIds = []
      // When loading into editor, process the content to show images with full URL
      if(editorRef.value) editorRef.value.innerHTML = processContent(newNotice.content || '')
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (store.categories.length === 0) {
    store.fetchCategories()
  }
  // Set initial content for contenteditable div
  if(editorRef.value) {
    editorRef.value.innerHTML = processContent(form.value.content)
  }
  document.addEventListener('selectionchange', syncFormatState)
})

onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', syncFormatState)
})

function handleContentInput(e) {
  form.value.content = e.target.innerHTML
  syncFormatState()
}

function handleEditorClick(e) {
  if (e.target && e.target.tagName === 'IMG') {
    selectedImage.value = e.target
    const width = (selectedImage.value.style.width || '').replace('%', '')
    imageWidthPercent.value = Number(width) || 100
  } else {
    selectedImage.value = null
  }
}

function exec(command, value = null) {
  document.execCommand(command, false, value)
  if (editorRef.value) form.value.content = editorRef.value.innerHTML
  syncFormatState()
}

function applyFontSizePx() {
  const value = fontSizePx.value
  if (!value || value < 8 || value > 72) return
  document.execCommand('styleWithCSS', false, true)
  document.execCommand('fontSize', false, '7')
  const editor = editorRef.value
  if (!editor) return
  const fonts = editor.querySelectorAll('font[size="7"]')
  fonts.forEach((fontEl) => {
    const span = document.createElement('span')
    span.style.fontSize = `${value}px`
    span.innerHTML = fontEl.innerHTML
    fontEl.replaceWith(span)
  })
  if (editorRef.value) form.value.content = editorRef.value.innerHTML
  syncFormatState()
}

function applyColor(e) {
  exec('foreColor', e.target.value)
}

function applyBgColor(e) {
  exec('hiliteColor', e.target.value)
}

function syncFormatState() {
  const el = editorRef.value
  if (!el) return
  const selection = document.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const anchorNode = selection.anchorNode
  if (!anchorNode || !el.contains(anchorNode)) return

  formatState.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    justifyLeft: document.queryCommandState('justifyleft'),
    justifyCenter: document.queryCommandState('justifycenter'),
    justifyRight: document.queryCommandState('justifyright'),
  }
}

function applyImageWidth() {
  if (!selectedImage.value) return
  const value = imageWidthPercent.value
  if (!value) return
  selectedImage.value.style.width = `${value}%`
  selectedImage.value.style.height = 'auto'
  if (editorRef.value) form.value.content = editorRef.value.innerHTML
}
function insertImageAtCursor(url) {
  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '100%';
  img.style.height = 'auto';

  const selection = window.getSelection();
  if (selection.getRangeAt && selection.rangeCount) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(img);
  }
}


async function uploadAndInsert(file) {
  if (!file?.type.startsWith('image/')) return
  try {
    const relativeUrl = await store.uploadImage(file)
    // Use fileBaseUrl for direct access locally. Even if it starts with /, we want to prefix it 
    // if it's an API path (implied by this context) so it renders correctly in the editor.
    // However, we should be careful. If fileBaseUrl is just '/' then it's same.
    // The user explicitly asked to "attach VITE_API_BASE_URL endpoint".
    // So we assume we want absolute URL or at least prefixed with API base.
    
    let absoluteUrl = relativeUrl
    if (!relativeUrl.startsWith('http')) {
        // Remove leading slash from relativeUrl to avoid double slash if fileBaseUrl has trailing slash
        // OR handle it smartly.
        const baseUrl = fileBaseUrl.endsWith('/') ? fileBaseUrl.slice(0, -1) : fileBaseUrl
        const cleanRelative = relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl
        absoluteUrl = `${baseUrl}${cleanRelative}`
    }
    insertImageAtCursor(absoluteUrl)
    // Update content model after insertion
    if (editorRef.value) form.value.content = editorRef.value.innerHTML
  } catch (e) {
    console.error('Image upload failed:', e)
    alert('이미지 업로드에 실패했습니다.')
  }
}

function handleDrop(e) {
  const file = e.dataTransfer.files[0]
  uploadAndInsert(file)
}

function handleFileDrop(e) {
  const files = Array.from(e.dataTransfer.files || [])
  if (!files.length) return
  const now = Date.now()
  files.forEach((file, idx) => {
    form.value.attachments.push({
      id: `${now}-drop-${idx}-${Math.random().toString(16).slice(2)}`,
      file,
    })
  })
}


function handlePaste(e) {
  const item = [...e.clipboardData.items].find((i) => i.type.startsWith('image/'))
  if (!item) return
  e.preventDefault()
  uploadAndInsert(item.getAsFile())
}

function triggerFileInput() {
  fileInputRef.value.click()
}

function handleFileUpload(e) {
  const files = Array.from(e.target.files || [])
  const now = Date.now()
  files.forEach((file, idx) => {
    form.value.attachments.push({
      id: `${now}-${idx}-${Math.random().toString(16).slice(2)}`,
      file,
    })
  })
  e.target.value = '' // Reset file input
}

function removeFile(id) {
  form.value.attachments = form.value.attachments.filter((item) => item.id !== id)
}

function toggleDeleteExisting(id) {
  const index = form.value.deletedAttachmentIds.indexOf(id)
  if (index > -1) {
    form.value.deletedAttachmentIds.splice(index, 1)
  } else {
    form.value.deletedAttachmentIds.push(id)
  }
}

function handleSubmit() {
  // Clean content before saving: remove API base URL to keep paths relative
  let contentToSave = form.value.content
  const apiBase = import.meta.env.VITE_API_BASE_URL
  if (apiBase) {
      // Create a regex to match the base URL
      // Escape special characters in apiBase for regex
      const escapedBase = apiBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escapedBase, 'g')
      contentToSave = contentToSave.replace(regex, '')
  }

  const payload = {
    title: form.value.title,
    content: contentToSave,
    categoryId: form.value.categoryId,
    attachments: form.value.attachments.map((item) => item.file),
    deletedAttachmentIds: form.value.deletedAttachmentIds
  }
  emit('submit', payload)
}
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-row {
  display: flex;
  gap: 20px;
  align-items: center;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.title-group {
  flex-grow: 1;
}
.form-select, .form-input {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background-color: var(--panel);
  color: var(--text-main);
  height: 40px;
}
.editor {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px;
  min-height: 300px;
  max-height: 420px;
  overflow-y: auto;
  background-color: var(--panel);
  color: var(--text-main);
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left; /* Added to ensure text aligns to the left */
}
.editor:focus {
  border-color: var(--primary);
}
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--panel);
}
.editor-toolbar.compact {
  gap: 6px;
  padding: 6px;
  border-radius: 8px;
  background: var(--bg-soft);
}
.toolbar-group {
  display: inline-flex;
  gap: 4px;
  padding: 2px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
}
.toolbar-btn {
  padding: 5px 7px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-soft);
  cursor: pointer;
  font-size: 12px;
}
.toolbar-btn.active {
  border-color: var(--primary);
  background: var(--panel);
  color: var(--text-main);
  box-shadow: inset 0 0 0 1px var(--primary);
}
.toolbar-btn:hover {
  border-color: var(--primary);
}
.toolbar-select {
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--panel);
  color: var(--text-main);
  height: 30px;
  font-size: 12px;
}
.toolbar-input {
  width: 68px;
  padding: 5px 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text-main);
  height: 28px;
  font-size: 12px;
  text-align: right;
}
.size-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--panel);
}
.size-label {
  font-size: 12px;
  color: var(--text-sub);
  font-weight: 600;
  line-height: 1;
}
.size-suffix {
  font-size: 12px;
  color: var(--text-sub);
  line-height: 1;
}
.color-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-sub);
}
.color-label.compact {
  padding: 2px 6px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
}
.color-label input[type="color"] {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  padding: 0;
}
.image-control-bar {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--panel);
  font-size: 12px;
  color: var(--text-sub);
}
.image-control-bar input[type="range"] {
  width: 160px;
}
.image-control-title {
  color: var(--text-main);
  font-weight: 600;
}
.image-control-value {
  min-width: 36px;
  text-align: right;
  color: var(--text-main);
}
.file-drop-zone {
  border: 2px dashed var(--border);
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  background-color: var(--panel-translucent);
  color: var(--text-sub);
}
.file-drop-zone:hover {
  border-color: var(--primary);
  background-color: var(--panel);
}
.file-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  background-color: var(--panel);
  border-radius: 4px;
}
.btn-remove {
  background: none;
  border: none;
  color: var(--text-sub);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}
.btn-remove:hover {
  background-color: var(--bg-hover);
  color: var(--danger);
}
.sub-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  margin-bottom: 4px;
}
.removed-text {
  text-decoration: line-through;
  opacity: 0.5;
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.btn.primary {
  background-color: var(--primary);
  color: #ffffff;
}
.btn.secondary {
  background-color: var(--panel);
  color: var(--text-main);
  border: 1px solid var(--border);
}
</style>
