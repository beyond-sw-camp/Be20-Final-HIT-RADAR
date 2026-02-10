<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="title">권한(기능) 레지스트리</h2>
      
      <div class="header-actions">
        <button class="btn-primary" @click="openCreateModal">
          <i class="pi pi-plus"></i> 새 권한 등록
        </button>
      </div>
    </div>

    <!-- List Card -->
    <div class="card list-card">
      <table class="data-table">
        <colgroup>
          <col style="width: 80px" />
          <col style="width: 20%" />
          <col style="width: 20%" />
          <col style="width: 25%" />
          <col style="width: 25%" />
          <col style="width: 100px" />
        </colgroup>
        <thead>
          <tr>
            <th class="text-center">ID</th>
            <th>권한 키 (Key)</th>
            <th>권한 명 (Name)</th>
            <th>경로 (Route Path)</th>
            <th>설명</th>
            <th class="text-center">관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && permissions.length === 0">
            <td colspan="6">
              <div class="loading-spinner-container">
                <div class="loading-spinner"></div>
              </div>
            </td>
          </tr>
          <tr 
            v-else 
            v-for="perm in permissions" 
            :key="perm.permId" 
            class="clickable-row" 
            @click="openEditModal(perm)"
          >
            <td class="text-center text-mono text-gray">{{ perm.permId }}</td>
            <td class="text-mono fw-bold text-dark">{{ perm.permKey }}</td>
            <td class="fw-medium">{{ perm.name }}</td>
            <td class="text-mono text-small">{{ perm.routePath || '-' }}</td>
            <td class="text-small text-gray">{{ perm.description || '-' }}</td>
            <td class="text-center" @click.stop>
              <div class="action-buttons">
                <!-- <button class="btn-icon edit" @click="openEditModal(perm)" title="수정">
                  <i class="pi pi-pencil"></i>
                </button> -->
                <button class="btn-icon delete" @click="confirmDelete(perm)" title="삭제">
                  ✕
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && permissions.length === 0">
            <td colspan="6" class="empty-message">등록된 권한이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Component -->
    <AdminPermissionModal
      v-if="showModal"
      :editData="selectedPerm"
      @close="closeModal"
      @submit="handleModalSubmit"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/api/permissionApi'
import AdminPermissionModal from './AdminPermissionModal.vue'

const permissions = ref([])
const showModal = ref(false)
const loading = ref(false)
const selectedPerm = ref(null)

const loadPermissions = async () => {
    loading.value = true
    try {
        const res = await getPermissions()
        permissions.value = res.data?.data || []
    } catch (e) {
        console.error(e)
        // Quiet failure or small toast
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    selectedPerm.value = null
    showModal.value = true
}

const openEditModal = (perm) => {
    selectedPerm.value = perm
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    selectedPerm.value = null
}

const handleModalSubmit = async (formData, isEditMode) => {
    try {
        if (isEditMode) {
            await updatePermission(formData.permId, {
                name: formData.name,
                routePath: formData.routePath,
                description: formData.description
            })
            alert('수정되었습니다.')
        } else {
            await createPermission({
                permKey: formData.permKey,
                name: formData.name,
                routePath: formData.routePath,
                description: formData.description
            })
            alert('등록되었습니다.')
        }
        await loadPermissions()
        closeModal()
    } catch (e) {
        console.error(e)
        // The modal stays open on error
        const msg = e.response?.data?.message || '처리 중 오류가 발생했습니다.'
        alert(msg)
    }
}

const confirmDelete = async (perm) => {
    if(!confirm(`정말 '${perm.name}' 권한을 삭제하시겠습니까?`)) return
    
    try {
        await deletePermission(perm.permId)
        alert('삭제되었습니다.')
        loadPermissions()
    } catch (e) {
        console.error(e)
        alert('삭제 실패: ' + (e.response?.data?.message || '오류 발생'))
    }
}

onMounted(loadPermissions)
</script>

<style scoped>
/* Reusing Admin Common Styles */
.page-container { width: 100%; padding: 0; }

.page-header {
  margin-bottom: 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.title {
  font-size: 24px; font-weight: 800; color: var(--primary);
  letter-spacing: -0.02em; margin: 0; display: inline-block; margin-right: 12px;
}
.subtitle { font-size: 14px; color: #6b7280; font-weight: 500; }

.header-actions { margin-left: auto; }

.btn-primary {
  height: 42px; padding: 0 20px;
  background: #111827; color: white;
  font-size: 14px; font-weight: 600;
  border-radius: 8px; border: none; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background 0.2s;
}
.btn-primary:hover { background: #1f2937; }

.card {
  background: white; border-radius: 16px; 
  border: 1px solid #e5e7eb;
  padding: 0; margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); 
  overflow: hidden;
}

.list-card { min-height: 400px; }

.data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.data-table th {
  background: #f9fafb; padding: 18px 24px; text-align: left;
  font-size: 12px; font-weight: 600; color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}
.text-center { text-align: center !important; }

.data-table td {
  padding: 16px 24px; border-bottom: 1px solid #f1f5f9;
  font-size: 14px; color: #334155; vertical-align: middle;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.clickable-row { 
  cursor: pointer; 
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.4s ease backwards;
}
.clickable-row:hover { 
  background: #f8fafc; 
}

/* Typography variants */
.text-dark { color: #0f172a; }
.text-gray { color: #94a3b8; }
.fw-bold { font-weight: 700; }
.fw-medium { font-weight: 500; }
.text-mono { font-family: monospace; letter-spacing: -0.02em; }
.text-small { font-size: 13px; }

/* Action Buttons */
.action-buttons { display: flex; justify-content: center; gap: 8px; }
.btn-icon {
  width: 28px; height: 28px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: all 0.2s;
  background: transparent; color: #94a3b8; font-size: 14px;
}
.btn-icon:hover { background: #f1f5f9; color: #64748b; }
.btn-icon.delete:hover { background: #fef2f2; color: #ef4444; }

.loading-spinner-container { padding: 60px; display: flex; justify-content: center; }
.loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid #e5e7eb; border-top-color: #3b82f6;
  border-radius: 50%; animation: spin 0.8s linear infinite;
}
.empty-message { text-align: center; padding: 60px; color: #94a3b8; }

@keyframes spin { 100% { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
