<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Simple Clean Header -->
      <div class="modal-header">
        <h2 class="modal-title">부서 정보</h2>
        <button class="close-btn" @click="close" type="button">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Loading/Error -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>
      <div v-else-if="!department" class="error-state">부서를 찾을 수 없습니다.</div>

      <!-- Content -->
      <div v-else class="modal-body">
         <!-- Title Section -->
         <div class="dept-header">
           <h1 class="dept-name">{{ department.deptName }}</h1>
           <span class="dept-path text-muted">
             <i class="pi pi-sitemap"></i> 
             {{ department.parentDeptName ? `${department.parentDeptName} 소속` : '최상위 부서' }}
           </span>
         </div>

         <div class="divider"></div>

         <!-- Info Grid -->
         <div class="info-grid">
            <!-- Manager Card -->
            <div class="info-card manager-card clickable" 
                 v-if="department.managerName"
                 @click="openManagerProfile">
              <div class="card-label">부서장</div>
              <div class="card-content">
                <div class="manager-avatar">
                  {{ department.managerName.charAt(0) }}
                </div>
                <div class="manager-details">
                  <div class="name">{{ department.managerName }}</div>
                  <div class="role text-muted">Manager</div>
                </div>
                <div class="arrow">
                   <i class="pi pi-angle-right"></i>
                </div>
              </div>
            </div>
            <div class="info-card manager-card empty" v-else>
               <div class="card-label">부서장</div>
               <div class="card-content">공석</div>
            </div>

            <!-- Phone Card -->
            <div class="info-card">
              <div class="card-label">전화번호</div>
              <div class="card-content text-lg">
                <i class="pi pi-phone mr-2"></i>
                {{ department.deptPhone || '-' }}
              </div>
            </div>
         </div>

         <!-- Creation Info (Bottom) -->
         <!-- Removed as requested previously, keeping it minimal -->
         
         <div class="footer-action">
           <button class="confirm-btn" @click="close">닫기</button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getDepartmentById } from '@/api/departmentApi'
import { useRouter } from 'vue-router'

const props = defineProps({
  deptId: {
    type: [Number, String],
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const router = useRouter()

const loading = ref(false)
const department = ref(null)

const loadData = async () => {
    if(!props.deptId) return
    loading.value = true
    try {
        const res = await getDepartmentById(props.deptId)
        if(res.data && res.data.success) {
            department.value = res.data.data
        }
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const close = () => {
    emit('close')
}

const openManagerProfile = () => {
    if (department.value && department.value.managerEmpId) {
        const currentQuery = { ...router.currentRoute.value.query }
        delete currentQuery.deptId
        currentQuery.empId = department.value.managerEmpId
        router.push({ query: currentQuery })
    }
}

watch(() => props.deptId, (newId) => {
    if(newId && props.visible) loadData()
})

watch(() => props.visible, (val) => {
    if(val && props.deptId) loadData()
})

onMounted(() => {
    if(props.visible && props.deptId) loadData()
})
</script>

<style scoped>
/* Modal Animation & Layout */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); /* Darker backdrop */
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  width: 360px; /* Reliable width */
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
@keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; }}

/* Header */
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}
.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 16px;
  padding: 4px;
}
.close-btn:hover { color: #64748b; }

/* Body */
.modal-body {
  padding: 24px;
}

.dept-header {
  text-align: center;
  margin-bottom: 24px;
}
.dept-name {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}
.dept-path {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 0 24px 0;
}

/* Info Grid */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-content {
  display: flex;
  align-items: center;
  color: #334155;
  font-weight: 600;
}
.text-lg { font-size: 16px; }
.mr-2 { margin-right: 8px; }

/* Manager Specifics */
.manager-card.clickable {
  cursor: pointer;
  transition: all 0.2s;
  background: white; /* Highlight manager card */
  border-color: #cbd5e1;
}
.manager-card.clickable:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.manager-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  margin-right: 12px;
}
.manager-details {
  flex: 1;
}
.manager-details .name { font-size: 15px; color: #1e293b; }
.manager-details .role { font-size: 12px; font-weight: 400; }

.arrow { color: #cbd5e1; }

/* Footer */
.footer-action { margin-top: 24px; }
.confirm-btn {
  width: 100%;
  padding: 12px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.confirm-btn:hover { background: #1e293b; }

.loading-state, .error-state {
  padding: 40px; text-align: center; color: #64748b;
}
</style>
