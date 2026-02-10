<template>
  <div class="dept-card">

    <div class="card-header" :style="headerStyle">
      <span class="dept-name">{{ data?.deptName || 'Unknown' }}</span>


      <span class="btn-detail-text" 
        @click.stop.prevent="openDeptDetail"
        @mousedown.stop
        @touchstart.stop>
        상세보기 <i class="pi pi-angle-right" style="font-size: 0.7rem"></i>
      </span>
    </div>

    <div class="card-body">
      <!-- Manager Section -->
      <div v-if="data?.managerName" class="manager-section" @click.stop="openProfile(data?.managerId)">
        <span class="label-role">부서장</span>
        <span class="manager-name">{{ data.managerName }}</span>
      </div>

      <div v-if="data?.employees && data.employees.length > 0" class="employee-list">
        <div 
          v-for="emp in data.employees" 
          :key="emp.empId" 
          class="employee-item clickable"
          @click.stop="openProfile(emp.empId)"
        >
          <span class="emp-name">{{ emp.name }}</span>
          <span class="emp-pos">{{ emp.positionName }}</span>
        </div>
      </div>
      <!-- Empty state removed as requested -->
    </div>
  </div>
</template>

<script setup>
import { inject, ref, onMounted, computed } from 'vue'
import router from '@/router' // Direct import for X6 context support

// const router = useRouter() // Removed: fails in X6
// const route = useRoute()   // Removed: fails in X6

const getNode = inject('getNode')
const node = getNode ? getNode() : null
const data = ref(node ? node.getData() : {})

// Use distinct colors for each depth level to improve clarity
const depthColors = [
  '#0f172a', // Depth 0: Slate 900
  '#1e40af', // Depth 1: Blue 800
  '#0369a1', // Depth 2: Sky 700
  '#0d9488', // Depth 3: Teal 600
  '#4f46e5', // Depth 4: Indigo 600
  '#9333ea', // Depth 5: Purple 600
  '#be185d', // Depth 6: Pink 700 - New
  '#b45309', // Depth 7: Amber 700 - New
  '#15803d', // Depth 8: Green 700 - New
  '#7e22ce', // Depth 9: Violet 700 - New
]

const headerStyle = computed(() => {
  const depth = data.value?.depth || 0
  const color = depthColors[depth] || '#64748b' // Default: Slate 500
  
  return {
    backgroundColor: color
  }
})

const openDeptDetail = () => {
  console.log('Open Dept Detail Clicked', data.value)
  
  let targetDeptId = data.value?.deptId

  // Fallback: Parse from Node ID `dept-10`
  if (!targetDeptId && node && node.id) {
      const parts = node.id.split('-')
      if (parts.length > 1) {
          targetDeptId = parts[1]
          console.warn('Recovered deptId from Node ID:', targetDeptId)
      }
  }

  if (targetDeptId) {
    const currentQuery = router.currentRoute.value.query
    // Trigger via router
    router.push({ query: { ...currentQuery, deptId: targetDeptId } })
  } else {
    console.error('No deptId found in node data OR node ID', data.value, node?.id)
    alert('부서 ID를 찾을 수 없습니다. 관리자에게 문의하세요.')
  }
}

const openProfile = (empId) => {
  console.log('Clicked Employee ID:', empId)
  if (!empId) {
    // console.warn('No empId found in click!', data.value)
    return
  }
  
  // Use currentRoute from imported router
  const currentQuery = router.currentRoute.value.query
  router.push({ query: { ...currentQuery, empId } })
}

onMounted(() => {
  if (node) {
    // console.log('DepartmentNode Mounted. Data:', node.getData()) 
    node.on('change:data', ({ current }) => {
      data.value = current
    })
  }
})
</script>

<style scoped>
.dept-card {
  width: 100%;
  height: 100%;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

/* Header Styling */
.card-header {
  /* Background is now set via inline style */
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between; /* Changed to space-between for button */
  transition: background-color 0.3s ease;
}

.dept-name {
  font-weight: 700;
  color: white;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}



.btn-detail-text {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  pointer-events: auto; /* Ensure clickable */
  z-index: 1000; /* Force on top */
  transition: color 0.2s;
}
.btn-detail-text:hover {
  color: white;
  text-decoration: underline;
}

/* Body Styling */
.card-body {
  flex: 1;
  padding: 8px;
  overflow-y: hidden;
  background: white;
}

/* Manager Styling */
.manager-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 4px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.manager-section:hover {
  background: #dbeafe;
  border-color: #bfdbfe;
}

.label-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: #3b82f6;
  background: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
}
.manager-name {
  font-weight: 600;
  color: #1e3a8a;
}

.employee-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.employee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #f1f5f9;
  transition: all 0.2s;
}
.employee-item.clickable {
  cursor: pointer;
}
.employee-item.clickable:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
}

.emp-name { color: #334155; font-weight: 500; }
.emp-pos { color: #64748b; font-size: 0.75rem; }

.empty-emp {
  color: #cbd5e1;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 10px;
}
</style>
