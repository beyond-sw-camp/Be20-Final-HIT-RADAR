
<template>
  <section class="page">
    <!-- Title -->
    <div class="section-title">
      <div>
        <h1>다면평가 작성</h1>
        <div class="sub">
          배정된 평가를 선택하여 평가를 작성합니다.
        </div>
      </div>
    </div>
    <div class="layout">
      <!-- LEFT : 내 평가함 -->
      <aside class="eval-panel">
        <div class="panel-title">내 평가함</div>

        <ul class="eval-list">
          <li
            v-for="e in myEvaluations"
            :key="e.assignmentId"
            :class="{
              active: selectedAssignment?.assignmentId === e.assignmentId,
              disabled: e.cycleStatus !== 'IN_PROGRESS'
            }"
            @click="e.cycleStatus === 'IN_PROGRESS' && selectAssignment(e)"
          >
            <!-- Badge for Closed Cycle -->
            <div v-if="e.cycleStatus !== 'IN_PROGRESS'" class="closed-overlay">
              <span class="closed-badge">⛔ 평가 마감</span>
            </div>

            <div class="target">{{ e.targetName }}</div>

            <div class="meta">
              {{ e.evalTypeName }}

              <span
                class="status"
                :class="e.assignmentStatus.toLowerCase()"
              >
                {{ e.assignmentStatus === 'SUBMITTED' ? '제출완료' : '미제출' }}
              </span>
            </div>
          </li>
        </ul>
      </aside>

      <!-- RIGHT -->
      <section class="content-panel">

        <!-- 아무것도 선택 안 함 -->
        <div v-if="!selectedAssignment" class="empty-state">
          <div class="empty-icon">📝</div>
          <div class="empty-title">평가 대상을 선택해주세요</div>
          <div class="empty-desc">
            왼쪽 <b>내 평가함</b>에서 평가 대상을 선택하면<br />
            평가 문항을 작성할 수 있습니다.
          </div>
        </div>

        <!-- 회차가 닫힌 경우 -->
        <div
          v-else-if="selectedAssignment.cycleStatus !== 'IN_PROGRESS'"
          class="empty-state warning"
        >
          <div class="empty-icon">⛔</div>
          <div class="empty-title">평가 기간이 아닙니다</div>
          <div class="empty-desc">
            해당 회차는 현재 평가를 작성할 수 없습니다.<br />
            평가 기간을 확인해주세요.
          </div>
        </div>

        <!-- 정상 평가 가능 -->
        <template v-else>
          <div class="content-header">
            <h2>
              {{ selectedAssignment.targetName }}
              <span class="badge">{{ selectedAssignment.evalTypeName }}</span>
            </h2>
          </div>

          <section
            v-for="section in sections"
            :key="section.sectionId"
            class="form-section"
          >
            <div class="section-title-text">
              {{ section.sectionTitle }}
            </div>
            <div class="section-desc-text">
              {{ section.sectionDescription }}
            </div>

            <div
              v-for="q in section.questions"
              :key="q.questionId"
              class="question-card"
            >
              <div class="question-title">
                {{ q.questionContent }}
                <span
                  v-if="q.requiredStatus === 'REQUIRED'"
                  class="required"
                >*</span>
              </div>

              <!-- RATING -->
              <div v-if="q.questionType === 'RATING'" class="score-scale">
                <label
                  v-for="n in q.ratingScale"
                  :key="n"
                  class="score-item"
                >
                  <input
                    type="radio"
                    class="custom-check"
                    :name="`q-${q.questionId}`"
                    :value="n"
                    v-model="answers[q.questionId].score"
                    :disabled="isReadonly"
                  />
                  <span class="score-num">{{ n }}</span>
                  <span
                    class="score-star"
                    :class="{ active: answers[q.questionId].score >= n }"
                  >★</span>
                </label>
              </div>

              <!-- SUBJECTIVE -->
              <textarea
                v-if="q.questionType === 'SUBJECTIVE'"
                v-model="answers[q.questionId].text"
                class="comment-input"
                :disabled="isReadonly"
              />

              <!-- OBJECTIVE -->
              <div
                v-if="q.questionType === 'OBJECTIVE'"
                class="choice-list"
              >
                <label
                  v-for="opt in q.options"
                  :key="opt.optionId"
                  class="choice-item"
                >
                  <input
                    type="radio"
                    class="custom-check"
                    :name="`q-${q.questionId}`"
                    :value="opt.optionId"
                    v-model="answers[q.questionId].optionId"
                    :disabled="isReadonly"
                  />
                  {{ opt.optionContent }}
                </label>
              </div>
            </div>
          </section>

          <!-- Actions -->
          <div class="form-actions" v-if="!isReadonly">
            <button class="btn secondary" @click="tempSave">
              임시 저장
            </button>
            <button class="btn primary" @click="submit">
              제출
            </button>
          </div>
        </template>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchAssignmentsByEvaluator } from '@/api/evaluationAssignmentApi'
import { fetchEvaluationSheet } from '@/api/evaluationSheetApi'
import {
  saveEvaluationResponseDraft,
  submitEvaluationResponse,
  fetchEvaluationResponses,
} from '@/api/evaluationResponseApi'

/* =========================
 * state
 * ========================= */
const myEvaluations = ref([])
const selectedAssignment = ref(null)
const sections = ref([])
const answers = ref({})

const employeeMap = {
  1001: '김성수',
  1002: '이서연',
  1003: '박민수',
  1004: '정유진',
}

/* =========================
 * readonly 여부
 * ========================= */
const isReadonly = computed(() => {
  if (!selectedAssignment.value) return true

  return (
    selectedAssignment.value.assignmentStatus === 'SUBMITTED' ||
    selectedAssignment.value.cycleStatus !== 'IN_PROGRESS'
  )
})

/* =========================
 * 내 평가함 조회
 * ========================= */
const loadMyAssignments = async () => {
  const res = await fetchAssignmentsByEvaluator()
  myEvaluations.value = (res.data?.data ?? []).map(a => ({
    ...a,
    targetName: employeeMap[a.evaluateeId] ?? `사원 ${a.evaluateeId}`,
  }))
}

/* =========================
 * 평가 선택
 * ========================= */
const selectAssignment = async (assignment) => {
  selectedAssignment.value = assignment
  sections.value = []
  answers.value = {}

  // 1️⃣ 문항지
  const sheetRes = await fetchEvaluationSheet(
    assignment.cycleId,
    assignment.evalTypeId
  )
  sections.value = sheetRes.data?.data ?? []

  // 2️⃣ 기본 answers 초기화
  sections.value.forEach(section =>
    section.questions.forEach(q => {
      answers.value[q.questionId] = {
        score: null,
        text: '',
        optionId: null,
      }
    })
  )

  // 3️⃣ 기존 응답 불러오기
  const responseRes = await fetchEvaluationResponses(
    assignment.assignmentId
  )

  responseRes.data?.forEach(r => {
    if (!answers.value[r.questionId]) return

    if (r.questionType === 'RATING') {
      answers.value[r.questionId].score = r.score
    }
    if (r.questionType === 'SUBJECTIVE') {
      answers.value[r.questionId].text = r.textAnswer ?? ''
    }
    if (r.questionType === 'OBJECTIVE') {
      answers.value[r.questionId].optionId = r.optionId
    }
  })
}

/* =========================
 * payload builder
 * ========================= */
const buildResponsePayload = () => ({
  assignmentId: selectedAssignment.value.assignmentId,
  responses: Object.entries(answers.value).map(([id, a]) => {
    const q = sections.value
      .flatMap(s => s.questions)
      .find(q => q.questionId === Number(id))

    return {
      questionId: Number(id),
      responseType: q.questionType,
      score: q.questionType === 'RATING' ? a.score : null,
      textAnswer: q.questionType === 'SUBJECTIVE' ? a.text : null,
      optionId: q.questionType === 'OBJECTIVE' ? a.optionId : null,
    }
  }),
})

/* =========================
 * actions
 * ========================= */
const tempSave = async () => {
  await saveEvaluationResponseDraft(buildResponsePayload())
  alert('임시 저장되었습니다.')
}

const submit = async () => {
  await saveEvaluationResponseDraft(buildResponsePayload())
  await submitEvaluationResponse(selectedAssignment.value.assignmentId)

  alert('평가가 제출되었습니다.')
  await loadMyAssignments()
  selectedAssignment.value = null
}

/* =========================
 * lifecycle
 * ========================= */
onMounted(loadMyAssignments)
</script>


<style scoped>
.page {
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 18px 48px;
}

/* title */
.section-title h1 {
  font-size: 20px;
  font-weight: 700;
}
.section-title .sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* back */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #f1f5f9;
  border: none;
  cursor: pointer;
  font-weight: 700;
}
.back-btn:hover {
  background: #e0e7ff;
}

/* section */
.form-section {
  background: #ffffff;
  border-radius: 14px;
  border-left: 6px solid #6366f1;
  padding: 22px;
  margin-bottom: 24px;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.08);
}

.section-title-text {
  font-size: 18px;
  font-weight: 700;
}
.section-desc-text {
  font-size: 14px;
  color: #6b7280;
  margin-top: 6px;
}

/* question */
.question-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px;
  margin-top: 18px;
  border-left: 4px solid transparent;
}
.question-card:focus-within {
  border-left-color: #6366f1;
}

.question-title {
  font-weight: 600;
  margin-bottom: 12px;
}

/* score */
.score-scale {
  display: flex;
  gap: 14px;
}
.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}
.score-num {
  font-size: 13px;
}
.score-star {
  font-size: 22px;
  color: #d1d5db;
}
.score-star.active {
  color: #fbbf24;
}

/* comment */
.comment-input {
  margin-top: 14px;
  width: 100%;
  min-height: 80px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 12px;
  font-size: 14px;
  resize: none;
}

/* actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 28px;
}

.btn {
  padding: 10px 18px;
  border-radius: 12px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}
.btn.primary {
  background: #6366f1;
  color: white;
}
.btn.secondary {
  background: #e5e7eb;
}
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 32px;
}

/* LEFT */
.eval-panel {
  background: #3a69d6;
  color: white;
  border-radius: 20px;
  padding: 24px;
}
.panel-title {
  font-weight: 800;
  margin-bottom: 16px;
}
.eval-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.eval-list li {
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  position: relative; /* For overlay positioning */
  overflow: hidden;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}
.eval-list li:hover {
  background: rgba(255,255,255,0.2);
}
.eval-list li.active {
  background: rgba(255,255,255,0.3);
  border-color: rgba(255,255,255,0.5);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.eval-list li.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: rgba(0,0,0,0.15) !important;
  color: #d1d5db;
}

.closed-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(55, 65, 81, 0.6);
  z-index: 10;
  backdrop-filter: blur(1px);
}

.closed-badge {
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  background: #ef4444;
  padding: 6px 14px;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 4px;
}
.target {
  font-weight: 800;
  margin-bottom: 4px; /* Slight spacing adjustment */
}
.meta {
  font-size: 12px;
  opacity: 0.9;
}

/* RIGHT */
.content-panel {
  background: white;
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.badge {
  margin-left: 8px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #6366f1;
  color: white;
}


.status {
  margin-left: 6px;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 999px;
}
.status.pending {
  background: #fef3c7;
  color: #92400e;
}
.status.submitted {
  background: #dcfce7;
  color: #166534;
}

.choice-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.choice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.required {
  margin-left: 6px;
  color: #ef4444;
  font-weight: 900;
}

.empty-state {
  height: 100%;
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 2px dashed #e5e7eb;
  border-radius: 20px;
  background: #f9fafb;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
}

.custom-check {
  cursor: pointer;
  width: 16px !important;   /* 원하는 사이즈 고정 /
  height: 16px !important;
  margin: 0;
  accent-color: #6366f1;    / 포인트 컬러 /
  flex-shrink: 0;           / 레이아웃에서 찌그러짐 방지 /
  appearance: auto;         / 브라우저 기본 형태 유지 */
}
</style>
