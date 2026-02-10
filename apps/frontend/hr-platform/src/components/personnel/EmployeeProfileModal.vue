<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Dynamic Header Background -->
      <div class="modal-bg-header">
        <div class="header-actions">
           <button class="close-btn" @click="close" type="button" aria-label="Close">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
               <line x1="18" y1="6" x2="6" y2="18"></line>
               <line x1="6" y1="6" x2="18" y2="18"></line>
             </svg>
           </button>
        </div>
      </div>

      <!-- Loading/Error -->
      <div v-if="loading" class="loading-state">
        <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      </div>
      <div v-else-if="!employee" class="error-state">사원을 찾을 수 없습니다.</div>

      <!-- Content -->
      <div v-else class="modal-body">
         <!-- Floating Avatar -->
         <div class="avatar-wrapper">
           <div class="avatar-lg">
             <img v-if="employee.image" :src="resolveFileUrl(employee.image)" alt="Profile" />
             <span v-else class="avatar-placeholder">{{ employee.name?.charAt(0) }}</span>
           </div>
         </div>
         
         <!-- Main Identity -->
         <div class="identity-section">
           <h2 class="emp-name">
             {{ employee.name }} 
             <span class="emp-pos">{{ employee.positionName }}</span>
           </h2>
           <div class="dept-badge">
             <i class="pi pi-building"></i>
             {{ employee.deptName }}
           </div>
         </div>

         <!-- Info List -->
         <div class="info-list">
            <!-- Contact Group -->
            <div class="info-group">
              <h4 class="group-title">Contact</h4>
              
              <div class="info-item">
                <div class="icon-box blue"><i class="pi pi-envelope"></i></div>
                <div class="info-content">
                  <label>이메일</label>
                  <div class="value">{{ employee.email || '-' }}</div>
                </div>
              </div>

              <div class="info-item">
                <div class="icon-box green"><i class="pi pi-phone"></i></div>
                <div class="info-content">
                  <label>휴대전화</label>
                  <div class="value">{{ employee.phoneNo || '-' }}</div>
                </div>
              </div>

              <div class="info-item">
                <div class="icon-box purple"><i class="pi pi-hashtag"></i></div>
                <div class="info-content">
                  <label>사내전화 (내선)</label>
                  <div class="value">{{ employee.extNo || '-' }}</div>
                </div>
              </div>
            </div>

            <!-- Work Group -->
            <div class="info-group">
              <h4 class="group-title">Work & Personal</h4>
              
              <div class="info-row">
                 <div class="mini-item">
                    <label>사번</label>
                    <div class="value">{{ employee.employeeNo }}</div>
                 </div>
                 <div class="mini-item">
                    <label>입사일</label>
                    <div class="value">{{ employee.hireDate }}</div>
                 </div>
              </div>
              
               <div class="info-row mt-3">
                 <div class="mini-item">
                    <label>생년월일</label>
                    <div class="value">{{ employee.birth || '-' }}</div>
                 </div>
                 <div class="mini-item">
                    <label>성별</label>
                    <div class="value">{{ genderMap[employee.gender] || '-' }}</div>
                 </div>
                 <div class="mini-item">
                    <label>재직 상태</label>
                    <div :class="['status-badge', getStatusClass(employee.employmentType)]">
                       {{ employmentTypeMap[employee.employmentType] || employee.employmentType }}
                    </div>
                 </div>
                 <div class="mini-item" style="flex: 1; visibility: hidden;">
                    <!-- Spacer for alignment -->
                 </div>
              </div>
            </div>
         </div>

         <!-- Footer Button -->
         <div class="footer-action">
           <button class="confirm-btn" @click="close">확인</button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { fetchEmployeeDetail } from '@/api/employeeApi'
import { resolveFileUrl } from '@/utils/fileUrl'

const props = defineProps({
  empId: {
    type: [Number, String],
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const employee = ref(null)

const genderMap = {
  'MALE': '남성',
  'FEMALE': '여성'
}

const employmentTypeMap = {
  'WORKING': '재직',
  'LEAVE': '휴직',
  'RESIGNED': '퇴사'
}

const getStatusClass = (status) => {
  if (status === 'WORKING' || status === '재직') return 'active'
  if (status === 'LEAVE' || status === '휴직') return 'leave'
  if (status === 'RESIGNED' || status === '퇴사') return 'resigned'
  return ''
}

const loadData = async () => {
    if(!props.empId) return
    loading.value = true
    try {
        const res = await fetchEmployeeDetail(props.empId)
        if(res.data && res.data.success) {
            employee.value = res.data.data
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

watch(() => props.empId, (newId) => {
    if(newId && props.visible) loadData()
})

watch(() => props.visible, (val) => {
    if(val && props.empId) loadData()
})

onMounted(() => {
    if(props.visible && props.empId) loadData()
})
</script>

<style scoped>
/* Modal Animation & Layout */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  width: 400px;
  max-width: 90vw;
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; }}
@keyframes slideUp { from { transform: translateY(50px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; }}

/* Decorative Header */
.modal-bg-header {
  height: 120px;
  /* Brand Blue Gradient */
  background: linear-gradient(135deg, #1f4fd8 0%, #4b7cf5 100%);
  position: relative;
}

.header-actions {
  position: absolute;
  top: 16px; right: 16px;
  display: flex;
  gap: 8px;
}

.action-btn, .close-btn {
  background: rgba(255,255,255,0.25);
  border: 1px solid rgba(255,255,255,0.4);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  width: 36px; height: 36px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}
.action-btn:hover, .close-btn:hover { 
  background: rgba(255,255,255,0.5); 
  transform: scale(1.1);
}

/* Body Content */
.modal-body {
  padding: 0 24px 32px;
  margin-top: -50px; /* Pull up to overlap header */
  position: relative;
}

/* Avatar */
.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.avatar-lg {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: white;
  padding: 4px; /* White border effect */
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-lg img {
  width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
}
.avatar-placeholder {
  width: 100%; height: 100%; border-radius: 50%;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  font-size: 36px; font-weight: bold; color: #cbd5e1;
}

/* Identity */
.identity-section {
  text-align: center;
  margin-bottom: 32px;
}
.emp-name {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}
.emp-pos {
  font-size: 16px; font-weight: 500; color: #64748b; margin-left: 6px;
}
.dept-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.group-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 8px;
}
.icon-box {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.icon-box.blue { background: #e0f2fe; color: #0284c7; }
.icon-box.green { background: #dcfce7; color: #16a34a; }
.icon-box.purple { background: #f3e8ff; color: #9333ea; }

.info-content label {
  display: block;
  font-size: 11px; color: #94a3b8; margin-bottom: 2px;
}
.info-content .value {
  font-size: 14px; font-weight: 600; color: #334155;
  word-break: break-all;
}

/* Grid for Work Info */
.info-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.mini-item {
  flex: 1;
  background: #f8fafc;
  padding: 10px;
  border-radius: 10px;
  text-align: center;
}
.mini-item label {
  display: block; font-size: 11px; color: #94a3b8; margin-bottom: 4px;
}
.mini-item .value {
  font-size: 13px; font-weight: 600; color: #334155;
}
.status-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: #e2e8f0; color: #64748b;
}
.status-badge.active { background: #dcfce7; color: #15803d; } /* Green */
.status-badge.leave { background: #fef9c3; color: #a16207; } /* Yellow */
.status-badge.resigned { background: #fee2e2; color: #b91c1c; } /* Red */

.footer-action {
  margin-top: 32px;
}
.confirm-btn {
  width: 100%;
  padding: 14px;
  background: #1e293b;
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.1s;
}
.confirm-btn:active { transform: scale(0.98); }

.loading-state { padding: 40px; text-align: center; color: #cbd5e1; }
.error-state { padding: 40px; text-align: center; color: #ef4444; }
.mt-3 { margin-top: 12px; }
</style>
