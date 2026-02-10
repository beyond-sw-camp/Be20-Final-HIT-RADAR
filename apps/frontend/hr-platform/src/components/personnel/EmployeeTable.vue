<template>
  <div class="table-container">
    <table class="modern-table">
      <colgroup>
        <col style="width: 60px" />
        <col style="width: 100px" />
        <col style="width: 200px" />
        <col style="width: 120px" />
        <col style="width: 100px" />
        <col style="width: 150px" />
        <col style="width: 80px" />
        <col style="width: 150px" />
        <col v-if="isAdmin" style="width: 200px" />
      </colgroup>
      <thead>
        <tr>
          <th></th> <!-- 아바타 -->
          <th>사번</th>
          <th>사 원 정 보</th>
          <th>부 서</th>
          <th>직 위</th>
          <th>역 할</th>
          <th>상 태</th>
          <th>연 락 처</th>
          <th v-if="isAdmin">관 리</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="emp in employees" 
          :key="emp.empId || emp.userId" 
          class="hover-row clickable-row"
          @click="$emit('view', emp)"
        >
          <!-- 아바타 -->
          <td class="text-center">
             <div class="avatar-circle">
               <img v-if="emp.image" :src="resolveFileUrl(emp.image)" alt="Profile" class="profile-img" />
               <i v-else class="pi pi-user"></i>
             </div>
          </td>
          
          <!-- 사번 -->
          <td>
             <span class="emp-no-text">{{ emp.employeeNo || emp.empNo || '-' }}</span>
          </td>

          <!-- 이름 & ID -->
          <td>
            <div class="emp-identity">
              <span class="emp-name">{{ emp.name }}</span>
              <span class="emp-email">{{ emp.email || emp.loginId || '-' }}</span>
            </div>
          </td>

          <!-- 부서 -->
          <td>
            <div class="dept-info">
               <span class="dept-text">
                 {{ emp.department?.deptName || deptMap[emp.deptId] || emp.deptName || '-' }}
               </span>
            </div>
          </td>

          <!-- 직위 -->
          <td>
            <span class="badge position-badge">
              {{ emp.position?.posName || posMap[emp.positionId] || emp.posName || '-' }}
            </span>
          </td>

          <!-- 역할 -->
          <td>
            <div class="roles-tags">
                <span v-for="role in (emp.roles || [])" :key="role" class="role-tag">{{ role }}</span>
                <span v-if="(!emp.roles || emp.roles.length === 0)" class="text-sub">-</span>
            </div>
          </td>

          <!-- 상태 -->
          <td class="text-center">
             <span :class="['status-badge', getStatusClass(emp.employmentType)]">
               {{ getStatusLabel(emp.employmentType) }}
             </span>
          </td>

          <!-- 연락처 -->
          <td>
             <span class="text-sub">{{ emp.phoneNo || emp.phone || '-' }}</span>
          </td>

          <!-- 관리 기능 -->
          <td v-if="isAdmin" class="text-center action-cell" @click.stop>
             <div class="action-buttons centered">
                <!-- 역할 배정 -->
                <button class="btn-action role" @click.stop="$emit('role', emp)" title="역할 부여">
                  <span>역할</span>
                </button>
                <!-- 수정 -->
                <button class="btn-action edit" @click.stop="$emit('edit', emp)">
                  <span>수정</span>
                </button>
                <!-- 삭제 -->
                <button class="btn-action delete" @click.stop="$emit('delete', emp)">
                  <span>삭제</span>
                </button>
             </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { resolveFileUrl } from '@/utils/fileUrl'
defineProps({
  employees: {
    type: Array,
    default: () => []
  },
  deptMap: {
    type: Object,
    default: () => ({})
  },
  posMap: { 
    type: Object,
    default: () => ({})
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['appointment', 'history', 'edit', 'delete', 'view'])

const getStatusClass = (status) => {
  if (status === 'WORKING' || status === '재직') return 'active'
  if (status === 'LEAVE' || status === '휴직') return 'leave'
  if (status === 'RESIGNED' || status === '퇴사') return 'resigned'
  return 'active' // Default to active if unknown
}

const getStatusLabel = (status) => {
  if (status === 'WORKING' || status === '재직') return '재직'
  if (status === 'LEAVE' || status === '휴직') return '휴직'
  if (status === 'RESIGNED' || status === '퇴사') return '퇴사'
  return status || '재직'
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid var(--border);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  padding: 12px 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.modern-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  transition: background 0.2s;
  text-align: center;
}

.hover-row:hover td {
  background: #f8fafc;
}
.clickable-row {
  cursor: pointer;
}

/* 아바타 */
.avatar-circle {
  width: 36px; height: 36px;
  background: #e0e7ff;
  color: #4f46e5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  overflow: hidden;
}

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 사원 정보 */
.emp-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.emp-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.emp-email {
  font-size: 12px;
  color: #94a3b8;
}

.emp-no-text {
  font-family: monospace;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.5px;
}

/* 직위 배지 - 프리미엄 블루 */
.position-badge {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: #e8f3ff;
  color: #3182f6;
  border: 1px solid #dbeafe;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 모던 액션 버튼 스타일 */
.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  line-height: 1;
}
.btn-action span {
  display: inline-block;
  line-height: 1;
}

.btn-action.edit {
  color: #3b82f6;
  background: #eff6ff;
  border-color: #dbeafe;
}
.btn-action.edit:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-action.delete {
  color: #ef4444;
  background: #fef2f2;
  border-color: #fee2e2;
}
.btn-action.delete:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 99px;
}
.status-badge.active { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; } /* Green */
.status-badge.leave { background: #fef9c3; color: #a16207; border: 1px solid #fcf299; } /* Yellow */
.status-badge.resigned { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; } /* Red */

.action-buttons.centered {
  justify-content: center;
  margin-right: 0;
}

.roles-tags { display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; }
.role-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  background: #f1f5f9;
  color: #475569;
  padding: 0 8px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  line-height: 1;
}

.btn-action.role {
  color: #8b5cf6;
  background: #f5f3ff;
  border-color: #ede9fe;
}
.btn-action.role:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

</style>
