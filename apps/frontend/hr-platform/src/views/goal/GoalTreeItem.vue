<!-- GoalTreeItem.vue -->
<template>
  <div>
    <!-- Goal Row -->
    <div class="row" :class="`level-${level}`">
      <!-- 제목 -->
      <div class="cell title" @click="toggle">
        <span v-if="hasChildren" class="chevron">
          {{ isOpen ? '▼' : '▶' }}
        </span>
        {{ goal.title }}
      </div>

      <!-- 유형 -->
      <div class="cell type">
        <span class="type-badge">{{ goal.type }}</span>
      </div>

      <!-- 담당자 -->
      <div class="cell owner">
        {{ ownerName }}
      </div>

      <!-- 상태 -->
      <div class="cell">
        <span :class="['status', goal.approveStatus.toLowerCase()]">
          {{ statusLabel }}
        </span>
      </div>

      <!-- 진행률 + 상세 -->
      <div class="cell progress">
        <div class="progress-info">
          <div class="bar">
            <div
              class="fill"
              :style="{ width: goal.progressRate + '%' }"
            />
          </div>
          <span class="percent">{{ goal.progressRate }}%</span>
        </div>

        <button class="btn-detail" @click.stop="goDetail">
          상세보기
        </button>
      </div>
    </div>

    <!-- KPI 목록 -->
    <div v-if="goal.kpis?.length" class="sub-items">
      <div
        v-for="kpi in goal.kpis"
        :key="kpi.kpiId"
        class="sub-item"
      >
        <div class="sub-left">
          <span class="dot kpi" />
          <span class="sub-title">
            {{ kpi.metricName }}
            <span class="sub-metric">
              {{ kpi.currentValue }} / {{ kpi.targetValue }}
              ({{ Math.round(kpi.progressRate) }}%)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- OKR 목록 -->
    <div v-if="goal.okrs?.length" class="sub-items">
      <div
        v-for="okr in goal.okrs"
        :key="okr.keyResultId"
        class="sub-item"
      >
        <div class="sub-left">
          <span class="dot okr" />
          <span class="sub-title">
            {{ okr.content }}
            <span class="sub-metric">
              {{ okr.currentValue }} / {{ okr.targetValue }}
              ({{ okr.progressRate }}%)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Children -->
    <div v-if="isOpen && hasChildren">
      <GoalTreeItem
        v-for="child in goal.children"
        :key="child.goalId"
        :goal="child"
        :level="level + 1"
        :from="from"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import GoalTreeItem from './GoalTreeItem.vue'

/* ===== Props ===== */
const props = defineProps({
  goal: {
    type: Object,
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  /**
   * 어디서 왔는지 (선택)
   * ex) 'teamOwner'
   */
  from: {
    type: String,
    default: null,
  },
})

const router = useRouter()

/* 담당자 (임시) */
const ownerName = computed(() =>
  props.goal.ownerName || `사번 ${props.goal.ownerId}`
)
/* 상태 한글 */
const STATUS_LABEL_MAP = {
  APPROVED: '승인',
  SUBMITTED: '제출됨',
  REJECTED: '반려',
  DRAFT: '작성중',
}

const statusLabel = computed(
  () => STATUS_LABEL_MAP[props.goal.approveStatus] ?? props.goal.approveStatus
)

/* 트리 상태 */
const isOpen = ref(props.level === 1)
const hasChildren = computed(() => props.goal.children?.length)

const toggle = () => {
  if (hasChildren.value) isOpen.value = !isOpen.value
}

/* ===== 상세 이동 ===== */
const goDetail = () => {
  if (props.from === 'teamOwner') {
    router.push({
      path: `/goal/${props.goal.goalId}`,
      query: { from: 'teamOwner' },
    })
  } else {
    router.push(`/goal/${props.goal.goalId}`)
  }
}
</script>

<style scoped>
/* ===== Row ===== */
.row {
  display: grid;
  grid-template-columns: 1fr 90px 120px 100px 220px;
  align-items: center;
  padding: 12px 8px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  background: #ffffff;
}

.row:hover {
  background: #f9fafb;
}

/* 들여쓰기 */
.level-1 .title { padding-left: 4px; font-weight: 600; }
.level-2 .title { padding-left: 28px; font-weight: 600; }
.level-3 .title { padding-left: 52px; font-weight: 600; }

/* 셀 */
.cell {
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 제목 */
.title {
  display: flex;
  align-items: center;
}

/* 토글 */
.chevron {
  margin-right: 6px;
  color: #9ca3af;
  cursor: pointer;
}

/* 타입 */
.type-badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
}

/* 상태 */
.status { font-weight: 500; }
.status.approved { color: #16a34a; }
.status.submitted { color: #0284c7; }
.status.draft { color: #ca8a04; }
.status.rejected { color: #dc2626; }

/* ===== Progress ===== */
.progress {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 80px;
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
}

.fill {
  height: 100%;
  background: #6366f1;
}

.percent {
  font-size: 12px;
  color: #4b5563;
}

/* ===== Buttons ===== */
.btn-detail {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 8px;
  border: 1px solid #2563EB;
  background-color: #2563EB;
  color: #FFFFFF;
  cursor: pointer;
}

.btn-detail:hover {
  opacity: 0.9;
}

/* ===== KPI / OKR ===== */
.sub-items {
  margin-left: 48px;
  padding: 6px 0 6px 24px;
  font-size: 13px;
}

.sub-item {
  display: grid;
  grid-template-columns: 1fr 220px;
  align-items: center;
  padding: 6px 0;
}

.sub-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.dot.kpi { background: #6366f1; }
.dot.okr { background: #10b981; }

.sub-title {
  color: #374151;
}

.sub-metric {
  margin-left: 6px;
  font-size: 12px;
  color: #6b7280;
}
</style>
