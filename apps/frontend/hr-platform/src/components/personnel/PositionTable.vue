<template>
  <div class="table-container">
    <table class="modern-table">
      <colgroup>
        <col style="width: 80px" />
        <col />
        <col v-if="isAdmin" style="width: 160px" />
      </colgroup>
      <thead>
        <tr>
          <th>순위</th>
          <th>직위명</th>
          <th v-if="isAdmin">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pos in positions" :key="pos.positionId" class="hover-row">
          <td class="text-center">
            <div class="rank-badge">{{ pos.rank }}</div>
          </td>
          <td class="text-center">
            <span class="pos-name-text">{{ pos.name }}</span>
          </td>
          <td v-if="isAdmin" class="text-center">
            <div class="action-buttons centered">
              <button class="btn-action edit" @click="$emit('edit', pos)">
                <span>수정</span>
              </button>
              <button class="btn-action delete" @click="$emit('delete', pos.positionId)">
                <span>삭제</span>
              </button>
            </div>
          </td>
        </tr>
        <tr v-if="positions.length === 0">
          <td :colspan="isAdmin ? 3 : 2" class="empty-cell">
            <div class="empty-state">
              <i class="pi pi-inbox"></i>
              <p>등록된 직위가 없습니다.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  positions: {
    type: Array,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

defineEmits(['edit', 'delete'])
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
}

.modern-table th {
  padding: 14px 16px;
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

.modern-table tr:last-child td {
  border-bottom: none;
}

.hover-row:hover td {
  background: #f8fafc;
}

.rank-badge {
  display: inline-flex;
  align-items: center; justify-content: center;
  width: 28px; height: 28px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-weight: 700;
  font-family: monospace;
  font-size: 13px;
}

.pos-name-text {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
.action-buttons.centered {
  justify-content: center;
}

/* Standardized Action Button Styles */
.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
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

.empty-cell {
  text-align: center;
  padding: 80px 0;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #94a3b8;
}
.empty-state i {
  font-size: 40px;
  opacity: 0.5;
}
</style>
