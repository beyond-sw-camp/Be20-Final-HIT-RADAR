<template>
  <section class="page">
    <!-- ===== Hero Header ===== -->
    <div class="section-title">
      <div>
        <h1>등급 제도 관리</h1>
        <div class="sub">
          조직이 받은 등급에 따라 팀원 등급 배분 기준을 설정합니다
        </div>
      </div>
    </div>


    <div class="grid">
      <!-- =====================
           1) 회사 등급 관리
      ====================== -->
      <section class="card">
        <div class="card-head">
          <div>
            <h2>회사 등급(Grade) 관리</h2>
            <p class="muted">
              예: S / A / B / C 등 회사에서 사용하는 평가 등급을 등록합니다.
            </p>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span>{{ grades.length }}개 등급</span>
          </div>
        </div>

        <div class="table-wrap" v-if="grades.length">
          <table class="table">
            <thead>
            <tr>
              <th class="w-80">순서</th>
              <th>등급명</th>
              <th class="w-160 right">관리</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="g in sortedGrades" :key="g.gradeId">
              <td class="mono strong">{{ g.gradeOrder }}</td>
              <td>
                <span class="grade-chip">{{ g.gradeName }}</span>
              </td>
              <td class="right actions">
                <button class="btn btn-light" @click="startEditGrade(g)">수정</button>
                <button class="btn btn-danger" @click="removeGrade(g.gradeId)">삭제</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="empty">
          <div class="empty-icon">🏷️</div>
          <div>
            <p class="strong">등록된 등급이 없습니다.</p>
            <p class="muted small">아래 폼에서 등급을 먼저 추가해 주세요.</p>
          </div>
        </div>

        <!-- Grade Form -->
        <div class="divider"></div>

        <div class="form">
          <div class="field">
            <label>등급명</label>
            <input
              v-model.trim="gradeForm.gradeName"
              placeholder="예: S"
              maxlength="10"
            />
          </div>

          <div class="field">
            <label>등급 순서</label>
            <input
              type="number"
              v-model.number="gradeForm.gradeOrder"
              placeholder="숫자가 작을수록 상위"
              min="1"
            />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="submitGrade">
              {{ gradeEditMode ? '등급 수정' : '등급 등록' }}
            </button>
            <button v-if="gradeEditMode" class="btn btn-ghost" @click="resetGradeForm">
              취소
            </button>
          </div>

          <p class="hint" v-if="gradeHint">{{ gradeHint }}</p>
        </div>
      </section>

      <!-- =====================
           2) 회사 등급 분배 규정
      ====================== -->
      <section class="card">
        <div class="card-head">
          <div>
            <h2>등급 분배 규정(Policy)</h2>
            <p class="muted">
              <b>조직이 받은 등급</b>을 선택하고, 해당 등급일 때
              <b>팀원에게 부여할 등급별 최소/최대 비율</b>을 설정합니다.
            </p>
          </div>
        </div>

        <div v-if="!grades.length" class="empty">
          <div>
            <p class="strong">먼저 등급을 등록해 주세요.</p>
            <p class="muted small">등급이 있어야 분배 규정을 설정할 수 있어요.</p>
          </div>
        </div>

        <template v-else>
          <div class="policy-top">
            <div class="field">
              <label>조직이 받은 등급</label>
              <select v-model.number="teamGradeId" @change="loadPolicies">
                <option disabled value="">선택</option>
                <option
                  v-for="g in sortedGrades"
                  :key="g.gradeId"
                  :value="g.gradeId"
                >
                  {{ g.gradeName }}
                </option>
              </select>
            </div>

            <div class="summary" v-if="teamGradeId">
              <div class="summary-item">
                <span class="muted small">설정 대상</span>
                <span class="strong">
                  조직 등급: <span class="grade-chip">{{ gradeName(teamGradeId) }}</span>
                </span>
              </div>
              <div class="summary-item">
                <span class="muted small">최대합</span>
                <span class="mono strong">{{ totalMaxRatio }}%</span>
              </div>
              <div class="summary-item">
                <span class="muted small"> 최소합</span>
                <span class="mono strong">{{ totalMinRatio }}%</span>
              </div>
              <button class="btn btn-primary" @click="saveAllPolicies">
                전체 저장
              </button>
            </div>
          </div>

          <div class="table-wrap" v-if="teamGradeId">
            <table class="table">
              <thead>
              <tr>
                <th>팀원 등급</th>
                <th class="w-160">최소(%)</th>
                <th class="w-160">최대(%)</th>
                <th class="w-200 right">관리</th>
              </tr>
              </thead>

              <tbody>
              <tr v-for="row in policyRows" :key="row.memberGradeId">
                <td>
                  <div class="row-title">
                    <span class="grade-chip">{{ gradeName(row.memberGradeId) }}</span>
                    <!-- <span class="muted small">memberGradeId: {{ row.memberGradeId }}</span> -->
                  </div>
                </td>

                <td>
                  <div class="ratio">
                    <input
                      type="number"
                      v-model.number="row.minRatio"
                      min="0"
                      max="100"
                    />
                    <span class="muted">%</span>
                  </div>
                </td>

                <td>
                  <div class="ratio">
                    <input
                      type="number"
                      v-model.number="row.maxRatio"
                      min="0"
                      max="100"
                    />
                    <span class="muted">%</span>
                  </div>
                </td>

                <td class="right actions">
                  <button
                    v-if="row.policyId"
                    class="btn btn-danger"
                    @click="deletePolicy(row)"
                  >
                    삭제
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </template>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import {
  fetchCompanyGrades,
  createCompanyGrade,
  updateCompanyGrade,
  deleteCompanyGrade,
} from '@/api/gradeApi.js'
import {
  fetchDistributionPolicies,
  createDistributionPolicy,
  updateDistributionPolicy,
  deleteDistributionPolicy,
} from '@/api/teamGradeDistributionPolicyApi.js'

const saveAllPolicies = async () => {
  if (!teamGradeId.value) {
    alert('조직 등급을 먼저 선택해 주세요.')
    return
  }

  for (const row of policyRows.value) {
    if (!row.memberGradeId) continue

    // 0 / 0 은 저장 안 할 거면 통과
    if (row.minRatio === 0 && row.maxRatio === 0) continue

    const err = validateRatio(row.minRatio, row.maxRatio)
    if (err) {
      alert(`[${gradeName(row.memberGradeId)}] ${err}`)
      return
    }
  }

  for (const row of policyRows.value) {
    if (!row.memberGradeId) continue

    if (row.minRatio === 0 && row.maxRatio === 0) continue

    if (row.policyId) {
      // 수정
      await updateDistributionPolicy(row.policyId, {
        minRatio: row.minRatio,
        maxRatio: row.maxRatio,
      })
    } else {
      // 신규 등록
      await createDistributionPolicy(teamGradeId.value, {
        memberGradeId: row.memberGradeId,
        minRatio: row.minRatio,
        maxRatio: row.maxRatio,
      })
    }
  }

  alert('등급 분배 규정이 저장되었습니다.')
  await loadPolicies()
}


// =======================
// state
// =======================
const grades = ref([])

const gradeForm = ref({ gradeName: '', gradeOrder: null })
const gradeEditMode = ref(false)
const editingGradeId = ref(null)
const gradeHint = ref('')

const teamGradeId = ref(null)
const policyRows = ref([])

// =======================
// computed
// =======================
const sortedGrades = computed(() =>
  [...grades.value].sort((a, b) => (a.gradeOrder ?? 0) - (b.gradeOrder ?? 0))
)

const totalMaxRatio = computed(() =>
  policyRows.value.reduce((sum, r) => sum + (Number(r.maxRatio) || 0), 0)
)

const totalMinRatio = computed(() =>
  policyRows.value.reduce((sum, r) => sum + (Number(r.minRatio) || 0), 0)
)

// =======================
// helpers
// =======================
const gradeName = (id) =>
  grades.value.find(g => g.gradeId === Number(id))?.gradeName ?? '-'

// =======================
// load
// =======================
const loadGrades = async () => {
  const res = await fetchCompanyGrades()
  grades.value = res.data.data ?? []

  if (grades.value.length > 0 && !teamGradeId.value) {
    const topGrade = [...grades.value].sort(
      (a, b) => (a.gradeOrder ?? 0) - (b.gradeOrder ?? 0)
    )[0]

    teamGradeId.value = topGrade.gradeId
  }

  if (teamGradeId.value) {
    await loadPolicies()
  }
}
const loadPolicies = async () => {
  if (!teamGradeId.value) return

  const res = await fetchDistributionPolicies(teamGradeId.value)
  const policies = res.data.data ?? []

  // 모든 팀원 등급(= 회사 등급 목록) 기준으로 row 생성
  policyRows.value = sortedGrades.value.map(g => {
    const p = policies.find(x => x.memberGradeId === g.gradeId)
    return {
      memberGradeId: g.gradeId,
      policyId: p?.policyId ?? null,
      minRatio: p?.minRatio ?? 0,
      maxRatio: p?.maxRatio ?? 0,
    }
  })
}


// =======================
// grade actions
// =======================
const submitGrade = async () => {
  gradeHint.value = ''
  const name = (gradeForm.value.gradeName || '').trim()
  const order = gradeForm.value.gradeOrder

  if (!name || order == null) {
    gradeHint.value = '등급명과 순서를 입력해 주세요.'
    return
  }

  // 간단 프론트 중복 체크
  const dupName = grades.value.some(g =>
    g.gradeName === name && (!gradeEditMode.value || g.gradeId !== editingGradeId.value)
  )
  if (dupName) {
    gradeHint.value = '이미 존재하는 등급명입니다.'
    return
  }

  const dupOrder = grades.value.some(g =>
    g.gradeOrder === order && (!gradeEditMode.value || g.gradeId !== editingGradeId.value)
  )
  if (dupOrder) {
    gradeHint.value = '이미 사용 중인 등급 순서입니다.'
    return
  }

  if (gradeEditMode.value) {
    await updateCompanyGrade(editingGradeId.value, { gradeName: name, gradeOrder: order })
  } else {
    await createCompanyGrade({ gradeName: name, gradeOrder: order })
  }

  resetGradeForm()
  await loadGrades()
}

const startEditGrade = (g) => {
  gradeEditMode.value = true
  editingGradeId.value = g.gradeId
  gradeForm.value = { gradeName: g.gradeName, gradeOrder: g.gradeOrder }
}

const resetGradeForm = () => {
  gradeEditMode.value = false
  editingGradeId.value = null
  gradeForm.value = { gradeName: '', gradeOrder: null }
  gradeHint.value = ''
}

const removeGrade = async (id) => {
  if (!confirm('이 등급을 삭제하시겠습니까? 관련 정책이 있으면 영향이 있을 수 있어요.')) return
  await deleteCompanyGrade(id)

  policyRows.value = policyRows.value.filter(
    r => r.memberGradeId !== Number(id)
  )

  // 삭제한 등급이 현재 선택된 조직 등급이면 초기화
  if (Number(teamGradeId.value) === Number(id)) {
    teamGradeId.value = ''
    policyRows.value = []
  }
  await loadGrades()
}

// =======================
// policy actions
// =======================
const validateRatio = (min, max) => {
  const a = Number(min)
  const b = Number(max)
  if (Number.isNaN(a) || Number.isNaN(b)) return '비율은 숫자여야 합니다.'
  if (a < 0 || b > 100) return '비율은 0~100 사이여야 합니다.'
  if (a > b) return '최소 비율은 최대 비율보다 클 수 없습니다.'
  return null
}



const deletePolicy = async (row) => {
  if (!confirm('해당 규정을 삭제하시겠습니까?')) return
  await deleteDistributionPolicy(row.policyId)
  await loadPolicies()
}

onMounted(loadGrades)
</script>

<style scoped>
/* ===== Layout ===== */
.page{
  max-width: 1160px;
  margin: 0 auto;
  padding: 28px 18px 48px;
  color: #0f172a;
}
.grid{
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 18px;
}
@media (max-width: 980px){
  .grid{ grid-template-columns: 1fr; }
}

/* ===== Hero ===== */
.hero{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 16px;
  padding: 18px 18px 22px;
  border-radius: 18px;
  background:
    radial-gradient(1200px 350px at 20% 0%, rgba(99,102,241,.22), transparent 55%),
    radial-gradient(900px 300px at 80% 30%, rgba(16,185,129,.16), transparent 55%),
    linear-gradient(180deg, #0b1220 0%, #0b1220 100%);
  color: #e2e8f0;
  margin-bottom: 18px;
  border: 1px solid rgba(148,163,184,.18);
}
.badge{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #c7d2fe;
  background: rgba(99,102,241,.18);
  border: 1px solid rgba(99,102,241,.25);
  margin: 0 0 10px 0;
}
.hero h1{
  font-size: 10px;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}
.sub{
  margin: 0;
  color:#cbd5e1;
  font-size: 10px;
  line-height: 1.6;
}
.hero-actions{ display:flex; gap: 10px; }

/* ===== Card ===== */
.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}

.card-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.card h2, .card h3{
  margin: 0;
  font-size: 16px;
  letter-spacing: -0.01em;
}
.muted{ color:#64748b; }
.small{ font-size: 12px; }
.strong{ font-weight: 700; }
.mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* ===== Pills / Chips ===== */
.pill{
  display:inline-flex;
  align-items:center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 999px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color:#334155;
  font-size: 12px;
}
.dot{
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,.15);
}
.grade-chip{
  display:inline-flex;
  align-items:center;
  padding: 3px 10px;
  border-radius: 999px;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  color: #3730a3;
  font-weight: 600;
}

/* ===== Table ===== */
.table-wrap{
  border: 1px solid #eef2f7;
  border-radius: 14px;
  overflow: hidden;
}
.table{
  width: 100%;
  border-collapse: collapse;
}
.table thead th{
  background: #f8fafc;
  color:#475569;
  font-size: 12px;
  font-weight: 700;
  padding: 12px 12px;
  text-align: left;
  border-bottom: 1px solid #eef2f7;
}
.table tbody td{
  padding: 12px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.table tbody tr:hover td{
  background: #fbfdff;
}
.right{ text-align: right; }
.w-80{ width: 80px; }
.w-160{ width: 160px; }
.w-200{ width: 200px; }

.actions{
  display:flex;
  justify-content:flex-end;
  gap: 8px;
}
.row-title{
  display:flex;
  align-items:center;
  gap: 10px;
}

/* ===== Form ===== */
.divider{
  height: 1px;
  background: #eef2f7;
  margin: 14px 0;
}
.form{
  display:grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items:end;
}
@media (max-width: 980px){
  .form{ grid-template-columns: 1fr; }
}
.field{
  display:flex;
  flex-direction: column;
  gap: 6px;
}
.field label{
  font-size: 12px;
  color:#64748b;
  font-weight: 700;
}
input, select{
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 14px;
  outline: none;
  transition: box-shadow .15s ease, border-color .15s ease;
}
input:focus, select:focus{
  border-color: rgba(99,102,241,.7);
  box-shadow: 0 0 0 4px rgba(99,102,241,.15);
}
.form-actions{
  display:flex;
  gap: 8px;
  justify-content:flex-end;
}

/* ===== Policy top ===== */
.policy-top{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 12px;
}
@media (max-width: 980px){
  .policy-top{ flex-direction: column; align-items: stretch; }
}
.summary{
  display:flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content:flex-end;
  align-items: center;
}
.summary-item{
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  min-width: 140px;
}

/* ===== Ratio inputs ===== */
.ratio{
  display:flex;
  align-items:center;
  gap: 8px;
}
.ratio input{
  width: 110px;
}

/* ===== Buttons ===== */
.btn{
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  transition: transform .05s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
}
.btn:active{ transform: translateY(1px); }

.btn-primary {
  padding: 8px 16px;
  border-radius: 10px;
  background: #2563EB;
  color: #ffffff;
  border: none;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-outline {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
}

.btn-light{
  background: #ffffff;
  color:#111827;
  border-color:#e5e7eb;
}
.btn-light:hover{ background: #f8fafc; }

.btn-ghost{
  background: rgba(255,255,255,.08);
  color:#e2e8f0;
  border-color: rgba(226,232,240,.18);
}
.btn-ghost:hover{
  background: rgba(255,255,255,.12);
}

.btn-outline {
  padding: 8px 14px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
}

.hint{
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  color: #9a3412;
  font-size: 12px;
  font-weight: 700;
}

/* ===== Empty state ===== */
.empty{
  display:flex;
  align-items:center;
  gap: 12px;
  padding: 14px;
  border-radius: 14px;
  border: 1px dashed #e2e8f0;
  background: #fbfdff;
}
.empty-icon{
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display:flex;
  align-items:center;
  justify-content:center;
  background: #eef2ff;
  border: 1px solid #e0e7ff;
  font-size: 18px;
}

/* ===== Note ===== */
.note{
  padding: 10px 12px;
  background:#f8fafc;
  border-top: 1px solid #eef2f7;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title h1 {
  font-size: 20px;
  font-weight: 700;
}

.section-title .sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

</style>
