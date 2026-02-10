<template>
  <section>
    <div class="section-title">
      <div>
        <h1>인사 발령 수행</h1>
      </div>
    </div>

    <div class="grid cols-2">
      <!-- Target Info -->
      <BaseCard>
        <div class="card-hd">
          <h2>대상자 정보</h2>
        </div>
        <div class="card-bd">
          <div v-if="loading" class="text-center py-4">대상자를 불러오는 중...</div>
          <div v-else-if="selectedEmp" class="profile-summary">
            <div class="avatar-lg">
              <i class="pi pi-user"></i>
            </div>
            <div class="info">
              <h3 class="name">{{ selectedEmp.name }}</h3>
              <p class="meta">
                현재 부서: <b class="highlight">{{ selectedEmp.deptName || '부서미정' }}</b><br/>
                현재 직위: <b class="highlight">{{ selectedEmp.posName || '직위미정' }}</b>
              </p>
            </div>
          </div>
        </div>
      </BaseCard>

      <!-- Appointment Form -->
      <BaseCard>
        <div class="card-hd">
          <h2>발령 설정</h2>
        </div>
        <div class="card-bd">
          <form @submit.prevent="submitAppointment" class="formgrid">
            <div class="form-group">
              <div class="label">발령 부서</div>
              <select v-model="form.deptId" class="select" required>
                <option value="" disabled>부서 선택</option>
                <option v-for="d in departments" :key="d.deptId" :value="d.deptId">
                  {{ d.deptName }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <div class="label">발령 직위</div>
              <select v-model="form.positionId" class="select" required>
                <option value="" disabled>직위 선택</option>
                <option v-for="p in positions" :key="p.positionId" :value="p.positionId">
                  {{ p.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <div class="label">사번 변경 (옵션)</div>
              <input type="text" v-model="form.employeeNo" class="input" placeholder="변경할 사번 입력" />
            </div>

            <div class="form-group">
              <div class="label">발령 시행일</div>
              <input type="date" v-model="form.effectiveDate" class="input" required />
            </div>

            <div class="form-group full">
              <div class="label">발령 사유</div>
              <textarea v-model="form.eventReason" class="textarea" placeholder="발령 사유를 입력하세요" required></textarea>
            </div>

            <div class="form-actions">
              <button type="button" class="btn ghost" @click="$router.back()">취소</button>
              <button type="submit" class="btn primary" :disabled="submitting">
                {{ submitting ? '처리 중...' : '발령 확정' }}
              </button>
            </div>
          </form>
        </div>
      </BaseCard>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/common/BaseCard.vue'
import { fetchEmployeeDetail, updateEmployeeAssignment } from '@/api/employeeApi'
import { getAllDepartmentsByCompany } from '@/api/departmentApi'
import { fetchPositions } from '@/api/positionApi'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const submitting = ref(false)
const selectedEmp = ref(null)
const departments = ref([])
const positions = ref([])

const form = ref({
  deptId: '',
  positionId: '',
  employeeNo: '',
  eventReason: '',
  effectiveDate: new Date().toISOString().substring(0, 10)
})

onMounted(async () => {
  const empId = route.query.empId
  if (!empId) {
    alert('대상 사원이 없습니다.')
    router.push('/employee')
    return
  }

  loading.value = true
  await Promise.all([
    loadEmployee(empId),
    loadDepartments(),
    loadPositions()
  ])
  loading.value = false
})

const loadEmployee = async (id) => {
  try {
    const res = await fetchEmployeeDetail(id)
    if (res.data?.data) {
      selectedEmp.value = res.data.data
      form.value.deptId = res.data.data.deptId || ''
      form.value.positionId = res.data.data.positionId || ''
      form.value.employeeNo = res.data.data.employeeNo || ''
    }
  } catch (e) {
    console.error('Fetch Target Failed', e)
  }
}

const loadPositions = async () => {
  try {
    const res = await fetchPositions()
    positions.value = res.data?.data?.positions || []
  } catch (e) { console.error(e) }
}

const loadDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany()
    departments.value = res.data.data.departments || res.data.data || []
  } catch (e) { console.error(e) }
}

const submitAppointment = async () => {
  if (!confirm(`${selectedEmp.value.name} 님의 인사를 발령하시겠습니까?`)) return

  submitting.value = true
  try {
    const targetId = selectedEmp.value.empId || selectedEmp.value.id || selectedEmp.value.userId
    await updateEmployeeAssignment(targetId, form.value)
    
    alert('인사 발령이 완료되었습니다.')
    router.push({ path: '/personnel/history', query: { empId: targetId } })
  } catch (e) {
    console.error('Update Failed', e)
    alert('인사 발령 중 오류가 발생했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}
.avatar-lg {
  width: 80px;
  height: 80px;
  background: var(--primary-soft);
  color: var(--primary);
  border-radius: 24px;
  display: grid;
  place-items: center;
  font-size: 32px;
  margin-bottom: 20px;
}
.info .name { font-size: 20px; font-weight: 800; color: var(--text-main); margin-bottom: 12px; }
.info .meta { font-size: 14px; color: var(--text-sub); line-height: 1.8; }
.highlight { color: var(--text-main); }

.formgrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.full { grid-column: span 2; }

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid var(--border);
  padding-top: 20px;
}

.text-center { text-align: center; }
.py-4 { padding: 16px 0; }

/* Standard inputs */
.input, .select, .textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
  background: white;
  box-sizing: border-box;
}
.input, .select { height: 42px; }
.textarea { min-height: 100px; resize: vertical; }

.input:focus, .select:focus, .textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Fix Autofill Yellow */
.input:-webkit-autofill, .input:-webkit-autofill:hover, .input:-webkit-autofill:focus,
.select:-webkit-autofill, .select:-webkit-autofill:hover, .select:-webkit-autofill:focus,
.textarea:-webkit-autofill, .textarea:-webkit-autofill:hover, .textarea:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.section-title h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}

.card-hd h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}
</style>
