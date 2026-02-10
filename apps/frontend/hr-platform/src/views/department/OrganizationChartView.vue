
<template>
  <section class="page-container">
    <div class="section-title">
      <div>
        <h1>조직도</h1>
      </div>
      <!-- Toolbar removed as per user request -->
    </div>

    <div v-if="loading" class="loading-state">
      조직도를 불러오는 중...
    </div>

    <div v-else-if="orgData" class="chart-wrapper">
      <OrganizationChart ref="chartRef" :data="orgData" />
      
      <!-- Floating Toolbar inside chart -->
      <div class="floating-toolbar">
         <button class="btn icon-float" @click="handleZoomIn" title="확대">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
         <button class="btn icon-float" @click="handleZoomOut" title="축소">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
         </button>
         <button class="btn icon-float" @click="handleZoomToFit" title="화면 맞춤">
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
         </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="pi pi-exclamation-circle"></i>
      <p>조직도 정보를 불러올 수 없습니다.</p>
    </div>


    <!-- Employee Profile Modal -->
    <EmployeeProfileModal 
      :visible="!!selectedEmpId" 
      :emp-id="selectedEmpId"
      @close="closeModal"
      @update="handleProfileUpdate"
    />

    <!-- Department Detail Modal -->
    <DepartmentDetailModal
      :visible="!!selectedDeptId"
      :dept-id="selectedDeptId"
      @close="closeDeptModal"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OrganizationChart from '@/components/department/OrganizationChart.vue'
import EmployeeProfileModal from '@/components/personnel/EmployeeProfileModal.vue'
import DepartmentDetailModal from '@/components/department/DepartmentDetailModal.vue'
import { getOrganizationChart } from '@/api/departmentApi'

const route = useRoute()
const router = useRouter()

const orgData = ref(null)
const loading = ref(false)
const chartRef = ref(null)
const selectedEmpId = ref(null)
const selectedDeptId = ref(null)

// Watch query for modal control
watch(() => route.query.empId, (newId) => {
    selectedEmpId.value = newId || null
}, { immediate: true })

watch(() => route.query.deptId, (newId) => {
    console.log('OrgChartView watch deptId:', newId)
    selectedDeptId.value = newId || null
}, { immediate: true })

const closeModal = () => {
    const query = { ...route.query }
    delete query.empId
    router.push({ query })
}

const closeDeptModal = () => {
    const query = { ...route.query }
    delete query.deptId
    router.push({ query })
}

const handleProfileUpdate = () => {
    // If needed, reload org chart to reflect changes (e.g. name, position)
    loadOrgChart()
}

const loadOrgChart = async () => {
// ... existing load function ...
  loading.value = true
  try {
    const res = await getOrganizationChart()
    // Backend returns ApiResponse<OrganizationChartResponse>
    // OrganizationChartResponse has 'organization' list.
    if (res.data && res.data.success) {
        orgData.value = res.data.data
    }
  } catch (e) {
    console.error('Failed to load org chart', e)
  } finally {
    loading.value = false
  }
}

const handleZoomIn = () => chartRef.value?.zoomIn()
const handleZoomOut = () => chartRef.value?.zoomOut()
const handleZoomToFit = () => chartRef.value?.zoomToFit()

onMounted(loadOrgChart)
</script>

<style scoped>
/* Full Screen Layout Tweaks */
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  /* Removed padding to allow full-bleed */
}

.chart-wrapper {
  flex: 1;
  background: white;
  /* Removed border-radius and shadow for "One Screen" feel */
  border-radius: 0;
  box-shadow: none;
  overflow: hidden;
  position: relative;
  border-top: 1px solid var(--border); /* Simple separator from header */
}

/* ... existing floating-toolbar styles ... */

.btn.icon-float {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px; 
  cursor: pointer;
  color: #1f2937 !important; /* Force Dark Gray */
  transition: all 0.2s ease;
}

.btn.icon-float:hover {
  background: #f3f4f6;
  color: #111827 !important; /* Force Black on hover */
  transform: translateY(-1px);
}

.btn.icon-float i {
  font-size: 16px; /* Slightly larger */
  font-weight: bold; /* Thicker weight */
}

.toolbar {
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid var(--border);
}

.btn.icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-main);
  transition: background 0.2s;
}

.floating-toolbar {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 1px; /* Divider look via background gap if needed, or just spacing */
  z-index: 10;
  background: white;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15); /* Stronger shadow for depth */
  border: 1px solid rgba(0,0,0,0.05);
}

.btn.icon-float {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px; /* Softer radius */
  cursor: pointer;
  color: #1f2937 !important; /* Force Dark Gray */
  transition: all 0.2s ease;
}

.btn.icon-float:hover {
  background: #f3f4f6;
  color: #111827 !important; /* Force Black on hover */
  transform: translateY(-1px);
}

.btn.icon-float:active {
  transform: translateY(1px);
}

.btn.icon-float i {
  font-size: 16px; /* Slightly larger */
  font-weight: 600;
}

.loading-state, .empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}
.empty-state i {
  font-size: 32px;
  margin-bottom: 12px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}
</style>
