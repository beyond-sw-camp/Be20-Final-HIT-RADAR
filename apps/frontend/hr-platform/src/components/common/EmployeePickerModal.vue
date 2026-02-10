<template>
  <div v-if="isVisible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="title">사원 선택</h3>
        <button class="btn-close" @click="close">×</button>
      </div>

      <div class="modal-body">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            class="input-search" 
            placeholder="이름, 부서, 직위 검색..." 
            ref="searchInput"
          />
        </div>

        <div class="employee-list">
            <div v-if="loading" class="state-msg">로딩 중...</div>
            <div v-else-if="filteredEmployees.length === 0" class="state-msg">검색 결과가 없습니다.</div>
            
            <div 
              v-else
              v-for="emp in filteredEmployees" 
              :key="emp.empId || emp.id"
              class="emp-item"
              @click="select(emp)"
            >
              <div class="emp-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="emp-details">
                <div class="emp-name">
                  {{ emp.name }} 
                  <span class="emp-pos">{{ emp.positionName || '수습' }}</span>
                </div>
                <div class="emp-dept">{{ emp.deptName || '부서미정' }}</div>
              </div>
              <button class="btn-select">선택</button>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  isVisible: Boolean,
  employees: { type: Array, default: () => [] },
  loading: Boolean
})

const emit = defineEmits(['close', 'select'])

const searchQuery = ref('')
const searchInput = ref(null)

const filteredEmployees = computed(() => {
  if (!searchQuery.value) return props.employees
  const q = searchQuery.value.toLowerCase()
  return props.employees.filter(e => 
    (e.name && e.name.toLowerCase().includes(q)) ||
    (e.deptName && e.deptName.toLowerCase().includes(q)) ||
    (e.positionName && e.positionName.toLowerCase().includes(q))
  )
})

const close = () => {
  emit('close')
  searchQuery.value = ''
}

const select = (emp) => {
  emit('select', emp)
  close()
}

watch(() => props.isVisible, (val) => {
  if (val) {
    nextTick(() => searchInput.value?.focus())
  }
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}
.modal-content {
  background: white; width: 480px; height: 600px;
  border-radius: 12px;
  display: flex; flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}
.modal-header {
  padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
  display: flex; justify-content: space-between; align-items: center;
}
.title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
.btn-close { border: none; background: none; font-size: 24px; cursor: pointer; color: #94a3b8; }

.modal-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.search-bar { padding: 16px; border-bottom: 1px solid #f1f5f9; position: relative; }
.search-icon { position: absolute; left: 28px; top: 28px; color: #94a3b8; }
.input-search {
  width: 100%; padding: 12px;
  border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px;
  outline: none; transition: all 0.2s;
}
.input-search:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }

.employee-list { flex: 1; overflow-y: auto; padding: 10px; }
.state-msg { text-align: center; padding: 40px; color: #94a3b8; }

.emp-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 8px; cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f8fafc;
}
.emp-item:hover { background: #f1f5f9; }
.emp-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #e2e8f0; color: #64748b;
  display: grid; place-items: center;
}
.emp-details { flex: 1; }
.emp-name { font-weight: 600; color: #334155; font-size: 14px; }
.emp-pos { font-size: 12px; color: #64748b; font-weight: 400; margin-left: 4px; }
.emp-dept { font-size: 12px; color: #94a3b8; margin-top: 2px; }

.btn-select {
  background: #eff6ff; color: #2563eb;
  border: none; padding: 6px 12px; border-radius: 6px;
  font-size: 12px; font-weight: 600; cursor: pointer;
}
.btn-select:hover { background: #dbeafe; }
</style>
