<template>
  <div class="page-container">
    <!-- Header Section -->
    <div class="section-title">
      <div>
        <h1>공지사항</h1>
        <div class="sub">전사 공지 및 알림 사항을 확인하세요</div>
      </div>
      <div class="right-actions">
        <!-- Category Management Button -->
        <button class="btn ghost" @click="showCategoryModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          카테고리 관리
        </button>
        <!-- Create Button -->
        <button class="btn primary" @click="goToCreate">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          공지 작성
        </button>
      </div>
    </div>

    <!-- Content Card -->
    <div class="card">
      <!-- Search & Filter Controls -->
      <div class="card-hd list-header">
        <h2>전체 목록 <span class="count" v-if="notices">({{ notices.length }})</span></h2>
        <div class="filter-controls">
          <div class="select-wrapper">
            <select v-model="categoryId" @change="handleFilterChange" class="select">
              <option value="">전체 카테고리</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <div class="select-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <div class="select-wrapper">
             <select v-model="sortDir" @change="handleFilterChange" class="select">
              <option value="DESC">최신순</option>
              <option value="ASC">과거순</option>
            </select>
            <div class="select-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </div>

          <div class="search-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              v-model="keyword"
              placeholder="제목, 내용 검색"
              @keyup.enter="handleSearch"
              class="input search-input"
            />
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="card-bd">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>공지사항을 불러오는 중입니다...</p>
        </div>

        <div v-else-if="!notices || notices.length === 0" class="empty-state">
           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>등록된 공지사항이 없습니다.</p>
        </div>

        <div v-else>
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th width="80" class="text-center">No</th>
                  <th width="120" class="text-center">카테고리</th>
                  <th class="text-left">제목</th>
                  <th width="120" class="text-center">작성자</th>
                  <th width="110" class="text-center">작성일</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="notice in notices" :key="notice.id" @click="goToDetail(notice.id)" class="clickable-row">
                  <td class="text-center text-sub">{{ notice.id }}</td>
                  <td class="text-center">
                    <span class="badge">
                       <span class="dot"></span>
                       {{ notice.categoryName }}
                    </span>
                  </td>
                  <td>
                    <span class="row-title">{{ notice.title }}</span>
                  </td>
                  <td class="text-center text-sub">{{ notice.createdByName }}</td>
                  <td class="text-center text-sub nowrap-date">{{ formatDate(notice.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 0" class="pagination">
             <button @click="changePage(1)" :disabled="currentPage <= 1" class="btn ghost icon-btn" title="First Page">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
            </button>
            <button @click="changePage(currentPage - 1)" :disabled="currentPage <= 1" class="btn ghost icon-btn" title="Previous Page">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>

            <span class="page-count">
              <span class="current">{{ currentPage }}</span>
              <span class="divider">/</span>
              <span class="total">{{ totalPages }}</span>
            </span>

            <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages" class="btn ghost icon-btn" title="Next Page">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
            <button @click="changePage(totalPages)" :disabled="currentPage >= totalPages" class="btn ghost icon-btn" title="Last Page">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Management Modal -->
    <NoticeCategoryModal :show="showCategoryModal" @close="showCategoryModal = false" />
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'
import { useRouter } from 'vue-router'
import NoticeCategoryModal from '@/components/notice/NoticeCategoryModal.vue'

const store = useNoticeStore()
const router = useRouter()

// Computed properties from store
const notices = computed(() => store.data?.items)
const totalPages = computed(() => store.data?.totalPages)
const currentPage = computed(() => store.searchCond.page)
const loading = computed(() => store.loading)
const searchCond = computed(() => store.searchCond)
const categories = computed(() => store.categories.filter(cat => cat.name !== '알림 관리'))

// Local state for UI controls, synced with store's searchCond
const keyword = ref(searchCond.value.keyword)
const categoryId = ref(searchCond.value.categoryId)
const sortDir = ref(searchCond.value.sortDir)

// Modal visibility state
const showCategoryModal = ref(false)

// Sync local state with store state when it changes (e.g. browser back/forward)
watch(searchCond, (newCond) => {
  keyword.value = newCond.keyword
  categoryId.value = newCond.categoryId
  sortDir.value = newCond.sortDir
}, { deep: true })

// Fetch initial data on mount
onMounted(() => {
  store.fetchCategories()
  store.searchNotices()
})

// Called when filters are changed
function updateFilters() {
  store.setFilters({
    keyword: keyword.value,
    categoryId: categoryId.value,
    sortDir: sortDir.value,
  })
}

function handleSearch() {
  updateFilters()
}

function handleFilterChange() {
  updateFilters()
}

// Called when page is changed
function changePage(newPage) {
  if (newPage > 0 && newPage <= totalPages.value) {
    store.setPage(newPage)
  }
}

function goToDetail(id) {
  router.push({ name: 'notice-detail', params: { id } })
}

function goToCreate() {
  router.push({ name: 'notice-create' })
}

function formatDate(dateString) {
  const date = new Date(dateString)
  // Format to YYYY.MM.DD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}
</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Icons */
.icon { margin-right: 6px; }

/* Header Actions */
.right-actions { display: flex; gap: 10px; }

/* Card Header & Filters */
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

.filter-controls {
  display: flex;
  gap: 10px;
  margin-left: auto; /* Push to right */
}

/* Custom Select & Search Styles */
.select-wrapper {
  position: relative;
  width: 130px;
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
  pointer-events: none;
  color: var(--text-sub);
}

.search-wrapper {
  position: relative;
  width: 240px;
}
.search-input {
  width: 100%;
  padding-left: 36px;
  font-size: 13px;
  transition: all 0.2s;
}
.search-input:hover, .search-input:focus {
  border-color: var(--primary);
  background: rgba(255,255,255,0.05);
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-sub);
}

/* Table Styles */
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
.text-left { text-align: left; }
.text-sub { color: var(--text-sub); font-size: 13px; }
.nowrap-date { white-space: nowrap; }

/* Badge */
.badge {
  background: rgba(79, 124, 255, 0.1);
  color: var(--primary);
  border: 1px solid rgba(79, 124, 255, 0.2);
  padding: 4px 10px;
  font-weight: 500;
  border-radius: 20px;
}
.badge .dot {
  width: 6px;
  height: 6px;
  background-color: var(--primary);
  margin-right: 4px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
}
.page-count {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 12px;
  font-variant-numeric: tabular-nums;
  font-size: 14px;
}
.current { font-weight: 700; color: var(--text-main); }
.divider { color: var(--text-muted); }
.total { color: var(--text-sub); }
.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-sub);
}
.icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.icon-btn:hover:not(:disabled) {
  color: var(--text-main);
  background: var(--bg);
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  min-height: 400px; /* Ensure content is vertically centered in a decent area */
  text-align: center;
  color: var(--text-sub);
}
.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}
.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
  color: var(--text-sub);
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive adjustments */
@media (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .filter-controls {
    width: 100%;
    margin-left: 0;
    flex-wrap: wrap;
  }
  .select-wrapper, .search-wrapper {
    flex: 1;
    min-width: 150px;
  }
}
</style>
