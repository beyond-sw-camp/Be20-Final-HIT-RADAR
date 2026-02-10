<!--TODO: 사번 내 로그인 사번, 부서 내 로그인 부서 -->
<template>
  <section class="goal-create">
    <!-- 헤더 -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">← 뒤로 가기</button>
      <h2>목표 등록</h2>
    </div>

    <BaseCard>
      <div class="form">
        <!-- 기본 정보 -->
        <div class="form-section">
          <h4 class="section-title">기본 정보</h4>
          <div class="field">
            <label>상위 목표</label>
            <select v-model="goalForm.parentGoalId" class="select">
              <option :value="null">없음 (최상위 목표)</option>

              <option v-for="goal in parentGoalOptions" :key="goal.goalId" :value="goal.goalId">
                [{{ depthLabel(goal.depth) }}] {{ goal.title }}
              </option>
            </select>

            <p class="hint">상위 목표를 선택하면 하위 목표(LEVEL_2 이하)로 등록됩니다.</p>
          </div>

          <div class="field">
            <label>목표 유형</label>
            <select
              v-model="goalType"
              class="select"
              :disabled="!!selectedParentGoal"
            >

            <option value="KPI">KPI</option>
              <option value="OKR">OKR</option>
            </select>
          </div>

          <select
            v-model="goalForm.goalScope"
            class="select"
            :disabled="!selectedParentGoal"
          >
            <option value="TEAM">팀</option>
            <option value="PERSONAL">개인</option>
          </select>

          <div class="field">
            <label>목표명</label>
            <input v-model="goalForm.title" placeholder="목표명을 입력하세요(필수)" />
          </div>

          <div class="field">
            <label>설명</label>
            <textarea v-model="goalForm.description" rows="3" placeholder="목표에 대한 설명을 입력하세요(필수)"/>


          </div>

          <div v-if="parentGoalDetail" class="hint">
            상위 목표 기간 :
            {{ parentGoalDetail.startDate }} ~ {{ parentGoalDetail.endDate }}
          </div>

          <div class="field-row">
            <div class="field">
              <label>시작일</label>
              <input type="date" v-model="goalForm.startDate" />
            </div>
            <div class="field">
              <label>종료일</label>
              <input type="date" v-model="goalForm.endDate" />
            </div>
          </div>

          <div class="field">
            <label>부서 선택</label>
            <select v-model="goalForm.departmentId" class="select">
              <option :value="null">부서를 선택하세요</option>
              <option
                v-for="dept in departments"
                :key="dept.deptId"
                :value="dept.deptId"
              >
                {{ dept.deptName }}
              </option>
            </select>
          </div>
        </div>

        <!-- KPI / OKR -->
        <div class="form-section highlight">
          <h4 class="section-title">
            {{ goalType === 'KPI' ? 'KPI 설정' : 'KR 설정' }}
          </h4>

          <template v-if="goalType === 'KPI'">
            <div class="field">
              <label>지표명</label>
              <input v-model="kpiForm.metricName" placeholder="예) 영업 성공 횟수" />
            </div>
            <div class="field-row">
              <div class="field">
                <label>시작값</label>
                <input type="number" v-model="kpiForm.startValue" />
              </div>
              <div class="field">
                <label>목표값</label>
                <input type="number" v-model="kpiForm.targetValue" />
              </div>
            </div>
          </template>

          <template v-else>
            <div class="field">
              <label>KR 내용</label>
              <input v-model="okrForm.content" />
            </div>
            <div class="field">
              <label>지표명</label>
              <input v-model="okrForm.metricName" />
            </div>
            <div class="field">
              <label>목표값</label>
              <input type="number" v-model="okrForm.targetValue" />
            </div>
          </template>
        </div>

        <!-- 액션 -->
        <div class="actions">
          <button class="btn-secondary" @click="goBack">취소</button>
          <button type="button" class="btn-primary" @click="submit">
            저장
          </button>
        </div>
      </div>
    </BaseCard>
  </section>
  <div v-if="toast.show" class="toast">
    {{ toast.message }}
  </div>

</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { createGoal } from '@/api/goalApi'
import { createKpi } from '@/api/kpiApi'
import { createKeyResult } from '@/api/okrApi'
import { onMounted, computed, watch } from 'vue'
import { fetchOrganizationGoals } from '@/api/goalApi'
import { useAuthStore } from '@/stores/authStore'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'

const auth = useAuthStore()


const router = useRouter()

const orgGoals = ref([])

const departments = ref([])
const goalType = ref('KPI')

const goalForm = ref({
  parentGoalId: null,
  goalScope: 'TEAM',
  goalType: '',
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  departmentId: null,
  ownerId: null,
})

const kpiForm = ref({
  metricName: '',
  startValue: null,
  targetValue: null,
})

const okrForm = ref({
  content: '',
  metricName: '',
  targetValue: null,
})

const goBack = () => router.back()
const selectedParentGoal = computed(() => {
  if (!goalForm.value.parentGoalId) return null

  return flattenGoals(orgGoals.value).find(
    g => g.goalId === goalForm.value.parentGoalId
  )
})
import { fetchGoalDetail } from '@/api/goalApi'

const parentGoalDetail = ref(null)


watch(
  () => goalForm.value.parentGoalId,
  async (parentGoalId) => {
    if (!parentGoalId) {
      parentGoalDetail.value = null
      goalForm.value.goalScope = 'TEAM'
      return
    }

    const res = await fetchGoalDetail(parentGoalId)

    parentGoalDetail.value = res.data

    // LEVEL_1이면 무조건 TEAM
    if (parentGoalDetail.value.depth === 'LEVEL_1') {
      goalForm.value.goalScope = 'TEAM'
    }
  }
)

watch(goalType, () => {
  kpiForm.value = {
    metricName: '',
    startValue: null,
    targetValue: null,
  }

  okrForm.value = {
    content: '',
    metricName: '',
    targetValue: null,
  }
})
/** 트리 → 평탄화 */
const flattenGoals = (goals, acc = []) => {
  for (const goal of goals) {
    acc.push(goal)
    if (goal.children && goal.children.length) {
      flattenGoals(goal.children, acc)
    }
  }
  return acc
}

/** 상위 목표 후보 */
const parentGoalOptions = computed(() => {
  return flattenGoals(orgGoals.value)
    .filter((goal) => goal.depth === 'LEVEL_1' || goal.depth === 'LEVEL_2')
    .map((goal) => ({
      goalId: goal.goalId,
      title: goal.title,
      depth: goal.depth,
      startDate: goal.startDate,
      endDate: goal.endDate,
    }))
})
const depthLabel = (depth) => {
  switch (depth) {
    case 'LEVEL_1':
      return '상위 목표'
    case 'LEVEL_2':
      return '중위 목표'
    case 'LEVEL_3':
      return '하위 목표'
    default:
      return ''
  }
}

const toast = ref({
  show: false,
  message: '',
})

const showToast = (message) => {
  toast.value.message = message
  toast.value.show = true
  setTimeout(() => {
    toast.value.show = false
  }, 2500)
}


onMounted(async () => {
  const goalRes = await fetchOrganizationGoals()
  orgGoals.value = goalRes.data.data

  const deptRes = await getAllDepartmentsByCompany(auth.user.companyId)
  departments.value = deptRes.data.data.departments
})


const validateGoal = () => {
  const { startDate, endDate } = goalForm.value

  if (!goalForm.value.title?.trim()) {
    return '목표명을 입력하세요'
  }

  if (!startDate || !endDate) {
    return '목표 기간을 입력하세요'
  }

  //  시작일 > 종료일
  if (startDate > endDate) {
    return '시작일은 종료일보다 늦을 수 없습니다'
  }

  // 상위 목표 기간 체크
  if (parentGoalDetail.value) {
    const parent = parentGoalDetail.value

    if (
      startDate < parent.startDate ||
      endDate > parent.endDate
    ) {
      return `상위 목표 기간(${parent.startDate} ~ ${parent.endDate})을 벗어날 수 없습니다`
    }
  }

  if (!goalForm.value.departmentId) {
    return '부서 ID를 입력하세요'
  }

  return null
}


const validateKpi = () => {
  if (!kpiForm.value.metricName?.trim()) {
    return 'KPI 지표명을 입력하세요'
  }
  if (kpiForm.value.startValue === null) {
    return 'KPI 시작값을 입력하세요'
  }
  if (kpiForm.value.targetValue === null) {
    return 'KPI 목표값을 입력하세요'
  }
  return null
}

const validateOkr = () => {
  if (!okrForm.value.content?.trim()) {
    return 'KR 내용을 입력하세요'
  }
  if (!okrForm.value.metricName?.trim()) {
    return '지표명을 입력하세요'
  }
  if (okrForm.value.targetValue === null) {
    return '목표값을 입력하세요'
  }
  return null
}

const submit = async () => {
  const requiredError = validateAllRequiredFields()
  if (requiredError) {
    showToast(requiredError)
    return
  }

  const goalError = validateGoal()
  if (goalError) {
    showToast(goalError)
    return
  }

  if (goalType.value === 'KPI') {
    const kpiError = validateKpi()
    if (kpiError) {
      showToast(kpiError)
      return
    }
  } else {
    const okrError = validateOkr()
    if (okrError) {
      showToast(okrError)
      return
    }
  }

  const payload = {
    ...goalForm.value,
    goalType: goalType.value,
    ownerId: auth.user.employeeId,
  }

  if (!payload.parentGoalId) {
    delete payload.parentGoalId
  }

  const res = await createGoal(payload)
  const goalId = res.data.data ?? res.data.goalId

  if (goalType.value === 'KPI') {
    await createKpi(goalId, kpiForm.value)
  } else {
    await createKeyResult(goalId, {
      content: okrForm.value.content,
      metricName: okrForm.value.metricName,
      targetValue: Number(okrForm.value.targetValue),
    })
  }
  router.push(`/goal/${goalId}`)
}

const validateAllRequiredFields = () => {
  const {
    title,
    description,
    startDate,
    endDate,
    departmentId,
  } = goalForm.value

  // goal 공통 필수값
  if (
    !title?.trim() ||
    !description?.trim() ||
    !startDate ||
    !endDate ||
    !departmentId
  ) {
    return '모든 필수 항목을 입력해주세요'
  }

  // KPI 필수값
  if (goalType.value === 'KPI') {
    if (
      !kpiForm.value.metricName?.trim() ||
      kpiForm.value.startValue === null ||
      kpiForm.value.targetValue === null
    ) {
      return '모든 필수 항목을 입력해주세요'
    }
  }

  // OKR 필수값
  if (goalType.value === 'OKR') {
    const value = okrForm.value.targetValue

    if (
      !okrForm.value.content ||
      !okrForm.value.content.trim() ||
      !okrForm.value.metricName ||
      !okrForm.value.metricName.trim() ||
      value === null ||
      value === '' ||
      Number.isNaN(Number(value))
    ) {
      return '모든 필수 항목을 입력해주세요'
    }
  }

  return null
}


</script>

<style>
/* ===== Page ===== */
.goal-create {
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}

/* ===== Header ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.page-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* ===== Back ===== */
.btn-back {
  background: #eef2ff;
  border: none;
  color: #4338ca;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.btn-back:hover {
  background: #e0e7ff;
}

/* ===== Card / Form ===== */
.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  background: #ffffff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* KPI / OKR 강조 */
.form-section.highlight {
  background: linear-gradient(180deg, #eef2ff, #ffffff);
  border: 1px solid #e0e7ff;
}

/* ===== Section title ===== */
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #4338ca;
  margin-bottom: 4px;
}

/* ===== Fields ===== */
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

.field input,
.field textarea,
.select {
  height: 40px;
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #fff;
  transition: all 0.15s ease;
}

.field textarea {
  height: auto;
  min-height: 80px;
  max-height: 140px;
  resize: vertical;
}

.field input:focus,
.field textarea:focus,
.select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* ===== Field Row ===== */
.field-row {
  display: flex;
  gap: 10px;
}

.field-row .field {
  flex: 1;
}

/* ===== Actions ===== */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.btn-secondary {
  padding: 8px 14px;
  font-size: 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 10px;
  border: none;
  color: #ffffff;
  background: #4f46e5;
  cursor: pointer;
}

.btn-primary:hover {
  background: #4338ca;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);

  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(6px);
  color: #ffffff;

  padding: 14px 22px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;

  z-index: 200;
  animation: toastUp 0.25s ease-out;
}


@keyframes toastUp {
  from {
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}




</style>
