<template>
  <section class="page">
    <!-- ===== Page Title ===== -->
    <div class="section-title">
      <div>
        <h1>평가 문항지 설정</h1>
        <div class="sub">
          회차와 평가 유형에 맞는 평가 문항지를 구성합니다.
        </div>
      </div>
    </div>

    <!-- ===== Top Selector ===== -->
    <section class="card selector-card">
      <div class="selector">
        <div class="field">
          <label>평가 회차</label>
          <select v-model="selectedCycleId">
            <option value="">회차 선택</option>
            <option
              v-for="c in cycles"
              :key="c.cycleId"
              :value="c.cycleId"
            >
              {{ c.cycleName }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>평가 유형</label>
          <select v-model="selectedEvalTypeId">
            <option value="">평가 유형 선택</option>
            <option
              v-for="t in evalTypes"
              :key="t.evalTypeId"
              :value="t.evalTypeId"
            >
              {{ t.typeName }}
            </option>
          </select>

        </div>
      </div>
    </section>
    <!-- ===== 상태 안내 (DRAFT 아닐 때) ===== -->
    <div
      v-if="selectedCycleId && !canCreateForm"
      class="cycle-status-notice"
    >
      <b>{{ selectedCycle.cycleName }}</b> 회차는<br />
      현재 <b>{{ selectedCycle.status }}</b> 상태로<br />
      평가 문항지를 생성하거나 수정할 수 없습니다.
    </div>

    <!-- ===== Form Builder ===== -->
    <section
      v-else-if="canCreateForm"
      v-for="(section, sIdx) in sections.filter(s => !s.isDeleted)"
      :key="section.id ?? sIdx"
      class="form-section"
    >
    <div class="section-header">
        <input
          v-model="section.title"
          class="section-title-input"
          placeholder="섹션 제목"
        />
        <textarea
          v-model="section.description"
          class="section-desc"
          placeholder="섹션 설명 (선택)"
        />
      </div>
      <!-- 질문 -->
      <div
        v-for="(q, qIdx) in section.questions.filter(q => !q.isDeleted)"
        :key="q.id ?? qIdx"
        class="question-card"
      >
        <div class="question-head">
          <input
            v-model="q.title"
            class="question-title"
            placeholder="질문"
          />

          <select v-model="q.type" class="question-type">
            <option value="CHOICE">객관식</option>
            <option value="SCORE">점수형</option>
            <option value="TEXT">주관식</option>
          </select>
        </div>

        <!-- 객관식 -->
        <div v-if="q.type === 'CHOICE'" class="choice-list">
          <div
            v-for="(opt, oIdx) in q.options"
            :key="oIdx"
            class="choice-item"
          >
            <span class="radio"></span>
            <input
              v-model="q.options[oIdx]"
              placeholder="옵션"
            />
            <button class="icon-btn" @click="removeOption(section, q, oIdx)">
              ✕
            </button>
          </div>

          <button class="add-option" @click="addOption(q)">
            + 옵션 추가
          </button>
        </div>

        <!-- 점수형 -->
        <div v-if="q.type === 'SCORE'" class="score-box">
          <div class="score-config">
            <select v-model="q.maxScore" class="score-select">
              <option :value="5">5</option>
              <option :value="7">7</option>
              <option :value="10">10</option>
            </select>

            <span class="score-icon">⭐</span>
          </div>

          <div class="score-scale">
            <div
              v-for="n in q.maxScore"
              :key="n"
              class="score-item"
            >
              <span class="score-num">{{ n }}</span>
              <span class="score-star">☆</span>
            </div>
          </div>
        </div>


        <!-- 주관식 -->
        <div v-if="q.type === 'TEXT'" class="text-preview">
          장문형 텍스트 응답
        </div>

        <!-- 하단 액션 -->
        <div class="question-actions">
          <label class="required-toggle">
            <input type="checkbox" v-model="q.required" />
            필수
          </label>

          <button class="icon-btn" @click="removeQuestion(section, qIdx)">
            🗑
          </button>
        </div>
      </div>

      <button class="add-question" @click="addQuestion(section)">
        + 질문 추가
      </button>

      <div class="section-footer">
        <button class="btn btn-danger btn-sm" @click="removeSection(sIdx)">
          섹션 삭제
        </button>
      </div>
    </section>

    <!-- ===== Add Section ===== -->
    <div class="add-section">
      <button class="btn btn-primary" @click="addSection">
        + 섹션 추가
      </button>

      <button class="btn btn-primary save-btn" @click="saveEvaluationSheet">
        저장
      </button>
    </div>
  </section>
</template>
<script setup>
import { ref, onMounted, watch, computed } from 'vue'

// cycle api
import { fetchCycles } from '@/api/cycleApi'

// cycle-evaluation-type api
import { fetchCycleEvaluationTypes } from '@/api/cycleEvaluationTypeApi'

// evaluation sheet query api
import { fetchEvaluationSheet } from '@/api/evaluationSheetApi'

// section api
import {
  createEvaluationSection,
  updateEvaluationSection,
  deleteEvaluationSection,
} from '@/api/evaluationSectionApi'

// question api
import {
  createEvaluationQuestion,
  updateEvaluationQuestion,
  deleteEvaluationQuestion,
} from '@/api/evaluationQuestionApi'

/* state */

const cycles = ref([])
const evalTypes = ref([])

const selectedCycleId = ref('')
const selectedEvalTypeId = ref('')

const sections = ref([])

/* computed */

const selectedCycle = computed(() => {
  return cycles.value.find(c => c.cycleId === selectedCycleId.value)
})

const canCreateForm = computed(() => {
  return selectedCycle.value?.status === 'DRAFT'
})

/*
const cycleEvalTypeId = computed(() => selectedEvalTypeId.value)
*/
const selectedEvalType = computed(() => {
  return evalTypes.value.find(
    t => Number(t.evalTypeId) === Number(selectedEvalTypeId.value)
  )
})

const cycleEvalTypeId = computed(() => {
  return selectedEvalType.value?.cycleEvalTypeId ?? null
})

/* load */

const loadCycles = async () => {
  const res = await fetchCycles()
  const body = res.data
  cycles.value = Array.isArray(body) ? body : body?.data ?? []
}

const loadEvalTypesByCycle = async (cycleId) => {
  if (!cycleId) {
    evalTypes.value = []
    selectedEvalTypeId.value = ''
    return
  }

  const res = await fetchCycleEvaluationTypes(cycleId)
  const body = res.data
  evalTypes.value = Array.isArray(body) ? body : body?.data ?? []
  selectedEvalTypeId.value = ''
}

/* mapping */

const mapQuestionTypeFromBE = (type) => {
  if (type === 'OBJECTIVE') return 'CHOICE'
  if (type === 'SUBJECTIVE') return 'TEXT'
  if (type === 'RATING') return 'SCORE'
  return 'CHOICE'
}

const mapQuestionTypeToBE = (type) => {
  if (type === 'CHOICE') return 'OBJECTIVE'
  if (type === 'TEXT') return 'SUBJECTIVE'
  if (type === 'SCORE') return 'RATING'
  return 'OBJECTIVE'
}

const mapRequiredFromBE = (status) => status === 'REQUIRED'
const mapRequiredToBE = (required) => required ? 'REQUIRED' : 'OPTIONAL'

/* evaluation sheet load */

const loadEvaluationSheet = async (cycleId, evalTypeId) => {
  if (!cycleId || !evalTypeId) return

  const res = await fetchEvaluationSheet(cycleId, evalTypeId)
  const data = Array.isArray(res.data?.data) ? res.data.data : []

  if (data.length === 0) {
    sections.value = []
    return
  }

  sections.value = data.map(section => ({
    id: section.sectionId,
    title: section.sectionTitle,
    description: section.sectionDescription,
    isDeleted: false,
    questions: section.questions.map(q => ({
      id: q.questionId,
      title: q.questionContent,
      type: mapQuestionTypeFromBE(q.questionType),
      required: mapRequiredFromBE(q.requiredStatus),
      maxScore: q.ratingScale ?? 5,
      options:
        q.questionType === 'OBJECTIVE'
          ? q.options.map(opt => opt.optionContent)
          : [],
      isDeleted: false,
    })),
  }))
}

/* lifecycle */

onMounted(loadCycles)

watch(selectedCycleId, loadEvalTypesByCycle)

watch(
  [selectedCycleId, selectedEvalTypeId],
  ([cycleId, evalTypeId]) => {
    if (cycleId && evalTypeId) {
      loadEvaluationSheet(cycleId, evalTypeId)
    }
  }
)

/* section actions */

const addSection = () => {
  sections.value.push({
    id: null,
    title: '',
    description: '',
    isDeleted: false,
    questions: [],
  })
}

const removeSection = (idx) => {
  const section = sections.value[idx]

  const hasAliveQuestions = section.questions.some(
    q => !q.isDeleted
  )

  if (hasAliveQuestions) {
    alert(
      '이 섹션에는 질문이 있습니다.\n' +
      '섹션을 삭제하려면 먼저 모든 질문을 삭제해주세요.'
    )
    return
  }

  // 질문이 없을 때만 삭제 허용
  if (section.id) {
    section.isDeleted = true
  } else {
    sections.value.splice(idx, 1)
  }
}

/* question actions */

const addQuestion = (section) => {
  section.questions.push({
    id: null,
    title: '',
    type: 'CHOICE',
    required: false,
    options: [],
    maxScore: 5,
    isDeleted: false,
  })
}

const removeQuestion = (section, idx) => {
  const question = section.questions[idx]

  if (question.id) {
    question.isDeleted = true
  } else {
    section.questions.splice(idx, 1)
  }
}

const addOption = (q) => {
  q.options.push(``)
}

const removeOption = (section, q, idx) => {
  q.options.splice(idx, 1)
}

/* payload builders */

const buildCreateQuestionPayload = (q) => ({
  questionType: mapQuestionTypeToBE(q.type),
  questionContent: q.title,
  ratingScale: q.type === 'SCORE' ? q.maxScore : null,
  requiredStatus: mapRequiredToBE(q.required),
  options:
    q.type === 'CHOICE'
      ? q.options.map(opt => ({
        optionContent: opt,
        optionScore: null,
      }))
      : [],
})

const buildUpdateQuestionPayload = (q) => ({
  questionContent: q.title,
  requiredStatus: mapRequiredToBE(q.required),
  ratingScale: q.type === 'SCORE' ? q.maxScore : null,
  options:
    q.type === 'CHOICE'
      ? q.options.map(opt => ({
        optionContent: opt,
        optionScore: null,
      }))
      : [],
})

/* save */

const saveEvaluationSheet = async () => {
  if (!cycleEvalTypeId.value) return

  try {
    let sectionOrder = 1

    for (const section of sections.value) {
      if (section.isDeleted) {
        if (section.id) {
          await deleteEvaluationSection(section.id)
        }
        continue
      }

      if (!section.id) {
        const res = await createEvaluationSection(
          cycleEvalTypeId.value,
          {
            sectionTitle: section.title,
            sectionDescription: section.description,
            sectionOrder,
          }
        )
        section.id = res.data.data
      } else {
        await updateEvaluationSection(section.id, {
          sectionTitle: section.title,
          sectionDescription: section.description,
          sectionOrder,
        })
      }

      for (const q of section.questions) {
        if (q.isDeleted) {
          if (q.id) {
            await deleteEvaluationQuestion(q.id)
          }
          continue
        }

        if (!q.id) {
          const res = await createEvaluationQuestion(
            section.id,
            buildCreateQuestionPayload(q)
          )
          q.id = res.data.data
        } else {
          await updateEvaluationQuestion(
            q.id,
            buildUpdateQuestionPayload(q)
          )
        }
      }

      sectionOrder++
    }

    // 프론트 상태 정리
    sections.value = sections.value.filter(s => !s.isDeleted)
    sections.value.forEach(s => {
      s.questions = s.questions.filter(q => !q.isDeleted)
    })

    alert('저장되었습니다.')

  } catch (e) {
    console.error(e)
    alert('저장 중 오류가 발생했습니다.')
  }
}

</script>




<style scoped>
/* ===== Page ===== */
.page {
  max-width: 920px;
  margin: 0 auto;
  padding: 32px 16px 64px;
}

/* ===== Title ===== */
.section-title {
  margin-bottom: 20px;
}
.section-title h1 {
  font-size: 22px;
  font-weight: 700;
}
.section-title .sub {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

/* ===== Card ===== */
.card {
  background: #ffffff;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.selector-card {
  margin-bottom: 28px;
}

/* ===== Selector ===== */
.selector {
  display: flex;
  gap: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

/* ===== Google Form Input ===== */
input,
textarea,
select {
  background: transparent;
  border: none;
  border-bottom: 2px solid #e5e7eb;
  padding: 8px 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s ease;
}
input:focus,
textarea:focus,
select:focus {
  border-bottom-color: #6366f1;
}
textarea {
  resize: none;
}

/* ===== Section ===== */
.form-section {
  background: #ffffff;
  border-radius: 14px;
  border-left: 6px solid #6366f1;
  padding: 22px;
  margin-bottom: 22px;
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.08);
}

.section-header {
  display: flex;
  flex-direction: column;   /* 핵심: 세로 정렬 */
  gap: 8px;                 /* 제목-설명 간격 */
}

/* 섹션 제목 */
.section-title-input {
  font-size: 20px;
  font-weight: 700;
  padding: 6px 4px;
}

/* 섹션 설명 */
.section-desc {
  font-size: 14px;
  color: #6b7280;
  padding: 6px 4px;
  line-height: 1.6;
  min-height: 28px;
  width: 60%;               /* 구글폼처럼 살짝 짧게 */
  border-bottom: 2px solid #e5e7eb;
}
.section-desc:focus {
  border-bottom-color: #6366f1;
  color: #374151;
}

/* ===== Question Card ===== */
.question-card {
  background: #f8fafc; /* Slightly darker than white section */
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #e2e8f0; /* Visible border */
  border-left: 4px solid #cbd5e1; /* Default left border */
  transition: all 0.2s ease;
}
.question-card:focus-within {
  background: #ffffff;
  border-color: #c7d2fe;
  border-left-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

/* ===== Question Head ===== */
.question-head {
  display: flex;
  gap: 14px;
  align-items: center;
}
.question-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
}
.question-type {
  width: 130px;
  font-size: 13px;
}

/* ===== Choice ===== */
.choice-list {
  margin-top: 14px;
}
.choice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.radio {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #9ca3af;
}
.choice-item input {
  flex: 1;
}

/* ===== Add Option / Question ===== */
.add-option,
.add-question {
  margin-top: 12px;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}
.add-option:hover,
.add-question:hover {
  text-decoration: underline;
}

/* ===== Score (Star Rating) ===== */
.score-box {
  margin-top: 18px;
}
.score-config {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.score-select {
  width: 72px;
}
.score-icon {
  font-size: 20px;
  color: #fbbf24;
}
.score-scale {
  display: flex;
  justify-content: space-between;
  max-width: 420px;
}
.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.score-num {
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
}
.score-star {
  font-size: 22px;
  color: #9ca3af;
}

/* ===== Text Question ===== */
.text-preview {
  margin-top: 14px;
  padding: 12px;
  border-radius: 10px;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 13px;
}

/* ===== Actions ===== */
.question-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}
.required-toggle {
  font-size: 13px;
  color: #374151;
  display: flex;
  gap: 6px;
  align-items: center;
  cursor: pointer;
}

.required-toggle input[type="checkbox"] {
  cursor: pointer;
  width: 15px;  /* 원하시는 16px 내외로 조정 */
  height: 15px;
  margin: 0;
  accent-color: #6366f1; /* 체크박스 포인트를 테마 색상으로 변경 (선택사항) */
  appearance: auto; /* 브라우저 기본 체크박스 형태 유지하면서 크기만 조절 */
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #6b7280;
}
.icon-btn:hover {
  color: #ef4444;
}

/* ===== Footer ===== */
.section-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ===== Buttons ===== */
.btn {
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}
.btn-primary {
  background: #6366f1;
  color: #ffffff;
}
.btn-primary:hover {
  background: #4f46e5;
}
.btn-danger {
  background: #fee2e2;
  color: #991b1b;
}
.btn-danger:hover {
  background: #fecaca;
}

/* ===== Add Section ===== */
.add-section {
  margin-top: 28px;
  text-align: center;
}

.cycle-status-notice {
  margin-top: 20px;
  padding: 18px 20px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px dashed #c7d2fe;
  color: #1e3a8a;
  font-size: 14px;
  line-height: 1.6;
}
</style>
