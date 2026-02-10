<template>
  <section class="page-container">
    <div class="section-title">
      <div>
        <h1>인사 이력 상세</h1>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="사원 이름 검색..." 
          class="input search-input"
        />
        <button class="btn primary" @click="loadAllHistories">검색</button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">인사 이력 정보를 불러오는 중...</div>
    
    <div v-else-if="filteredHistories.length === 0" class="empty-state">
      <i class="pi pi-inbox"></i>
      <p>조회된 이력 데이터가 없습니다.</p>
    </div>

    <div v-else class="content-wrapper">
      <MovementHistoryTable 
        :histories="paginatedHistories"
        :departments="departments"
        :positions="positions"
        :show-employee-col="true"
      />

      <!-- Pagination -->
      <div v-if="totalPages > 0" class="pagination-container">
        <button 
          class="page-btn prev"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          &lt;
        </button>

        <div class="page-numbers">
          <button 
            v-for="p in pageRange" 
            :key="p"
            :class="['page-num', { active: p === currentPage }]"
            @click="currentPage = p"
          >
            {{ p }}
          </button>
        </div>

        <button 
          class="page-btn next"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          &gt;
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import MovementHistoryTable from '@/components/personnel/MovementHistoryTable.vue'
import { fetchAllMovementHistories } from '@/api/employeeApi'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchPositions } from '@/api/positionApi'

const loading = ref(false)
const histories = ref([])
const departments = ref([])
const positions = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10 // Changed to 10 for consistency with other views

const pageRange = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const range = []
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    if (i > 0) range.push(i)
  }
  return range
})

onMounted(async () => {
  loading.value = true
  await Promise.all([
    loadDepartments(),
    loadPositions(),
    loadAllHistories()
  ])
  loading.value = false
})

const loadAllHistories = async () => {
  try {
    const res = await fetchAllMovementHistories()
    if (res.data?.success) {
      console.log('History API Response:', res.data.data.histories) // Debug: Check if 'name' exists
      histories.value = res.data.data.histories || []
    }
  } catch (e) {
    console.error('Failed to load histories', e)
  }
}

// const getEmpName removed as backend now provides it

const loadDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany()
    departments.value = res.data.data.departments || res.data.data || []
  } catch (e) { console.error(e) }
}

const loadPositions = async () => {
    try {
        const res = await fetchPositions()
        positions.value = res.data?.data?.positions || []
    } catch (e) { console.error(e) }
}

// Client-side Filter & Pagination
const filteredHistories = computed(() => {
  if (!searchQuery.value) return histories.value
  const q = searchQuery.value.toLowerCase()
  return histories.value.filter(h => 
    (h.empName && h.empName.toLowerCase().includes(q)) || // Changed to empName
    (h.eventReason && h.eventReason.toLowerCase().includes(q))
  )
})

const totalPages = computed(() => Math.ceil(filteredHistories.value.length / pageSize))

const paginatedHistories = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredHistories.value.slice(start, end)
})

// Reset page when search changes
watch(searchQuery, () => { currentPage.value = 1 })

</script>

<style scoped>
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 16px;
}
.search-box {
  display: flex;
  gap: 10px;
}
.search-input {
  width: 320px;
}

/* Standardized Input Styling */
.input {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  height: 42px;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.content-wrapper {
  margin-bottom: 24px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.page-btn {
  width: 36px; height: 36px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  background: #f8fafc;
  color: #0f172a;
  border-color: #cbd5e1;
}
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.page-numbers {
  display: flex; gap: 6px;
}
.page-num {
  min-width: 36px; height: 36px;
  padding: 0 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: white;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.page-num:hover {
  background: #f1f5f9;
  color: #0f172a;
}
.page-num.active {
  background: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
  font-weight: 600;
}

.section-title h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

.card-hd h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}
</style>
