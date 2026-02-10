<template>
  <div v-if="visible" class="modal-backdrop" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>역할 부여</h3>
        <button class="close-btn" @click="close"><i class="pi pi-times"></i></button>
      </div>
      <div class="modal-body">
        <p class="emp-info" v-if="targetEmp">
            대상: <strong>{{ targetEmp.name }}</strong> ({{ targetEmp.employeeNo || '사번미배정' }})
        </p>

        <div class="role-list">
            <div 
                v-for="role in roles" 
                :key="role.roleId" 
                class="role-item"
                :class="{ selected: selectedRoleIds.includes(role.roleId) }"
                @click="toggleRole(role.roleId)"
            >
                <div class="checkbox">
                    <i v-if="selectedRoleIds.includes(role.roleId)" class="pi pi-check"></i>
                    <div v-else class="box"></div>
                </div>
                <div class="role-details">
                    <span class="role-name">{{ role.name }}</span>
                    <span v-if="role.isSystem === 'Y'" class="badge system">기본</span>
                </div>
            </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" @click="close">취소</button>
        <button class="btn-primary" @click="save" :disabled="loading">
            {{ loading ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { getRoles } from '@/api/roleApi'
import { updateEmployeeRoles } from '@/api/employeeApi'

const props = defineProps({
    visible: Boolean,
    targetEmp: Object
})

const emit = defineEmits(['close', 'success'])

const roles = ref([])
const selectedRoleIds = ref([])
const loading = ref(false)

const loadRoles = async () => {
    try {
        const res = await getRoles()
        roles.value = res.data?.data || []
    } catch (e) {
        console.error(e)
    }
}

watch(() => props.visible, (val) => {
    if(val) {
        loadRoles()
        if(props.targetEmp && props.targetEmp.roles) {
            // 역할 이름을 ID로 매핑
            // 문제: EmployeeResponse는 'roles'를 List<String> (이름)으로 가지고 있지만, 업데이트에는 ID가 필요함.
            // 로드된 역할 목록을 사용하여 이름 -> ID 매핑을 수행함.
            // (이름이 회사 내에서 유일하다는 가정 하에 매핑)
            setTimeout(() => {
                matchRoles()
            }, 100)
        } else {
            selectedRoleIds.value = []
        }
    }
})

const matchRoles = () => {
    if(!props.targetEmp.roles) {
        selectedRoleIds.value = []
        return
    }
    const currentRoleNames = props.targetEmp.roles
    const ids = []
    
    roles.value.forEach(r => {
        if(currentRoleNames.includes(r.name)) {
            ids.push(r.roleId)
        }
    })
    selectedRoleIds.value = ids
}

const toggleRole = (roleId) => {
    const idx = selectedRoleIds.value.indexOf(roleId)
    if(idx >= 0) {
        selectedRoleIds.value.splice(idx, 1)
    } else {
        selectedRoleIds.value.push(roleId)
    }
}

const save = async () => {
    if(!props.targetEmp) return
    loading.value = true
    try {
        await updateEmployeeRoles(props.targetEmp.empId, selectedRoleIds.value)
        alert('역할이 수정되었습니다.')
        emit('success')
        emit('close')
    } catch(e) {
        console.error(e)
        alert('저장 실패')
    } finally {
        loading.value = false
    }
}

const close = () => {
    emit('close')
}

onMounted(loadRoles)
</script>

<style scoped>
.modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.5); z-index: 2000;
    display: flex; justify-content: center; align-items: center;
    backdrop-filter: blur(4px);
}
.modal-content {
    background: white; width: 400px; max-width: 90vw;
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}
.modal-header {
    padding: 16px 20px; border-bottom: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
    background: #f8fafc;
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 700; color: #1e293b; }
.close-btn { background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b; }

.modal-body { padding: 20px; }

.emp-info { margin-bottom: 16px; font-size: 14px; color: #334155; padding-bottom: 12px; border-bottom: 1px dashed #e2e8f0; }

.role-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
.role-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
    cursor: pointer; transition: all 0.2s;
}
.role-item:hover { border-color: #cbd5e1; background: #f8fafc; }
.role-item.selected { border-color: #3b82f6; background: #eff6ff; }

.checkbox { 
    width: 20px; height: 20px; border-radius: 4px; border: 2px solid #cbd5e1;
    display: flex; justify-content: center; align-items: center; color: white;
    font-size: 12px; background: white;
}
.role-item.selected .checkbox { background: #3b82f6; border-color: #3b82f6; }
.box { width: 100%; height: 100%; }

.role-details { display: flex; align-items: center; gap: 8px; }
.role-name { font-weight: 500; font-size: 14px; color: #1e293b; }
.badge.system { background: #e2e8f0; color: #64748b; font-size: 10px; padding: 2px 5px; border-radius: 4px; }

.modal-footer {
    padding: 16px 20px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #e2e8f0;
}
.btn-primary { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-secondary { background: white; border: 1px solid #cbd5e1; color: #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
</style>
