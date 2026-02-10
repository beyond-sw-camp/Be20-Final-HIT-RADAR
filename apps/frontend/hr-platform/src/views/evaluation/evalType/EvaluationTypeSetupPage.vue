<template>
  <section class="page">
    <!-- ===== Page Title (고정) ===== -->
    <div class="section-title">
      <div>
        <h1>평가 유형 관리</h1>
        <div class="sub">
          회사에서 사용하는 평가 유형을 정의하고,
          회차별로 적용할 평가 유형을 선택합니다.
        </div>
      </div>
    </div>

    <div class="grid">
      <!-- =====================
           1) 회사 평가 유형 정책
      ====================== -->
      <section class="card">
        <div class="card-head">
          <div>
            <h2>회사 평가 유형</h2>
            <p class="muted">
              회사 차원에서 사용할 평가 유형을 등록합니다.
            </p>
          </div>
          <div class="pill">
            <span class="dot"></span>
            <span>{{ companyTypes.length }}개 유형</span>
          </div>
        </div>

        <!-- 유형 목록 -->
        <div v-if="companyTypes.length" class="type-list">
          <div
            v-for="t in companyTypes"
            :key="t.evalTypeId"
            class="type-item"
          >
            <!-- 왼쪽: 이름 / 수정 인풋 -->
            <div class="type-left">
              <input
                v-if="editingTypeId === t.evalTypeId"
                v-model="editingTypeName"
                class="edit-input"
              />
              <span
                v-else
                class="type-name"
              >
                {{ t.typeName }}
              </span>
            </div>

            <!-- 오른쪽: 액션 버튼 -->
            <div class="type-actions">
              <button
                v-if="editingTypeId !== t.evalTypeId"
                class="btn btn-light btn-sm"
                @click="startEdit(t)"
              >
                수정
              </button>

              <button
                v-else
                class="btn btn-primary btn-sm"
                @click="submitEdit(t.evalTypeId)"
              >
                저장
              </button>

              <button
                class="btn btn-danger btn-sm"
                @click="removeType(t.evalTypeId)"
              >
                삭제
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty">
          <p class="strong">등록된 평가 유형이 없습니다.</p>
          <p class="muted small">아래에서 평가 유형을 추가하세요.</p>
        </div>

        <!-- 유형 생성 -->
        <div class="divider"></div>

        <div class="form">
          <div class="field">
            <label>평가 유형명</label>
            <input
              v-model.trim="newTypeName"
              placeholder="예: 동료 평가"
              @keyup.enter="addType"
            />
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" @click="addType">
              평가 유형 추가
            </button>
          </div>
        </div>
      </section>

      <!-- =====================
           2) 회차별 평가 유형 적용 (아직 UI만)
      ====================== -->
      <section class="card">
        <div class="card-head">
          <div>
            <h2>회차별 평가 유형 설정</h2>
            <p class="muted">
              선택한 회차에 포함할 평가 유형을 지정합니다.
            </p>
          </div>
        </div>

        <div class="field">
          <label>평가 회차</label>
          <select v-model="selectedCycleId">
            <option disabled value="">회차 선택</option>
            <option
              v-for="c in cycles"
              :key="c.cycleId"
              :value="c.cycleId"
            >
              {{ c.cycleName }}
            </option>
          </select>
        </div>

        <div v-if="!selectedCycleId" class="empty mt">
          <p class="strong">회차를 먼저 선택해 주세요.</p>
          <p class="muted small">
            회차 선택 후 평가 유형을 적용할 수 있습니다.
          </p>
        </div>

        <div v-else class="checkbox-group">
          <label
            v-for="t in companyTypes"
            :key="t.evalTypeId"
            class="checkbox-item"
          >
            <input
              type="checkbox"
              v-model="selectedTypeIds"
              :value="t.evalTypeId"
            />
            <span class="checkbox-label">
              {{ t.typeName }}
            </span>
          </label>
        </div>

        <div class="actions" v-if="selectedCycleId">
          <button
            class="btn btn-primary"
            @click="applyToCycle"
          >
            회차에 적용
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// 평가 유형(회사 정책) API
import {
  fetchEvaluationTypes,
  createEvaluationType,
  deleteEvaluationType,
  updateEvaluationType,
} from '@/api/evaluationTypeApi'

// 회차 API
import { fetchCycles } from '@/api/cycleApi'

// 회차별 평가 유형 API
import {
  fetchCycleEvaluationTypes,
  saveCycleEvaluationTypes,
} from '@/api/cycleEvaluationTypeApi'


// 상태
const companyTypes = ref([])
const cycles = ref([])

const newTypeName = ref('')
const selectedCycleId = ref('')
const selectedTypeIds = ref([])

// 수정 상태
const editingTypeId = ref(null)
const editingTypeName = ref('')


// 회사 평가 유형 목록 조회
const loadEvaluationTypes = async () => {
  const res = await fetchEvaluationTypes()
  companyTypes.value = res.data.data ?? []
}

// 회차 목록 조회
const loadCycles = async () => {
  const res = await fetchCycles()
  cycles.value = res.data.data ?? res.data
}


// 최초 로드
onMounted(() => {
  loadEvaluationTypes()
  loadCycles()
})


// 평가 유형 추가
const addType = async () => {
  if (!newTypeName.value.trim()) return

  await createEvaluationType({
    typeName: newTypeName.value.trim(),
  })

  newTypeName.value = ''
  await loadEvaluationTypes()
}


// 삭제
const removeType = async (evalTypeId) => {
  if (!confirm('이 평가 유형을 삭제하시겠습니까?')) return

  await deleteEvaluationType(evalTypeId)
  await loadEvaluationTypes()

  // 체크된 상태에서도 제거
  selectedTypeIds.value = selectedTypeIds.value.filter(
    id => id !== evalTypeId
  )
}


// 수정 시작
const startEdit = (t) => {
  editingTypeId.value = t.evalTypeId
  editingTypeName.value = t.typeName
}

// 수정 저장
const submitEdit = async (evalTypeId) => {
  if (!editingTypeName.value.trim()) return

  await updateEvaluationType(evalTypeId, {
    typeName: editingTypeName.value.trim(),
  })

  editingTypeId.value = null
  editingTypeName.value = ''
  await loadEvaluationTypes()
}


// 회차 선택 시 평가 유형 미리 확인
watch(selectedCycleId, async (cycleId) => {
  if (!cycleId) {
    selectedTypeIds.value = []
    return
  }

  const res = await fetchCycleEvaluationTypes(cycleId)
  const list = res.data.data ?? []

  selectedTypeIds.value = list.map(v => v.evalTypeId)
})


// 회차에 평가 유형 적용
const applyToCycle = async () => {
  if (!selectedCycleId.value) return

  await saveCycleEvaluationTypes(selectedCycleId.value, {
    evalTypeIds: selectedTypeIds.value,
  })

  alert('회차별 평가 유형이 저장되었습니다.')
}
</script>


<style scoped>
/* ===== Layout ===== */
.page{
  max-width: 1160px;
  margin: 0 auto;
  padding: 40px 24px;
}
.section-title {
  margin-bottom: 24px;
}
.section-title h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 6px;
}
.sub {
  color: #64748b;
  font-size: 14px;
}

.grid{
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
}
@media (max-width: 980px){
  .grid{ grid-template-columns: 1fr; }
}

/* ===== Card ===== */
.card{
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}
.card-head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.card h2{
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
.muted{ color:#64748b; font-size: 13px; margin: 0; }
.small{ font-size:12px; }
.strong{ font-weight:600; color: #334155; }

/* ===== Pills ===== */
.pill{
  display:flex;
  gap:6px;
  align-items:center;
  font-size:12px;
  font-weight: 500;
  padding:4px 12px;
  border-radius:999px;
  background:#eff6ff;
  color: #3b82f6;
  border:1px solid #dbeafe;
}
.dot{
  width:6px;
  height:6px;
  border-radius:50%;
  background:#3b82f6;
}

/* ===== Type list ===== */
.type-list{
  display:flex;
  flex-direction:column;
  gap:10px;
}
.type-item{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 16px;
  border-radius: 12px;
  background:#f8fafc;
  border:1px solid #f1f5f9;
  transition: all 0.2s ease;
}
.type-item:hover {
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.type-name{
  font-weight:500;
  color: #334155;
  font-size: 14px;
}

/* ===== Form ===== */
.divider{
  height:1px;
  background:#f1f5f9;
  margin:20px 0;
}
.field{
  display:flex;
  flex-direction:column;
  gap:6px;
  margin-top: 16px;
}
.field:first-child { margin-top: 0; }

label{
  font-size:12px;
  font-weight:600;
  color:#475569;
}
input, select{
  height:42px;
  padding:0 14px;
  border-radius:10px;
  border:1px solid #e2e8f0;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
  background-color: #fff;
}
input:focus, select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions{
  display:flex;
  justify-content:flex-end;
  margin-top: 16px;
}

/* ===== Checkbox ===== */
.checkbox-group{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:16px;
}
.checkbox-item{
  display:flex;
  gap:10px;
  align-items:center;
  padding:12px 16px;
  border-radius:12px;
  border:1px solid #e2e8f0;
  background:#fff;
  cursor: pointer;
  transition: all 0.2s;
}
.checkbox-item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
.checkbox-item:has(input:checked) {
  border-color: #3b82f6;
  background: #eff6ff;
}

.checkbox-label{
  font-size: 14px;
  font-weight:500;
  color: #334155;
  user-select: none;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #3b82f6;
  cursor: pointer;
}

/* ===== Buttons ===== */
.actions{
  display:flex;
  justify-content:flex-end;
  margin-top:24px;
}
.btn{
  height:40px;
  padding:0 16px;
  border-radius:10px;
  border:1px solid transparent;
  cursor:pointer;
  font-weight:600;
  font-size: 14px;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn:active{ transform: translateY(1px); }

.btn-primary{
  background: #4f46e5;
  color: #ffffff;
}
.btn-primary:hover{
  background: #4338ca;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
}
.btn-danger{
  background: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
}
.btn-danger:hover{
  background: #fecaca;
  color: #b91c1c;
}
.btn-sm{
  height:30px;
  padding: 0 10px;
  font-size:12px;
  border-radius: 8px;
}

/* ===== Empty ===== */
.empty{
  padding:32px;
  text-align: center;
  border-radius:12px;
  border:1px dashed #cbd5e1;
  background:#f8fafc;
}
.mt{ margin-top:20px; }

.type-left{
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.type-actions{
  display: flex;
  gap: 6px;
}

.edit-input{
  height: 32px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  font-size: 13px;
  width: 100%;
  max-width: 200px;
}

.btn-light{
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
}
.btn-light:hover{
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

</style>
