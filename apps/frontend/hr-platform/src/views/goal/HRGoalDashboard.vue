<template>
  <section>
    <!-- 헤더 -->
    <div class="section-title">
      <div>
        <h1>목표 관리</h1>
        <div class="sub">조직별 KPI / OKR 현황 조회</div>
      </div>

      <button class="btn-create" @click="goCreateGoal">
        + 목표 등록
      </button>
    </div>

    <!-- 탭 -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'selected' }"
        @click="changeTab('selected')"
      >
        선택한 조직 목표
      </button>

      <button
        class="tab"
        :class="{ active: activeTab === 'myDept' }"
        @click="changeTab('myDept')"
      >
        내 소속 조직 목표
      </button>

      <button
        class="tab"
        :class="{ active: activeTab === 'me' }"
        @click="changeTab('me')"
      >
        내 목표
      </button>
    </div>

    <!--  검색 / 필터 -->
    <div class="toolbar">
      <!-- 조직 선택 -->
      <select
        v-if="activeTab === 'selected'"
        v-model="selectedDeptId"
        class="select dept"
        @change="onDeptChange"
      >
        <option value="">조직 전체</option>
        <option
          v-for="dept in departments"
          :key="dept.id"
          :value="dept.id"
        >
          {{ dept.name }}
        </option>
      </select>


      <!-- 제목 검색 -->
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

    <!-- Goal Tree -->
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
import BaseCard from '@/components/common/BaseCard.vue'
import GoalTree from '@/views/goal/GoalTree.vue'
import { getAllDepartmentsByCompany } from '@/api/departmentApi.js'
import {
  fetchOrganizationGoals,
  fetchMyGoals,
  fetchDepartmentGoals,
} from '@/api/goalApi.js'
/*==== 부서 =====*/
const departments = ref([])

const loadDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany()
    departments.value = res.data.data.departments
      .filter(d => d.isDeleted === 'N') // 안전하게
      .map(d => ({
        id: d.deptId,
        name: d.deptName,
      }))
  } catch (e) {
    console.error('부서 조회 실패', e)
  }
}
/* ===== 탭 상태 ===== */
const activeTab = ref('myDept') // selected | myDept | me

/* ===== 데이터 ===== */
const goals = ref([])
const selectedDeptId = ref('')

/* ===== 필터 상태 ===== */
const keyword = ref('')
const statusFilter = ref('ALL') // ALL | APPROVED | SUBMITTED | REJECTED | DRAFT
const typeFilter = ref('ALL')   // ALL | KPI | OKR


/* ===== 조회 ===== */
const loadGoals = async () => {
  let res

  if (activeTab.value === 'selected') {
    if (!selectedDeptId.value) {
      goals.value = []
      return
    }
    res = await fetchDepartmentGoals(selectedDeptId.value)
  }

  if (activeTab.value === 'myDept') {
    res = await fetchOrganizationGoals()
  }

  if (activeTab.value === 'me') {
    res = await fetchMyGoals()
  }

  goals.value = res?.data?.data ?? []
}

/* ===== 탭 변경 ===== */
const changeTab = async (tab) => {
  activeTab.value = tab
  await loadGoals()
}

/* ===== 조직 변경 ===== */
const onDeptChange = async () => {
  activeTab.value = 'selected'
  await loadGoals()
}

/* =====  Tree 필터 핵심 로직 ===== */
const filterGoalTree = (goal) => {
  const matchTitle =
    !keyword.value ||
    goal.title.toLowerCase().includes(keyword.value.toLowerCase())

  const matchStatus =
    statusFilter.value === 'ALL' ||
    goal.approveStatus === statusFilter.value

  const matchType =
    typeFilter.value === 'ALL' ||
    goal.type === typeFilter.value

  const filteredChildren = (goal.children || [])
    .map(filterGoalTree)
    .filter(Boolean)

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

/* ===== 렌더링용 ===== */
const filteredGoals = computed(() =>
  goals.value
    .map(filterGoalTree)
    .filter(Boolean)
)

onMounted(async () => {
  await loadDepartments()
  await loadGoals()
})

import { useRouter } from 'vue-router'

const router = useRouter()

const goCreateGoal = () => {
  router.push('/goal/create')
}

</script>

<style scoped>
/* 필터 */
/* 조직 필터 */
.filter-card {
  margin-bottom: 12px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filters select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.hint {
  font-size: 12px;
  color: #6b7280;
}

/* 탭 */
.tabs {
  display: flex;
  gap: 8px;
  margin: 16px 0;
}

.tab {
  padding: 6px 16px;
  font-size: 13px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: white;
  cursor: pointer;
}

.tab.active {
  background: #2563EB;
  color: white;
  border-color: #2563EB;
}

/* 헤더 */
.goal-hd {
  display: grid;
  grid-template-columns: 1fr 90px 120px 100px 220px;
  font-size: 13px;
  color: #6b7280;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

/* 공통 select */
.select {
  height: 32px;
  font-size: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
}

/* 조직 선택 전용 */
.select.dept {
  min-width: 100px;
  font-weight: 500;
}

/* 검색 */
.search {
  flex: 1;
  max-width: 1400px;   /* ← 더 크게 */
  min-width: 480px;    /* ← 너무 작아지지 않게 */
  padding: 5px 14px;  /* 살짝 여유 */
  font-size: 14px;     /* 가독성 ↑ */
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-create:hover {
  background: #1d4ed8;
}


</style>
