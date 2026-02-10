<!-- GoalListView.vue -->
<template>
  <section>
    <!-- 타이틀 + 탭 -->
    <div class="section-title">
      <div>
        <h1>목표 관리</h1>
        <div class="sub">
          {{ activeTab === 'org' ? '조직 전체 목표' : '내 목표' }}
        </div>
      </div>

      <button class="btn-create" @click="goCreateGoal">
        + 목표 등록
      </button>
    </div>

    <!-- 탭 -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'org' }"
        @click="changeTab('org')"
      >
        조직 목표
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'me' }"
        @click="changeTab('me')"
      >
        내 목표
      </button>
    </div>

    <!-- 🔍 검색 / 필터 -->
    <div class="toolbar">
      <!-- 검색 -->
      <input
        v-model="keyword"
        class="search"
        placeholder="목표 제목 검색"
      />

      <!-- 상태 필터 -->
      <select v-model="statusFilter" class="select">
        <option value="ALL">전체 상태</option>
        <option value="APPROVED">승인</option>
        <option value="SUBMITTED">제출</option>
        <option value="REJECTED">반려</option>
        <option value="DRAFT">작성중</option>
      </select>

      <!-- 유형 필터 -->
      <select v-model="typeFilter" class="select">
        <option value="ALL">전체 유형</option>
        <option value="KPI">KPI만</option>
        <option value="OKR">OKR만</option>
      </select>
    </div>

    <!-- 리스트 -->
    <BaseCard>
      <div class="card-hd goal-hd">
        <span>목표명</span>
        <span>유형</span>
        <span>담당자</span>
        <span>상태</span>
        <span>진행률</span>
      </div>

      <div class="card-bd">
        <GoalTree :goals="filteredGoals" />
      </div>
    </BaseCard>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import GoalTree from './GoalTree.vue'
import {
  fetchOrganizationGoals,
  fetchMyGoals,
} from '@/api/goalApi'

//목표 생성
const router = useRouter()
const goCreateGoal = () => {
  router.push('/goal/create')
}
/* ===== 상태 ===== */
const goals = ref([])
const activeTab = ref('org') // 'org' | 'me'

const keyword = ref('')
const statusFilter = ref('ALL') // ALL | APPROVED | SUBMITTED | REJECTED | DRAFT
const typeFilter = ref('ALL')   // ALL | KPI | OKR

/* ===== 데이터 로딩 ===== */
const loadGoals = async () => {
  const res =
    activeTab.value === 'org'
      ? await fetchOrganizationGoals()
      : await fetchMyGoals()

  goals.value = res.data.data
}

const changeTab = async (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  goals.value = []
  await loadGoals()
}

const filterGoalTree = (goal) => {
  /* 제목 검색 */
  const matchTitle =
    !keyword.value ||
    goal.title.toLowerCase().includes(keyword.value.toLowerCase())

  /* 상태 필터 */
  const matchStatus =
    statusFilter.value === 'ALL' ||
    goal.approveStatus === statusFilter.value

  /* 유형 필터 */
  const matchType =
    typeFilter.value === 'ALL' ||
    goal.type === typeFilter.value

  /* 자식 재귀 필터 */
  const filteredChildren = (goal.children || [])
    .map(filterGoalTree)
    .filter(Boolean)

  /* 본인 or 자식 중 하나라도 통과하면 노출 */
  if (
    (matchTitle && matchStatus && matchType) ||
    filteredChildren.length
  ) {
    return {
      ...goal,
      children: filteredChildren,
    }
  }

  return null
}

/* ===== 최종 렌더링용 목표 ===== */
const filteredGoals = computed(() =>
  goals.value
    .map(filterGoalTree)
    .filter(Boolean)
)

onMounted(() => {
  console.log('GoalListView mounted')
  loadGoals()
})
</script>

<style scoped>
/* ===== Header ===== */
.goal-hd {
  display: grid;
  grid-template-columns: 1fr 90px 120px 100px 220px;
  font-size: 13px;
  color: #6b7280;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-create {
  padding: 8px 16px;
  border-radius: 10px;
  background: #2563EB;
  color: #fff;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.btn-create:hover {
  background: #1d4ed8;
}


/* ===== Tabs ===== */
.tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0 12px;
}

.tab {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: #374151;
  cursor: pointer;
}

.tab.active {
  background: #2563EB;
  color: #ffffff;
  border-color: #2563EB;
}

/* ===== Toolbar ===== */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.search {
  width: 5000px;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.search:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.select {
  padding: 8px 10px;
  font-size: 13px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
}

.select:focus {
  outline: none;
  border-color: #2563EB;
}
</style>
