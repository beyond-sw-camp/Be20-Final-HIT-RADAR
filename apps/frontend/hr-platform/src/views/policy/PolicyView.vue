<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="section-title">
      <div>
        <h1>제도·규정 관리</h1>
        <div class="sub">챗봇 응답으로 사용될 사내 규정 및 제도를 관리합니다.</div>
      </div>
      <div class="right-actions">
        <!-- Upload Button -->
        <BaseButton variant="primary" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          문서 업로드
        </BaseButton>
      </div>
    </div>

    <div class="grid-layout">
      <!-- Main Content Card (List) -->
      <div class="card">
        <div class="card-hd list-header">
          <h2>규정 목록 <span class="count" v-if="filtered">({{ filtered.length }})</span></h2>
          <div class="filter-controls">
            <!-- Category Select -->
            <div class="select-wrapper">
              <select v-model="selectedCategory" class="select">
                <option v-for="cat in uniqueCategories" :key="cat" :value="cat === '전체' ? '' : cat">
                  {{ cat === '전체' ? '전체 카테고리' : cat }}
                </option>
              </select>
              <div class="select-arrow">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>

            <!-- Search Input -->
            <div class="search-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                class="input search-input"
                v-model="q"
                placeholder="문서 제목 검색"
              />
            </div>
          </div>
        </div>

        <!-- List Content -->
        <div class="card-bd list-scroll">
          <div v-if="filtered.length" class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                   <th>문서 제목</th>
                   <th width="140" class="text-center">카테고리</th>
                   <th width="160" class="text-right">관리</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in filtered" :key="d.id" class="clickable-row">
                  <td @click="goToDetail(d.id)">
                     <span class="row-title">{{ d.title }}</span>
                  </td>
                  <td class="text-center" @click="goToDetail(d.id)">
                    <span class="badge">
                       <span class="dot"></span>
                       {{ d.category }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="btn ghost icon-btn small" @click.stop="goToDetail(d.id)" title="보기">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                    <button class="btn ghost icon-btn small" @click.stop="openEditModal(d)" title="수정">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn ghost icon-btn small danger" @click.stop="deleteDoc(d.id)" title="삭제">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="empty-state">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
             <p>검색 결과가 없거나 등록된 문서가 없습니다.</p>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <transition name="fade">
        <div v-if="store.preview" class="card preview-card">
          <div class="card-hd preview-header">
             <div class="header-left">
                <span class="status-badge">Preview</span>
                <h2>업로드 미리보기</h2>
                <span class="desc">최종 등록 전 내용을 확인하세요</span>
             </div>
             
             <div class="header-actions">
               <div class="category-input-group">
                 <span class="label">카테고리</span>
                 <input 
                    class="input small-input" 
                    type="text" 
                    v-model="previewDocType" 
                    placeholder="예: 인사규정" 
                    required 
                    ref="previewCategoryInput" 
                 />
               </div>
               <div class="btn-group">
                  <button class="btn secondary small" @click="store.addChunk">
                    + 섹션 추가
                  </button>
                  <button class="btn primary small" @click="commit">
                    최종 등록
                  </button>
                  <button class="btn ghost small" @click="store.clearPreview">
                    취소
                  </button>
               </div>
             </div>
          </div>
          
          <div class="card-bd preview-scroll">
            <div class="form-group doc-title-box">
              <label class="label">문서 제목</label>
              <input
                class="input title-input"
                v-model="store.preview.docTitle"
                required
                placeholder="문서 제목을 입력하세요"
                ref="previewTitleInput"
              />
            </div>

            <div v-if="store.preview.chunks && store.preview.chunks.length > 0" class="chunks-container">
               <div
                  v-for="(c, i) in store.preview.chunks"
                  :key="i"
                  class="chunk-item"
                >
                  <div class="chunk-header">
                    <span class="chunk-badge">SEC. {{ i + 1 }}</span>
                    <button class="btn ghost icon-btn xs danger" @click="store.removeChunk(i)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                  
                  <div class="chunk-body">
                    <input
                      class="input chunk-title"
                      placeholder="섹션 제목 (예: 제 1조 목적)"
                      v-model="c.section"
                    />
                    <textarea
                      class="input chunk-content"
                      placeholder="내용을 입력하세요..."
                      v-model="c.content"
                    />
                  </div>
                </div>
            </div>
            <div v-else class="empty-chunks">
               섹션이 없습니다. '섹션 추가' 버튼을 눌러 내용을 작성하세요.
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Document Modal -->
    <DocumentUploadModal
      v-if="showModal"
      :mode="modalMode"
      :document="editingDocument"
      @close="closeModal"
      @document-saved="handleDocumentSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documentStore'
import BaseButton from '@/components/common/BaseButton.vue'
import DocumentUploadModal from '@/components/policy/DocumentUploadModal.vue'

const router = useRouter()

const store = useDocumentStore()
const q = ref('')
const selectedCategory = ref('') // New ref for category filter
const showModal = ref(false)
const modalMode = ref('create') // 'create' or 'edit'
const editingDocument = ref(null)
const previewDocType = ref('') // Default to empty string
const previewCategoryInput = ref(null) // Ref for the category input
const previewTitleInput = ref(null) // Ref for the title input

onMounted(() => {
  store.loadDocuments()
})

const uniqueCategories = computed(() => {
  const categories = new Set(store.documents.map(d => d.category).filter(Boolean));
  return ['전체', ...Array.from(categories).sort()];
});

const filtered = computed(() =>
  store.documents.filter(d => {
    const matchesTitle = d.title.toLowerCase().includes(q.value.toLowerCase());
    const matchesCategory = selectedCategory.value === '전체' || !selectedCategory.value || d.category === selectedCategory.value;
    return matchesTitle && matchesCategory;
  })
)

function goToDetail(id) {
  router.push({ name: 'policy-detail', params: { id } })
}

function openCreateModal() {
  modalMode.value = 'create'
  editingDocument.value = null
  showModal.value = true
  previewDocType.value = '' // Reset preview type to empty when opening create modal
}

async function openEditModal(doc) {
  // Fetch full details before opening modal for editing
  await store.select(doc)
  modalMode.value = 'edit'
  editingDocument.value = store.selected // Use store.selected which has full details
  showModal.value = true
}

async function deleteDoc(id) {
  if (confirm('정말로 이 문서를 삭제하시겠습니까?')) {
    try {
      await store.deleteDocument(id)
      alert('문서가 삭제되었습니다.')
      store.loadDocuments() // Refresh the list
    } catch (error) {
      alert('문서 삭제에 실패했습니다: ' + error.message)
    }
  }
}

function closeModal() {
  showModal.value = false
  editingDocument.value = null
  store.selected = null // Clear selected document from store
}

function handleDocumentSaved() {
  closeModal()
  store.loadDocuments() // Refresh list after saving
}

function commit() {
  if (!store.preview?.docTitle.trim()) {
    alert('문서 제목을 입력해주세요.');
    previewTitleInput.value?.focus();
    return;
  }
  if (!previewDocType.value.trim()) {
    alert('문서 카테고리를 입력해주세요.');
    previewCategoryInput.value?.focus();
    return;
  }

  store.commitPreview(previewDocType.value).then(() => {
    alert('문서가 등록되었습니다.')
    store.loadDocuments() // Ensure list is reloaded after commit
    previewDocType.value = '' // Reset after commit
  }).catch(error => {
    alert('문서 등록에 실패했습니다: ' + error.message)
  })
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}
.grid-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Icons & Actions */
.icon { margin-right: 6px; }
.right-actions { display: flex; gap: 10px; }

/* Card Header */
.list-header {
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.list-header h2 {
  font-size: 16px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.count {
  font-size: 13px;
  color: var(--text-sub);
  font-weight: 500;
}

/* Filters */
.filter-controls {
  display: flex;
  gap: 10px;
  margin-left: auto;
}
.select-wrapper {
  position: relative;
  width: 150px;
}
.select {
  width: 100%;
  appearance: none;
  cursor: pointer;
  padding-right: 32px;
  font-size: 13px;
  transition: all 0.2s;
}
.select:hover, .select:focus {
  border-color: var(--primary);
  background: rgba(255,255,255,0.05);
}
.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-sub);
  pointer-events: none;
}
.search-wrapper {
  position: relative;
  width: 240px;
}
.search-input {
  width: 100%;
  padding-left: 36px;
  font-size: 13px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-sub);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}
.table {
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--border);
}
.table th {
  background: rgba(255,255,255,0.02);
  font-weight: 600;
  color: var(--text-sub);
  padding: 12px 16px;
  font-size: 13px;
}
.table td {
  padding: 14px 16px;
  vertical-align: middle;
  border-bottom: 1px solid var(--border);
  font-size: 14px;
}
.clickable-row {
  cursor: pointer;
  background: transparent;
  transition: background-color 0.15s ease;
}
.clickable-row:hover {
  background-color: var(--bg);
}
.row-title {
  font-weight: 500;
  color: var(--text-main);
  transition: color 0.15s;
}
.clickable-row:hover .row-title {
  color: var(--primary);
}
.text-center { text-align: center; }
.text-right { text-align: right; }

/* Badge */
.badge {
  background: rgba(45, 212, 191, 0.1);
  color: var(--good);
  border: 1px solid rgba(45, 212, 191, 0.2);
  padding: 4px 10px;
  font-weight: 500;
  border-radius: 20px;
}
.badge .dot {
  width: 6px;
  height: 6px;
  background-color: var(--good);
  margin-right: 4px;
}

/* Actions in Table */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.icon-btn.small {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
  transition: all 0.2s;
}
.icon-btn.small svg {
  width: 18px;
  height: 18px;
}
.icon-btn.small:hover {
  background: var(--bg);
  color: var(--text-main);
}
.icon-btn.danger:hover {
  background: rgba(251, 113, 133, 0.1);
  color: var(--bad);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  items-align: center;
  justify-content: center;
  padding: 60px 0;
  text-align: center;
  color: var(--text-sub);
}
.empty-icon {
  margin: 0 auto 16px;
  opacity: 0.5;
}

/* Preview Section Styling */
.preview-card {
  border: 1px solid var(--primary-soft);
  box-shadow: 0 0 0 1px var(--primary-soft);
}
.preview-header {
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.status-badge {
  background: var(--primary);
  color: white;
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}
.preview-header h2 { margin: 0; }
.desc { margin: 0; font-size: 13px; color: var(--text-sub); border-left: 1px solid var(--border); padding-left: 12px; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: auto;
}
.category-input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.category-input-group .label { margin: 0; font-weight: 600; font-size: 13px; }
.small-input {
  width: 140px;
  padding: 6px 12px;
  font-size: 13px;
  height: 32px;
}
.btn-group {
  display: flex;
  gap: 8px;
}
.btn.small {
  padding: 6px 12px;
  font-size: 13px;
  height: 32px;
}

/* Chunk Styling */
.doc-title-box { margin-bottom: 24px; }
.doc-title-box .label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-sub);
}
.title-input {
  font-size: 18px;
  font-weight: 700;
  padding: 12px;
}

.chunks-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chunk-item {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255,255,255,0.02);
  overflow: hidden;
}
.chunk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--border);
}
.chunk-badge {
  font-size: 11px;
  font-weight: 800;
  color: var(--text-sub);
  letter-spacing: 0.5px;
}
.chunk-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chunk-title {
  font-weight: 600;
  border-color: transparent;
  background: transparent;
  padding: 0;
  border-radius: 0;
  border-bottom: 1px solid var(--border);
}
.chunk-title:focus {
  border-color: var(--primary);
  background: transparent;
}
.chunk-content {
  min-height: 100px;
  resize: vertical;
  background: transparent;
  border: none;
  padding: 0;
}
.chunk-content:focus { box-shadow: none; }
.empty-chunks {
  text-align: center;
  padding: 40px;
  color: var(--text-sub);
  font-style: italic;
  border: 1px dashed var(--border);
  border-radius: 12px;
}

/* Animations */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 900px) {
  .list-header { flex-direction: column; align-items: flex-start; }
  .filter-controls { width: 100%; margin-left: 0; flex-wrap: wrap; }
  .select-wrapper, .search-wrapper { flex: 1; min-width: 150px; }
  .preview-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .header-actions { width: 100%; flex-direction: column; align-items: flex-start; gap: 12px; margin: 0; }
  .btn-group { width: 100%; }
}
</style>
