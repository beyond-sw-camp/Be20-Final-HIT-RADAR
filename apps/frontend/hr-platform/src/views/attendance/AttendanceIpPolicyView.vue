<template>
  <section class="attendance-ip-policy-view">
    <div class="split-layout">
        <!-- Left Panel: Configuration -->
        <div class="left-panel card">
            <div class="panel-header">
                <h3>출퇴근 허용범위 설정</h3>
            </div>
            
            <div class="config-section">
                <div class="section-title-row">
                    <h4>WEB IP</h4>
                    <span class="info-icon">ⓘ</span>
                </div>
                
                <div class="input-group">
                    <input 
                        type="text" 
                        v-model="formPolicy.description" 
                        placeholder="WEB IP명을 입력하세요. (예: 판교 오피스)" 
                        class="input-clean"
                    />
                </div>
                
                <div class="input-group-row">
                    <input 
                        type="text" 
                        v-model="formPolicy.ipAddress" 
                        placeholder="IP 대역을 입력하세요. (CIDR)" 
                        class="input-clean flex-1"
                    />
                    <button class="btn-add" @click="savePolicy">
                        {{ isEditMode ? '수정' : '+ 추가' }}
                    </button>
                </div>
                
                <div v-if="isEditMode" class="edit-cancel-row">
                    <span class="editing-text">수정 중: {{ formPolicy.description || '이름 없음' }}</span>
                    <button class="btn-text-cancel" @click="resetForm">취소</button>
                </div>
            </div>
        </div>

        <!-- Right Panel: List -->
        <div class="right-panel card">
            <div class="panel-header">
                <h3>등록된 IP 정책</h3>
                <span class="count-badge">{{ ipPolicies.length }}</span>
            </div>
            
            <div class="policy-list-container">
                <div v-if="loading" class="loading-state">
                    로딩 중...
                </div>
                <div v-else-if="ipPolicies.length === 0" class="empty-state">
                    등록된 정책이 없습니다.
                </div>
                <ul v-else class="policy-list">
                    <li v-for="policy in ipPolicies" :key="policy.ipPolicyId" class="policy-item">
                        <div class="policy-info">
                            <span class="policy-name">[{{ policy.locationName }}]</span>
                            <span class="policy-ip">{{ policy.cidr }}</span>
                        </div>
                        <div class="policy-actions-group">
                            <!-- Activation Toggle -->
                            <label class="switch sm" title="활성화/비활성화">
                                <input type="checkbox" :checked="policy.isActive" @change="toggleStatus(policy)">
                                <span class="slider round"></span>
                            </label>
                            
                            <!-- Actions -->
                            <div class="action-buttons">
                                <button class="btn-icon" @click="editPolicy(policy)" title="수정">✎</button>
                                <button 
                                    class="btn-icon delete" 
                                    @click="deletePolicy(policy.ipId)" 
                                    :disabled="isEditMode"
                                    :title="isEditMode ? '수정 중에는 삭제할 수 없습니다' : '삭제'"
                                >✕</button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import {
  fetchIpPolicies,
  createIpPolicy,
  updateIpPolicy,
  deleteIpPolicy as apiDeletePolicy,
  changeIpPolicyStatus
} from '@/api/attendanceApi'

const auth = useAuthStore()
const companyId = computed(() => auth.user?.companyId)

const ipPolicies = ref([])
const loading = ref(false)

const formPolicy = ref({
  id: null,
  ipAddress: '',
  description: '',
  enabled: true, // Default to true for new items
  ipPolicyType: 'ATTENDANCE'
})

const isEditMode = computed(() => !!formPolicy.value.id)

const loadPolicies = async () => {
  if (!companyId.value) return
  loading.value = true
  try {
    const res = await fetchIpPolicies(companyId.value)
    ipPolicies.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

const toggleStatus = async (policy) => {
    const newValue = !policy.isActive;
    try {
        await changeIpPolicyStatus(policy.ipId, { enabled: newValue });
        // Update local state immediately for responsiveness
        policy.isActive = newValue;
    } catch (error) {
        console.error("Status change failed:", error);
        // Revert on error
        policy.isActive = !newValue;
    }
}

const editPolicy = (policy) => {
    formPolicy.value = {
      id: policy.ipId,
      ipAddress: policy.cidr,
      description: policy.locationName,
      enabled: policy.isActive,
      ipPolicyType: policy.ipPolicyType
    }
}

const resetForm = () => {
    formPolicy.value = {
      id: null,
      ipAddress: '',
      description: '',
      enabled: true,
      ipPolicyType: 'ATTENDANCE'
    }
}

const savePolicy = async () => {
  if (!formPolicy.value.ipAddress || !formPolicy.value.description) {
      alert('IP 주소와 이름을 모두 입력해주세요.');
      return;
  }

  if (isEditMode.value) {
    await updateIpPolicy(formPolicy.value.id, {
      cidr: formPolicy.value.ipAddress,
      locationName: formPolicy.value.description,
      ipPolicyType: formPolicy.value.ipPolicyType
    })
  } else {
    await createIpPolicy({
      comId: companyId.value,
      cidr: formPolicy.value.ipAddress,
      locationName: formPolicy.value.description,
      ipPolicyType: 'ATTENDANCE'
    })
  }
  
  await loadPolicies()
  resetForm()
}

const deletePolicy = async (ipId) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await apiDeletePolicy(ipId);
    ipPolicies.value = ipPolicies.value.filter(p => p.ipId !== ipId);
}

onMounted(loadPolicies)
</script>

<style scoped>
.attendance-ip-policy-view {
  padding: 24px;
  height: 100%;
  background-color: #f1f5f9;
}

.split-layout {
    display: flex;
    gap: 24px;
    height: 100%;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.left-panel {
    flex: 4; /* 40% */
}

.right-panel {
    flex: 6; /* 60% */
    display: flex;
    flex-direction: column;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.panel-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
}

.panel-desc {
    font-size: 13px;
    color: #94a3b8;
    margin-bottom: 24px;
}

.config-section {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    border-top: 2px solid #3b82f6; /* Accent */
}

.section-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
}

.section-title-row h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
}

.info-icon {
    font-size: 12px;
    color: #94a3b8;
    cursor: help;
}

.input-group {
    margin-bottom: 12px;
}

.input-group-row {
    display: flex;
    gap: 8px;
}

.flex-1 { flex: 1; }

.input-clean {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
}

.input-clean:focus {
    border-color: #3b82f6;
}

.btn-add {
    padding: 0 20px;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-add:hover {
    background-color: #f8fafc;
    color: #1e293b;
}

/* Switch */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input { opacity: 0; width: 0; height: 0; }

.slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider { background-color: #10b981; } /* Green */
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 20px; }
.slider.round:before { border-radius: 50%; }

.switch.sm { width: 34px; height: 18px; }
.switch.sm .slider:before { height: 14px; width: 14px; }
.switch.sm input:checked + .slider:before { transform: translateX(16px); }


/* Right Panel List */
.policy-list-container {
    flex-grow: 1;
    overflow-y: auto;
    margin-top: 10px;
}

.policy-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.policy-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 8px;
}

.policy-info {
    display: flex;
    gap: 8px;
    font-size: 13px;
    color: #334155;
}

.policy-name { font-weight: 600; }
.policy-ip { color: #64748b; }

.policy-actions-group {
    display: flex;
    align-items: center;
    gap: 12px;
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    color: #94a3b8;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.btn-icon:hover { color: #3b82f6; }
.btn-icon.delete:hover { color: #ef4444; }

.btn-icon:disabled {
    cursor: not-allowed;
    opacity: 0.3;
    pointer-events: none; /* simple blocking */
}

.edit-cancel-row {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
}
.btn-text-cancel {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    text-decoration: underline;
}
</style>
