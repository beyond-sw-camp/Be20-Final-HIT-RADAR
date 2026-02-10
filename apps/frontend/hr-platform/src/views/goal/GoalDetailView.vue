<!--GoalDetailView-->

<template>
  <section class="goal-detail">

    <div class="layout">

      <!-- ================= LEFT ================= -->
      <BaseCard class="goal-card">
        <!-- Back Button -->
        <button class="btn-back" @click="goBack">
          ← 뒤로 가기
        </button>

        <!-- Header -->
        <div class="goal-header">

          <!-- LEFT: title/meta + actions -->
          <div class="goal-left">
            <div class="goal-title-row">
              <h2 class="goal-title">{{ goal.title }}</h2>
            </div>

            <div class="goal-meta">
              <span class="pill">
  {{ scopeLabel[goal.scope] || goal.scope }}
</span>
              <span class="pill success">
                {{ statusLabel[goal.approveStatus] || goal.approveStatus }}
              </span>
            </div>

            <div
              v-if="goal.approveStatus === 'REJECTED' && goal.rejectReason"
              class="reject-banner"
            >
              <strong>반려 사유</strong>
              <p>{{ goal.rejectReason }}</p>
            </div>
          </div>

          <!-- Progress Circle -->
          <div class="progress-circle">
            <svg viewBox="0 0 36 36">
              <path
                class="bg"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="progress"
                :stroke-dasharray="goal.progressRate + ', 100'"
                d="M18 2.0845
                   a 15.9155 15.9155 0 0 1 0 31.831
                   a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="rate">{{ goal.progressRate }}%</div>
          </div>
        </div>

        <!-- Info -->
        <div class="info-grid">
          <div>
            <label>기간</label>
            <p>{{ goal.startDate }} ~ {{ goal.endDate }}</p>
          </div>
          <div>
            <label>부서</label>
            <p>Department #{{ goal.departmentId }}</p>
          </div>
          <div class="full">
            <label>설명</label>
            <p>{{ goal.description }}</p>
          </div>
        </div>

        <hr />

        <div class="section-header">
          <h4 class="section-title">
            {{ goal.type === 'KPI' ? 'KPI 목록' : 'OKR 목록' }}
          </h4>

          <button
            v-if="goal.approveStatus !== 'APPROVED'"
            class="btn-add"
            @click="openCreateModal"
          >
            + {{ goal.type === 'KPI' ? 'KPI 추가' : 'KR 추가' }}
          </button>
        </div>


        <!-- ================= KPI LIST ================= -->
        <template v-if="goal.type === 'KPI'">

          <div class="kpi-list">
            <div
              v-for="kpi in items"
              :key="kpi.kpiId"
              class="kpi-item"
              :class="{ active: selectedItem?.kpiId === kpi.kpiId }"
              @click="selectKpi(kpi)"
            >
              <div class="kpi-head">
                <span>{{ kpi.metricName }}</span>
                <span class="kpi-rate">
                  {{ Math.round(kpi.progressRate) }}%
                </span>
              </div>

              <div class="bar">
                <div
                  class="fill"
                  :style="{ width: kpi.progressRate + '%' }"
                />
              </div>

              <div class="kpi-meta">
                {{ kpi.currentValue }} / {{ kpi.targetValue }}
              </div>
            </div>
          </div>
        </template>

        <!-- ================= OKR LIST ================= -->
        <template v-else>

          <div class="kpi-list">
            <div
              v-for="okr in items"
              :key="okr.keyResultId"
              class="kpi-item"
              :class="{ active: selectedItem?.keyResultId === okr.keyResultId }"
              @click="selectOkr(okr)"
            >
              <div class="kpi-head">
                <span>{{ okr.content }}</span>
                <span class="kpi-rate">{{ okr.progressRate }}%</span>
              </div>

              <div class="bar">
                <div
                  class="fill"
                  :style="{ width: okr.progressRate + '%' }"
                />
              </div>

              <div class="kpi-meta">
                {{ okr.currentValue }} / {{ okr.targetValue }}
              </div>
            </div>
          </div>
        </template>

        <div v-if="canEdit" class="goal-actions">
          <button class="btn-edit" @click="openEditModal">
            수정
          </button>
          <button class="btn-delete" @click="openDeleteModal">
            삭제
          </button>
          <div v-if="canSubmit" class="goal-actions">
            <button class="btn-submit" @click="submitGoalAction">
              제출
            </button>
          </div>

        </div>
        <!-- ===== 승인 / 반려 액션 영역 ===== -->
        <div v-if="canDecide" class="decision-footer">
          <button class="btn-reject" @click="openRejectModal">
            반려
          </button>
          <button class="btn-approve" @click="openApproveModal">
            승인
          </button>
        </div>

      </BaseCard>

      <!-- ================= RIGHT ================= -->
      <BaseCard class="detail-card">
        <h4 class="section-title">
          {{ goal.type === 'KPI' ? 'KPI 상세' : 'OKR 상세' }}

          <button
            v-if="selectedItem && goal.approveStatus === 'APPROVED' && isOwner"
            class="btn-record"
            @click="openModal"
          >
            성과 기록
          </button>

        </h4>

        <!-- KPI DETAIL -->
        <div v-if="goal.type === 'KPI' && selectedItem">
          <h3>{{ selectedItem.metricName }}</h3>

          <div class="bar lg">
            <div
              class="fill"
              :style="{ width: selectedItem.progressRate + '%' }"
            />
          </div>

          <p class="muted">
            {{ selectedItem.currentValue }} / {{ selectedItem.targetValue }}
          </p>

          <h5>성과 입력 내역</h5>

          <table>
            <thead>
            <tr>
              <th>날짜</th>
              <th>입력</th>
              <th>누적</th>
              <th>진척</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="log in selectedItem.logs" :key="log.logDate">
              <td>{{ log.logDate }}</td>
              <td>+{{ log.inputValue }}</td>
              <td>{{ log.cumulativeValue }}</td>
              <td>{{ Math.round(log.progressRate) }}%</td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- OKR DETAIL -->
        <div v-if="goal.type === 'OKR' && selectedItem">
          <h3>{{ selectedItem.content }}</h3>

          <div class="bar lg">
            <div
              class="fill"
              :style="{ width: selectedItem.progressRate + '%' }"
            />
          </div>

          <p class="muted">
            {{ selectedItem.currentValue }} / {{ selectedItem.targetValue }}
          </p>

          <h5>진행 로그</h5>

          <table>
            <thead>
            <tr>
              <th>날짜</th>
              <th>진행</th>
              <th>진척</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="log in selectedItem.logs" :key="log.logDate">
              <td>{{ log.logDate }}</td>
              <td>{{ log.currentProgress }}</td>
              <td>{{ log.progressRate }}%</td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-if="!selectedItem" class="empty">
          항목을 선택해주세요
        </div>
      </BaseCard>
    </div>
  </section>

  <Teleport to="body">
  <!-- ===== 성과 입력 모달 ===== -->
  <div v-if="showModal" class="modal-backdrop">
    <div class="modal">

      <!-- Header -->
      <div class="modal-header">
        <div>
          <h3>성과 기록</h3>
          <p class="subtitle">
            {{ goal.type === 'KPI'
            ? selectedItem.metricName
            : selectedItem.content }}
          </p>
        </div>

        <button class="btn-close" @click="closeModal">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="field">
          <label>기준 날짜</label>
          <input type="date" v-model="form.logDate" />
        </div>

        <div class="field">
          <label>
            {{ goal.type === 'KPI' ? '성과 증가 값' : '현재 진행 값' }}
          </label>
          <input
            type="number"
            v-model="form.value"
            :placeholder="
            goal.type === 'KPI'
              ? '예: +10'
              : '예: 현재 누적 70'
          "
          />
        </div>

        <div class="hint">
          {{ goal.type === 'KPI'
          ? '입력한 값은 기존 값에 누적됩니다.'
          : '현재 기준 진행도를 입력해주세요.' }}
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="btn-secondary" @click="closeModal">
          취소
        </button>
        <button class="btn-primary" @click="submitProgress">
          저장
        </button>
      </div>
    </div>
  </div>

  <!-- ===== KPI / OKR 추가 모달 ===== -->
  <div v-if="showCreateModal" class="modal-backdrop">
    <div class="modal">

      <div class="modal-header">
        <h3>{{ goal.type === 'KPI' ? 'KPI 추가' : 'KR 추가' }}</h3>
        <button class="btn-close" @click="closeCreateModal">✕</button>
      </div>

      <div class="modal-body">
        <div class="field">
          <label>지표명</label>
          <input v-model="createForm.metricName" />
        </div>

        <div class="field" v-if="goal.type === 'OKR'">
          <label>KR 내용</label>
          <input v-model="createForm.content" />
        </div>

        <div class="field" v-if="goal.type === 'KPI'">
          <label>시작값</label>
          <input type="number" v-model="createForm.startValue" />
        </div>

        <div class="field">
          <label>목표값</label>
          <input type="number" v-model="createForm.targetValue" />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeCreateModal">취소</button>
        <button class="btn-primary" @click="submitCreate">
          등록
        </button>
      </div>
    </div>
  </div>
<!--반려 사유 입력 모달-->
  <div v-if="showRejectModal" class="modal-backdrop">
    <div class="modal decision-modal reject">

      <div class="modal-header decision-header reject">
        <h3>반려 사유 입력</h3>
        <button class="btn-close" @click="closeRejectModal">✕</button>
      </div>

      <div class="modal-body">
        <p class="decision-desc">
          목표가 반려됩니다. 사유를 명확히 작성해주세요.
        </p>

        <textarea
          v-model="rejectReason"
          rows="3"
          class="reject-textarea"
          :class="{ error: rejectError }"
        />

        <p v-if="rejectError" class="reject-error">
          반려 사유를 입력하세요
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeRejectModal">취소</button>
        <button class="btn-danger" @click="rejectGoalAction">반려</button>
      </div>
    </div>
  </div>

  <!--승인 확인 모달-->
  <div v-if="showApproveModal" class="modal-backdrop">
    <div class="modal decision-modal approve">

      <div class="modal-header decision-header approve">
        <h3>목표 승인</h3>
      </div>

      <div class="modal-body approve-body">
        <div class="approve-icon">✔</div>
        <p>해당 목표를 승인하시겠습니까?</p>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeApproveModal">취소</button>
        <button class="btn-success" @click="approveGoalAction">승인</button>
      </div>
    </div>
  </div>


  <div v-if="toast.show" class="toast">
    {{ toast.message }}
  </div>

  <!-- ===== 삭제 확인 모달 ===== -->
  <div v-if="showDeleteModal" class="modal-backdrop">
    <div class="modal decision-modal reject">

      <div class="modal-header decision-header reject">
        <h3>목표 삭제</h3>
        <button class="btn-close" @click="closeDeleteModal">✕</button>
      </div>

      <div class="modal-body">
        <p class="decision-desc">
          이 목표를 삭제하면 복구할 수 없습니다.<br />
          정말 삭제하시겠습니까?
        </p>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" @click="closeDeleteModal">취소</button>
        <button class="btn-danger" @click="deleteGoalAction">삭제</button>
      </div>
    </div>
  </div>

  <!-- ===== 목표 수정 모달 ===== -->
  <div v-if="showEditModal" class="modal-backdrop">
    <div class="modal edit-modal">

      <div class="modal-header">
        <h3>목표 수정</h3>
        <button class="btn-close" @click="closeEditModal">✕</button>
      </div>

      <div class="modal-body edit-body">

        <div class="form-section">
          <label>목표명</label>
          <input
            v-model="editForm.title"
            class="input"
            placeholder="목표명을 입력하세요"
          />
        </div>

        <div class="form-section">
          <label>설명</label>
          <textarea
            v-model="editForm.description"
            class="textarea"
            rows="3"
            placeholder="목표에 대한 설명을 입력하세요"
          />
        </div>

        <div class="form-row">
          <div class="form-section">
            <label>시작일</label>
            <input type="date" v-model="editForm.startDate" class="input" />
          </div>

          <div class="form-section">
            <label>종료일</label>
            <input type="date" v-model="editForm.endDate" class="input" />
          </div>
        </div>

        <div class="form-section">
          <label>목표 범위</label>
          <select v-model="editForm.goalScope" class="select">
            <option value="TEAM">팀</option>
            <option value="PERSONAL">개인</option>
          </select>
        </div>

      </div>

      <div class="modal-footer edit-footer">
        <button class="btn-cancel" @click="closeEditModal">
          취소
        </button>
        <button class="btn-save" @click="submitEdit">
          수정 저장
        </button>
      </div>

    </div>
  </div>
  </Teleport>


</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter  } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'

import { fetchGoalDetail } from '@/api/goalApi'
import {
  fetchGoalKpis,
  fetchKpiDetail,
  createKpiProgress,
} from '@/api/kpiApi'
import {
  fetchGoalOkrs,
  fetchOkrDetail,
  createOkrProgress,
} from '@/api/okrApi'

const route = useRoute()
const router = useRouter()

const isFromTeamOwner = computed(() => route.query.from === 'teamOwner')
const canDecide = computed(() => isFromTeamOwner.value && goal.value.approveStatus === 'SUBMITTED')

const goBack = () => {
  router.push('/goal')
}

const goal = ref({})
const items = ref([])
const selectedItem = ref(null)
const scopeLabel = {
  TEAM: '팀',
  PERSONAL: '개인',
}

const statusLabel = {
  DRAFT: '임시저장',
  SUBMITTED: '제출됨',
  APPROVED: '승인',
  REJECTED: '반려',
}


/* ===== 성과 입력 모달 ===== */
const showModal = ref(false)
const form = ref({
  logDate: '',
  value: null,
})

/*===== 추가 모달 ======*/
const showCreateModal = ref(false)

const createForm = ref({
  metricName: '',
  content: '',
  startValue: null,
  targetValue: null,
})
const openCreateModal = () => {
  createForm.value = {
    metricName: '',
    content: '',
    startValue: null,
    targetValue: null,
  }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

import { createKpi } from '@/api/kpiApi'
import { createKeyResult } from '@/api/okrApi'

const submitCreate = async () => {
  const goalId = route.params.goalId

  // 공통 검증
  if (!createForm.value.metricName?.trim()) {
    showToast('지표명을 입력하세요')
    return
  }

  // KPI 검증
  if (goal.value.type === 'KPI') {
    if (
      createForm.value.startValue === null ||
      createForm.value.targetValue === null
    ) {
      showToast('시작값과 목표값을 입력하세요')
      return
    }

    await createKpi(goalId, {
      metricName: createForm.value.metricName,
      startValue: createForm.value.startValue,
      targetValue: createForm.value.targetValue,
    })
  }

  // OKR 검증
  else {
    if (!createForm.value.content?.trim()) {
      showToast('KR 내용을 입력하세요')
      return
    }

    if (createForm.value.targetValue === null) {
      showToast('목표값을 입력하세요')
      return
    }

    await createKeyResult(goalId, {
      content: createForm.value.content,
      metricName: createForm.value.metricName,
      targetValue: createForm.value.targetValue,
    })
  }

  await reloadAll()
  closeCreateModal()
}


/* KPI 선택 */
const selectKpi = async (kpi) => {
  const res = await fetchKpiDetail(kpi.kpiId)
  selectedItem.value = res.data
}


/* OKR 선택 */
const selectOkr = async (okr) => {
  const res = await fetchOkrDetail(okr.keyResultId)
  selectedItem.value = res.data
}

/* 모달 */
const openModal = () => {
  form.value = { logDate: '', value: null }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}
const reloadAll = async () => {
  const goalId = route.params.goalId

  // 1. Goal 다시 조회 (상단 원형 그래프)
  const goalRes = await fetchGoalDetail(goalId)
  goal.value = goalRes.data

  // 2. KPI / OKR 목록 다시 조회
  if (goal.value.type === 'KPI') {
    const res = await fetchGoalKpis(goalId)
    items.value = res.data

    // 선택된 KPI 다시 조회
    if (selectedItem.value) {
      await selectKpi({ kpiId: selectedItem.value.kpiId })
    }
  } else {
    const res = await fetchGoalOkrs(goalId)
    items.value = res.data

    // 선택된 OKR 다시 조회
    if (selectedItem.value) {
      await selectOkr({ keyResultId: selectedItem.value.keyResultId })
    }
  }
}
/* 성과 저장 */
const submitProgress = async () => {
  const goalId = route.params.goalId

  if (goal.value.type === 'KPI') {
    await createKpiProgress(goalId, selectedItem.value.kpiId, {
      logDate: form.value.logDate,
      logValue: form.value.value,
    })
  } else {
    await createOkrProgress(goalId, selectedItem.value.keyResultId, {
      logDate: form.value.logDate,
      currentProgress: form.value.value,
    })
  }

  await reloadAll()
  closeModal()
}


/* 초기 로딩 */
onMounted(async () => {
  const goalId = route.params.goalId

  const goalRes = await fetchGoalDetail(goalId)
  goal.value = goalRes.data

  if (goal.value.type === 'KPI') {
    const res = await fetchGoalKpis(goalId)
    items.value = res.data
    if (items.value.length) await selectKpi(items.value[0])
  } else {
    const res = await fetchGoalOkrs(goalId)
    items.value = res.data
    if (items.value.length) await selectOkr(items.value[0])
  }
})

/*반려, 승인 모달*/
/* ===== 승인 / 반려 모달 ===== */
const showRejectModal = ref(false)
const showApproveModal = ref(false)
const rejectReason = ref('')


/* ===== Toast ===== */
const toast = ref({
  show: false,
  message: '',
})

const openApproveModal = () => {
  showApproveModal.value = true
}

const closeRejectModal = () => {
  showRejectModal.value = false
}

const closeApproveModal = () => {
  showApproveModal.value = false
}

const showToast = (message) => {
  toast.value = { show: true, message }
  setTimeout(() => (toast.value.show = false), 2500)
}

import {
  approveGoal as approveGoalApi,
  rejectGoal as rejectGoalApi,
} from '@/api/goalApi'

const approveGoalAction = async () => {
  await approveGoalApi(route.params.goalId)
  showApproveModal.value = false
  showToast('승인 처리 되었습니다')
  await reloadAll()
}
const rejectError = ref(false)

const rejectGoalAction = async () => {
  if (!rejectReason.value.trim()) {
    rejectError.value = true
    return
  }

  rejectError.value = false

  await rejectGoalApi(route.params.goalId, rejectReason.value)
  showRejectModal.value = false
  showToast('반려 처리 완료되었습니다')
  await reloadAll()
}

const openRejectModal = () => {
  rejectReason.value = ''
  rejectError.value = false
  showRejectModal.value = true
}

import { useAuthStore } from '@/stores/authStore'
const auth = useAuthStore()

const isOwner = computed(() => {
  if (!goal.value?.ownerId || !auth.user?.employeeId) return false

  return Number(goal.value.ownerId) === Number(auth.user.employeeId)
})
const canEdit = computed(() => {
  return (
    isOwner.value &&
    goal.value.approveStatus !== 'APPROVED'
  )
})
const showEditModal = ref(false)

const editForm = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  goalScope: '',
})
const openEditModal = () => {
  editForm.value = {
    title: goal.value.title,
    description: goal.value.description,
    startDate: goal.value.startDate,
    endDate: goal.value.endDate,
    goalScope: goal.value.scope,
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}
import { updateGoal, deleteGoal } from '@/api/goalApi'

const submitEdit = async () => {
  await updateGoal(route.params.goalId, editForm.value)
  showToast('목표가 수정되었습니다')
  showEditModal.value = false
  await reloadAll()
}

const showDeleteModal = ref(false)

const openDeleteModal = () => {
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}
const deleteGoalAction = async () => {
  await deleteGoal(route.params.goalId)
  showToast('목표가 삭제되었습니다')
  router.push('/goal')
}

import { submitGoal as submitGoalApi } from '@/api/goalApi'

const canSubmit = computed(() => {
  return (
    isOwner.value &&
    (goal.value.approveStatus === 'DRAFT' ||
      goal.value.approveStatus === 'REJECTED')
  )
})

const submitGoalAction = async () => {
  await submitGoalApi(route.params.goalId)
  showToast('목표가 제출되었습니다')
  await reloadAll()
}

</script>


<style scoped>
.goal-detail {
  padding: 24px;
  background: #f9fafb;
}

.breadcrumb {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 16px;
}
.breadcrumb span {
  margin: 0 4px;
}

.layout {
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 20px;
}

.goal-card,
.detail-card {
  padding: 24px;
}

/* ===== HEADER ===== */
.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.goal-title {
  font-size: 20px;
  font-weight: 600;
}

.goal-meta {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.pill {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
}

.pill.success {
  background: #ecfdf5;
  color: #047857;
}

/* ===== PROGRESS CIRCLE ===== */
.progress-circle {
  position: relative;
  width: 80px;
  height: 80px;
}

svg {
  width: 80px;
  height: 80px;
}

svg .bg {
  fill: none;
  stroke: #e5e7eb;
  stroke-width: 3;
}

svg .progress {
  fill: none;
  stroke: #6366f1;
  stroke-width: 3;
  stroke-linecap: round;
}

.rate {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* ===== INFO ===== */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
}

.info-grid .full {
  grid-column: span 2;
}

label {
  font-size: 11px;
  color: #6b7280;
}

p {
  margin-top: 4px;
  font-size: 13px;
}

/* ===== KPI ===== */
.section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.kpi-list {
  display: grid;
  gap: 12px;
}

.kpi-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
}

.kpi-item.active {
  border-color: #6366f1;
  background: #eef2ff;
}

.kpi-head {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 500;
}

.kpi-rate {
  color: #6366f1;
}

.bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 999px;
  margin: 8px 0;
}

.bar.lg {
  height: 8px;
}

.fill {
  height: 100%;
  background: #6366f1;
  border-radius: 999px;
  transition: width 0.6s ease;
}

.kpi-meta {
  font-size: 11px;
  color: #6b7280;
}

/* ===== RIGHT ===== */
.detail-card table {
  width: 100%;
  font-size: 12px;
  margin-top: 12px;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.muted {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

.empty {
  text-align: center;
  color: #9ca3af;
  padding: 60px 0;
}
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-record {
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 999px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  cursor: pointer;
}

.btn-record:hover {
  background: #4338ca;
}


.modal h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form label {
  font-size: 12px;
  color: #6b7280;
}

.form input {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

/* ===== Modal Backdrop ===== */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* ===== Modal Card ===== */
.modal {
  width: 500px;
  height: 500px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modalPop 0.25s ease-out;
}

@keyframes modalPop {
  from {
    transform: translateY(10px) scale(0.96);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* ===== Header ===== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
}

.btn-close:hover {
  color: #111827;
}

/* ===== Body ===== */
.modal-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  color: #6b7280;
}

.field input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
}

.field input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.hint {
  font-size: 12px;
  color: #6b7280;
  background: #f8fafc;
  padding: 10px 12px;
  border-radius: 10px;
}

/* ===== Footer ===== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 20px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

.btn-primary {
  padding: 8px 18px;
  border-radius: 10px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-back {
  margin-bottom: 12px;
  background: none;
  border: none;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
}

.btn-back:hover {
  text-decoration: underline;
}

svg .progress {
  fill: none;
  stroke: #6366f1;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dasharray 0.8s ease;
}

.btn-add {
  margin-left: auto;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  border: 1px solid #6366f1;
  cursor: pointer;
}

.btn-add:hover {
  background: #e0e7ff;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.goal-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.goal-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}



/* 승인/반려 버튼 */
.btn-approve {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #16a34a;
  background: #16a34a;
  color: #fff;
  cursor: pointer;
}

.btn-approve:hover {
  opacity: 0.92;
}

.btn-reject {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #dc2626;
  background: #fff;
  color: #dc2626;
  cursor: pointer;
}

.btn-reject:hover {
  background: #fef2f2;
}

.toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(6px);
  color: white;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 13px;
  z-index: 200;
  animation: toastSlide 0.3s ease-out;
}

@keyframes toastSlide {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.decision-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ===== Reject Modal ===== */
.decision-header.reject {
  background: linear-gradient(135deg, #fee2e2, #fff);
  border-bottom: 1px solid #fecaca;
}

.decision-header.reject h3 {
  color: #b91c1c;
}

.decision-desc {
  font-size: 13px;
  color: #7f1d1d;
  margin-bottom: 12px;
}

.reject-textarea {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid #fecaca;
  font-size: 14px;
  resize: none;
}

.reject-textarea:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.btn-danger {
  padding: 8px 18px;
  border-radius: 10px;
  background: #dc2626;
  color: #fff;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #b91c1c;
}

/* ===== Approve Modal ===== */
.decision-header.approve {
  background: linear-gradient(135deg, #dcfce7, #fff);
  border-bottom: 1px solid #bbf7d0;
}

.decision-header.approve h3 {
  color: #166534;
}

.approve-body {
  text-align: center;
  font-size: 14px;
  color: #065f46;
}

.approve-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
}

.btn-success {
  padding: 8px 18px;
  border-radius: 10px;
  background: #16a34a;
  color: #fff;
  border: none;
  font-size: 13px;
  cursor: pointer;
}

.btn-success:hover {
  background: #15803d;
}

/* ===== Reject Banner ===== */
.reject-banner {
  margin-top: 10px;
  width: 400px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #84877f;
}

.reject-banner strong {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.reject-banner p {
  font-size: 13px;
  color: #ffffff;
  margin: 0;
}

.goal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-edit {
  margin-top: 10px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #6366f1;
  background: #eef2ff;
  color: #4338ca;
  cursor: pointer;
}

.btn-delete {
  margin-top: 10px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #dc2626;
  background: #fff;
  color: #dc2626;
  cursor: pointer;
}

.btn-submit {
  margin-top: 10px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 999px;
  border: 1px solid #16a34a;
  background: #ecfdf5;
  color: #047857;
  cursor: pointer;
}

.btn-submit:hover {
  background: #d1fae5;
}
/* ===== Edit Modal 전용 ===== */
.edit-modal {
  width: 520px;
  height: auto;
  border-radius: 16px;
}

.edit-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 섹션 */
.form-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-section label {
  font-size: 12px;
  color: #6b7280;
}

/* 두 칸 레이아웃 */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

/* input */
.input,
.select,
.textarea {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  font-size: 14px;
  background: #f9fafb;
}

.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.textarea {
  resize: none;
}

/* footer */
.edit-footer {
  justify-content: space-between;
}

.btn-cancel {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  font-size: 13px;
  cursor: pointer;
}

.btn-save {
  padding: 8px 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.btn-save:hover {
  opacity: 0.92;
}

</style>
