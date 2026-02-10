<template>
  <section>
    <div class="section-title">
      <div>
        <h1>직위 관리</h1>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="직위명 검색" 
          class="input search-input"
        />
        <button class="btn primary" @click="loadPositions">검색</button>
      </div>
      
      <div class="action-buttons">
        <button class="btn primary outline" @click="openModal()">
          <i class="pi pi-plus"></i> 새 직위 등록
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">데이터를 불러오는 중입니다...</div>
    
    <div v-else class="content-wrapper">
      <PositionTable 
        :positions="filteredPositions" 
        :is-admin="true"
        @edit="openModal" 
        @delete="handleDelete" 
      />
    </div>

    <!-- Form Modal (Component) -->
    <PositionFormModal 
      v-model="form"
      :show="showModal"
      :is-edit="isEdit"
      :submitting="submitting"
      @close="closeModal"
      @submit="handleSubmit"
    />
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PositionTable from '@/components/personnel/PositionTable.vue'
import PositionFormModal from '@/components/personnel/PositionFormModal.vue'
import { 
  fetchPositions, 
  createPosition, 
  updatePosition, 
  deletePosition 
} from '@/api/positionApi'

const positions = ref([])
const loading = ref(false)
const submitting = ref(false)
const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const searchQuery = ref('')

const form = ref({
  name: '',
  rank: 1
})

const filteredPositions = computed(() => {
  if (!searchQuery.value) return positions.value
  return positions.value.filter(pos => 
    pos.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const loadPositions = async () => {
  loading.value = true
  try {
    const res = await fetchPositions()
    positions.value = res.data?.data?.positions || []
  } catch (e) {
    console.error('Failed to load positions', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadPositions)

const openModal = (pos = null) => {
  if (pos) {
    isEdit.value = true
    currentId.value = pos.positionId
    form.value = { 
      name: pos.name, 
      rank: pos.rank 
    }
  } else {
    isEdit.value = false
    currentId.value = null
    form.value = { name: '', rank: 1 }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    if (isEdit.value) {
      await updatePosition(currentId.value, form.value)
    } else {
      await createPosition(form.value)
    }
    closeModal()
    await loadPositions()
  } catch (e) {
    console.error('Submit failed', e)
    alert('작업에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('정말 삭제하시겠습니까? 관련 사원 정보에 영향을 줄 수 있습니다.')) return
  try {
    await deletePosition(id)
    await loadPositions()
  } catch (e) {
    console.error('Delete failed', e)
    alert('삭제에 실패했습니다.')
  }
}
</script>

<style scoped>
section {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.search-box {
  display: flex;
  gap: 10px;
}
.search-input {
  width: 280px;
}

/* Standardized Input Styling (should be in global but ensuring consistency) */
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

.loading-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.content-wrapper {
  margin-bottom: 24px;
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
