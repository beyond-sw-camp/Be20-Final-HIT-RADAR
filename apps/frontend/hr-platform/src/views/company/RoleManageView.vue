<template>
  <section class="wide-container">
    <div class="section-title">
      <div>
        <h1>역할 및 권한 관리</h1>
      </div>
    </div>

    <div class="layout-grid">
      <!-- Role List -->
      <BaseCard class="role-list-card">
        <div class="card-hd flex-between">
          <h2>역할 목록</h2>
          <button class="btn primary btn-sm" @click="startCreate">
            <i class="pi pi-plus"></i> 새 역할 추가
          </button>
        </div>
        <div class="card-bd no-padding">
          <ul class="role-list">
            <li 
              v-for="role in roles" 
              :key="role.roleId" 
              :class="{ active: selectedRole?.roleId === role.roleId, system: role.isSystem === 'Y' }"
              @click="selectRole(role)"
            >
              <div class="role-info">
                <span class="role-name">{{ role.name }}</span>
                <span v-if="role.isSystem === 'Y'" class="status-badge system">시스템</span>
              </div>
              <i class="pi pi-chevron-right arrow-icon"></i>
            </li>
          </ul>
        </div>
      </BaseCard>

      <!-- Detail / Edit Area -->
      <BaseCard class="role-detail-card" v-if="selectedRole || isCreating">
        <div class="card-hd flex-between">
          <h2>{{ isCreating ? '새 역할 생성' : '역할 상세 정보' }}</h2>
          <button 
            v-if="!isCreating && selectedRole?.isSystem === 'N'" 
            class="btn danger outline btn-sm" 
            @click="confirmDelete"
          >
            역할 삭제
          </button>
        </div>

        <div class="card-bd">
          <div class="form-group mb-6">
            <label class="label">역할 명 <span class="required">*</span></label>
            <input 
              type="text" 
              v-model="form.name" 
              placeholder="예: 프로젝트 매니저, 재무 담당자"
              class="input"
              :disabled="!isCreating && selectedRole?.isSystem === 'Y'"
            />
          </div>

          <div class="permissions-section">
            <label class="label">권한 설정</label>
            <div v-if="selectedRole?.isSystem === 'Y'" class="system-role-notice">
              <i class="pi pi-info-circle"></i> 기본 역할(System Role)의 권한은 시스템 보안을 위해 수정할 수 없습니다.
            </div>
            
            <div class="perm-grid" :class="{ disabled: !isCreating && selectedRole?.isSystem === 'Y' }">
              <div 
                v-for="perm in allPermissions" 
                :key="perm.permId" 
                class="perm-item"
              >
                <label class="checkbox-container">
                  <input 
                    type="checkbox" 
                    :value="perm.permId" 
                    v-model="form.permIds"
                    :disabled="!isCreating && selectedRole?.isSystem === 'Y'"
                  />
                  <div class="check-ui"></div>
                  <div class="perm-info">
                    <div class="perm-name">{{ perm.name }}</div>
                    <div class="perm-desc">{{ perm.description }}</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div class="form-actions mt-8" v-if="isCreating || selectedRole?.isSystem === 'N'">
            <button 
              class="btn primary" 
              @click="saveRole" 
              :disabled="loading"
            >
              {{ loading ? '저장 중...' : (isCreating ? '역할 생성' : '변경사항 저장') }}
            </button>
            <button class="btn outline" @click="cancelEdit" v-if="isCreating">취소</button>
          </div>
        </div>
      </BaseCard>
      
      <BaseCard class="role-detail-card empty-card" v-else>
        <div class="empty-state">
          <i class="pi pi-shield"></i>
          <p>좌측 목록에서 역할을 선택하거나<br/>'새 역할 추가' 버튼을 눌러 관리하세요.</p>
        </div>
      </BaseCard>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import BaseCard from '@/components/common/BaseCard.vue'
import { getRoles, createRole, updateRole, deleteRole } from '@/api/roleApi'
import { getPermissions } from '@/api/permissionApi'

const roles = ref([])
const allPermissions = ref([])
const selectedRole = ref(null)
const isCreating = ref(false)
const loading = ref(false)

const form = reactive({
    name: '',
    permIds: []
})

const loadData = async () => {
    try {
        const [roleRes, permRes] = await Promise.all([
            getRoles(),
            getPermissions()
        ])
        roles.value = roleRes.data?.data || []
        allPermissions.value = permRes.data?.data || []
    } catch (e) {
        console.error(e)
    }
}

const selectRole = (role) => {
    isCreating.value = false
    selectedRole.value = role
    form.name = role.name
    form.permIds = role.permissions ? role.permissions.map(p => p.permId) : []
}

const startCreate = () => {
    selectedRole.value = null
    isCreating.value = true
    form.name = ''
    form.permIds = []
}

const cancelEdit = () => {
    isCreating.value = false
    selectedRole.value = null
}

const saveRole = async () => {
    if (!form.name.trim()) {
        alert('역할 명을 입력해주세요.')
        return
    }

    loading.value = true
    try {
        if (isCreating.value) {
            await createRole({
                name: form.name,
                permIds: form.permIds
            })
            alert('새 역할이 생성되었습니다.')
        } else {
            await updateRole(selectedRole.value.roleId, {
                name: form.name,
                permIds: form.permIds
            })
            alert('변경사항이 저장되었습니다.')
        }
        await loadData()
        if (isCreating.value) {
           isCreating.value = false
        } else {
           const updated = roles.value.find(r => r.roleId === selectedRole.value.roleId)
           if(updated) selectRole(updated)
        }
    } catch (e) {
        console.error(e)
        alert('저장 실패: ' + (e.response?.data?.message || '오류 발생'))
    } finally {
        loading.value = false
    }
}

const confirmDelete = async () => {
    if(!selectedRole.value) return
    if(!confirm(`'${selectedRole.value.name}' 역할을 삭제하시겠습니까?`)) return

    try {
        await deleteRole(selectedRole.value.roleId)
        alert('삭제되었습니다.')
        selectedRole.value = null
        await loadData()
    } catch (e) {
        console.error(e)
        alert('삭제 실패: ' + (e.response?.data?.message || '오류 발생'))
    }
}

onMounted(loadData)
</script>

<style scoped>
.wide-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.layout-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  align-items: start;
}

/* Card HD Utilities */
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.no-padding { padding: 0 !important; }

/* Role List */
.role-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 600px;
  overflow-y: auto;
}

.role-list li {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-list li:hover {
  background: #f8fafc;
}

.role-list li.active {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding-left: 16px;
}

.role-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}
.status-badge.gray { background: #f1f5f9; color: #64748b; }

.arrow-icon {
  font-size: 12px;
  color: #cbd5e1;
  transition: transform 0.2s;
}
.active .arrow-icon {
  color: #3b82f6;
  transform: translateX(3px);
}

/* Form Styles */
.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
}
.required { color: #ef4444; }

.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}
.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}
.input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.system-role-notice {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Permissions Grid */
.perm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  max-height: 400px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.perm-grid.disabled {
  opacity: 0.7;
  filter: grayscale(0.5);
}

.perm-grid.disabled .perm-item {
  pointer-events: none;
  cursor: not-allowed;
}

.perm-item {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
  transition: all 0.2s;
}
.perm-item:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.checkbox-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  position: relative;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.check-ui {
  width: 18px;
  height: 18px;
  background-color: white;
  border: 2px solid #cbd5e1;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 2px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-container input:checked ~ .check-ui {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

.check-ui::after {
  content: "";
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  display: none;
  margin-bottom: 2px;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
.status-badge.system {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.perm-info {
  display: flex;
  flex-direction: column;
}
.perm-name { font-size: 14px; font-weight: 700; color: #334155; }
.perm-desc { font-size: 12px; color: #94a3b8; margin-top: 2px; line-height: 1.4; }

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  height: 44px;
  padding: 0 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
}
.btn.primary { background: var(--primary); color: white; }
.btn.primary:hover { background: #1b64da; }
.btn.outline { background: white; border-color: #e2e8f0; color: #64748b; }
.btn.outline:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn.danger.outline { border-color: #fee2e2; color: #ef4444; }
.btn.danger.outline:hover { background: #fef2f2; }

.btn-sm { height: 32px; padding: 0 12px; font-size: 12px; border-radius: 8px; }

.empty-card {
  height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-state {
  text-align: center;
  color: #94a3b8;
}
.empty-state i { font-size: 48px; margin-bottom: 20px; opacity: 0.3; }
.empty-state p { font-size: 15px; line-height: 1.6; }

.mb-6 { margin-bottom: 24px; }
.mt-8 { margin-top: 32px; }

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
