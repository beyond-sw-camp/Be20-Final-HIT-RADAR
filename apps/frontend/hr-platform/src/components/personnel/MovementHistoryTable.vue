<template>
  <div class="card">
    <div class="card-bd no-padding">
      <table class="table">
        <thead>
          <tr>
            <th style="width: 130px">시행일자</th>
            <th v-if="showEmployeeCol" style="width: 120px">사원</th>
            <th style="width: 150px">발령사유</th>
            <th>부서 (변경 전 > 후)</th>
            <th>직위 (변경 전 > 후)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in histories" :key="h.movementId">
            <td><span class="date-val">{{ h.effectiveDate }}</span></td>
            
            <td v-if="showEmployeeCol">
              <div class="emp-info">
                <span class="emp-name">{{ h.empName || 'Unknown' }}</span>
              </div>
            </td>

            <td><span class="reason-val">{{ h.eventReason || '-' }}</span></td>
            <td>
              <div class="change-flow">
                <span class="old">{{ getDeptName(h.fromDeptId) }}</span>
                <i class="pi pi-arrow-right arrow"></i>
                <span class="new">{{ getDeptName(h.toDeptId) }}</span>
              </div>
            </td>
            <td>
              <div class="change-flow">
                <span class="old">{{ getPosName(h.fromPositionId) }}</span>
                <i class="pi pi-arrow-right arrow"></i>
                <span class="new">{{ getPosName(h.toPositionId) }}</span>
              </div>
            </td>
          </tr>
          <tr v-if="histories.length === 0">
            <td :colspan="showEmployeeCol ? 5 : 4" class="text-center py-12">
              <div class="empty-msg">이전 발령 이력이 존재하지 않습니다.</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  histories: { type: Array, default: () => [] },
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] },
  showEmployeeCol: { type: Boolean, default: false } // New Prop
})

const getDeptName = (id) => {
  if (!id) return '-'
  const d = props.departments.find(x => x.deptId === id)
  return d ? d.deptName : `Dept(${id})`
}

const getPosName = (id) => {
  if (!id) return '-'
  const g = props.positions.find(x => x.positionId === id)
  return g ? g.name : `Pos(${id})`
}
</script>

<style scoped>
/* Refined Styles for better visual integration */
.card-bd { padding: 0 !important; }

/* Table Header - Soft Gray Background */
.table thead th {
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 13px;
}

/* Table Body */
.table tbody td {
  padding: 16px;
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
}

/* Hover Effect */
.table tbody tr:hover {
  background-color: #f8fafc; /* Very subtle hover */
}

.date-val { font-family: var(--font-mono, monospace); color: #94a3b8; font-size: 13px; font-weight: 500;}
.reason-val { 
  display: inline-block;
  padding: 4px 10px;
  background: #f1f5f9;
  border-radius: 6px;
  font-weight: 700; color: #475569; font-size: 12px; 
}

.emp-info { display: flex; align-items: center; gap: 10px; }
.emp-name { font-weight: 700; color: #334155; font-size: 14px; }
.emp-id { font-size: 11px; color: #94a3b8; }

.change-flow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.old { color: #94a3b8; font-weight: 500; text-decoration: line-through; } /* Strikethrough for old value */
.new { color: #2563eb; font-weight: 700; }
.arrow { font-size: 12px; color: #cbd5e1; }

.text-center { text-align: center; }
.py-12 { padding: 80px 0; }
.empty-msg { color: #94a3b8; font-size: 15px; }
</style>
