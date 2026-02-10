<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isViewMode ? '사원 상세 정보' : (isEditMode ? '사원 정보 수정' : '신규 사원 등록') }}</h3>
        <button class="close-btn" @click="close" type="button" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="form-grid">

          <!-- 공통 필수 정보 -->
          <div class="form-group">
            <label for="employeeNo">사번 <span class="required" v-if="!isViewMode">*</span></label>
            <input id="employeeNo" name="employeeNo" type="text" v-model="form.employeeNo" class="input" :required="!isEditMode && !isViewMode" :disabled="isEditMode || isViewMode" placeholder="예: EMP2024001" />
          </div>

          <div class="form-group">
            <label for="loginId">로그인 ID <span class="required" v-if="!isViewMode">*</span></label>
            <input id="loginId" name="loginId" type="text" v-model="form.loginId" class="input" :required="!isEditMode && !isViewMode" :disabled="isEditMode || isViewMode" placeholder="예: user01" />
          </div>

          <div class="form-group" v-if="!isEditMode && !isViewMode">
            <label for="password">비밀번호 <span class="required">*</span></label>
            <input id="password" name="password" type="password" v-model="form.password" class="input" required placeholder="초기 비밀번호" />
          </div>

          <div class="form-group">
            <label for="empName">이름 <span class="required" v-if="!isViewMode">*</span></label>
            <input id="empName" name="empName" type="text" v-model="form.name" class="input" :disabled="isViewMode" required />
          </div>

          <div class="form-group">
            <label for="email">이메일 <span class="required" v-if="!isViewMode">*</span></label>
            <input id="email" name="email" type="email" v-model="form.email" class="input" :disabled="isViewMode" required />
          </div>

          <div class="form-group">
            <label for="phoneNo">휴대전화</label>
            <input
              id="phoneNo"
              name="phoneNo"
              type="tel"
              v-model="form.phoneNo"
              class="input"
              :disabled="isViewMode"
              placeholder="010-0000-0000"
              @input="onPhoneInput"
              maxlength="13"
            />
          </div>

          <!-- 소속/직책 정보 -->
          <div class="form-group">
            <label for="deptId">부서</label>
            <select id="deptId" name="deptId" v-model="form.deptId" class="input" :disabled="isViewMode">
              <option :value="null">미배정</option>
              <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">
                {{ dept.deptName }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="positionId">직위</label>
            <select id="positionId" name="positionId" v-model="form.positionId" class="input" :disabled="isViewMode">
              <option :value="null">미배정</option>
              <option v-for="pos in positions" :key="pos.positionId" :value="pos.positionId">
                {{ pos.name || pos.positionName }}
              </option>
            </select>
          </div>

          <!-- Roles (Read-Only) -->
          <div class="form-group" v-if="targetEmp && targetEmp.roles && targetEmp.roles.length > 0">
            <label>부여된 역할</label>
            <div class="roles-display">
                <span v-for="role in targetEmp.roles" :key="role" class="role-badge">{{ role }}</span>
            </div>
          </div>

          <!-- 개인 상세 정보 -->
          <div class="form-group">
            <label for="gender">성별</label>
            <select id="gender" name="gender" v-model="form.gender" class="input" :disabled="isViewMode">
              <option value="">선택</option>
              <option value="MALE">남성</option>
              <option value="FEMALE">여성</option>
            </select>
          </div>

          <div class="form-group">
            <label for="birth">생년월일</label>
            <input id="birth" name="birth" type="date" v-model="form.birth" class="input" :disabled="isViewMode" />
          </div>

          <div class="form-group">
            <label for="hireDate">입사일</label>
            <input id="hireDate" name="hireDate" type="date" v-model="form.hireDate" class="input" :disabled="isViewMode" />
          </div>

          <div class="form-group" v-if="isEditMode || isViewMode">
            <label for="employmentType">고용 형태 (상태)</label>
            <ModernSelect
              v-if="isEditMode"
              v-model="form.employmentType"
              :options="statusOptions"
              :class="['status-select', getStatusClass(form.employmentType)]"
            />
            <input
              v-else
              type="text"
              class="input"
              :value="statusOptions.find(o => o.value === form.employmentType)?.label || form.employmentType"
              disabled
            />
          </div>

          <div class="form-group" v-if="isEditMode || isViewMode">
            <label for="exitDate">퇴사일</label>
            <input id="exitDate" name="exitDate" type="date" v-model="form.exitDate" class="input" :disabled="isViewMode" />
          </div>

          <div class="form-group" v-if="isEditMode || isViewMode">
            <label for="extNo">내선번호</label>
            <input id="extNo" name="extNo" type="text" v-model="form.extNo" class="input" :disabled="isViewMode" placeholder="예: 070-1234-5678" />
          </div>

          <div class="form-actions">
             <div class="form-actions-left">
               <button v-if="isEditMode" type="button" class="btn reset" @click="handleResetPassword" title="비밀번호를 1234로 초기화">
                 <i class="pi pi-refresh"></i> 비밀번호 초기화
               </button>
             </div>
             <div class="form-actions-right">
               <button type="button" class="btn secondary" @click="close">
                 {{ isViewMode ? '닫기' : '취소' }}
               </button>
               <button v-if="!isViewMode" type="submit" class="btn primary" :disabled="loading">
                 {{ loading ? '처리중...' : (isEditMode ? '저장' : '등록 완료') }}
               </button>
             </div>
           </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { createEmployee, updateEmployeeProfile, updateEmployeeAssignment } from '@/api/employeeApi'
import { resetUserPassword } from '@/api/userAccount'
import ModernSelect from '@/components/common/ModernSelect.vue'

const props = defineProps({
  visible: Boolean,
  editMode: Boolean,
  viewMode: Boolean,
  targetEmp: Object,
  departments: { type: Array, default: () => [] },
  positions: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const isEditMode = computed(() => props.editMode)
const isViewMode = computed(() => props.viewMode)

const form = ref({
  employeeNo: '',
  name: '',
  phoneNo: '', // normalized label
  loginId: '',
  email: '',
  password: '',
  deptId: null,
  positionId: null,
  gender: '',
  birth: '',
  hireDate: '',
  exitDate: '',
  extNo: '',
  employmentType: 'WORKING'
})

const statusOptions = [
  { label: '재직 (WORKING)', value: 'WORKING' },
  { label: '휴직 (LEAVE)', value: 'LEAVE' },
  { label: '퇴사 (RESIGNED)', value: 'RESIGNED' }
]

const getStatusClass = (status) => {
  if (status === 'WORKING') return 'status-working'
  if (status === 'LEAVE') return 'status-leave'
  if (status === 'RESIGNED') return 'status-resigned'
  return ''
}

// Initialize form when opening
watch(() => props.visible, (val) => {
  if (val) {
    if ((props.editMode || props.viewMode) && props.targetEmp) {
      // Load existing data for Edit/View
      const t = props.targetEmp
      form.value = {
        employeeNo: t.employeeNo || t.empNo,
        loginId: t.loginId,
        name: t.name,
        email: t.email,
        phoneNo: t.phoneNo || t.phone,
        deptId: t.deptId || null,
        positionId: t.positionId || null,
        gender: t.gender || '',
        birth: t.birth,
        hireDate: t.hireDate,
        exitDate: t.exitDate,
        extNo: t.extNo,
        employmentType: t.employmentType || 'WORKING'
      }
    } else {
      // Reset for Create
      form.value = {
        employeeNo: '',
        name: '',
        phoneNo: '',
        loginId: '',
        email: '',
        password: '',
        deptId: null,
        positionId: null,
        gender: '',
        birth: '',
        hireDate: '',
        exitDate: '',
        extNo: '',
        employmentType: 'WORKING'
      }
    }
  }
})

const onPhoneInput = (e) => {
  let val = e.target.value.replace(/[^0-9]/g, '')
  if (val.length > 3 && val.length <= 7) {
    val = val.replace(/(\d{3})(\d{1,4})/, '$1-$2')
  } else if (val.length >= 8) {
    val = val.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')
  }
  form.value.phoneNo = val
}

const close = () => {
  emit('close')
}

const handleResetPassword = async () => {
  if (!props.targetEmp || !props.targetEmp.accId) {
    alert('계정 정보를 찾을 수 없습니다.')
    return
  }

  if (!confirm(`${form.value.name} 님의 비밀번호를 초기화하시겠습니까?\n\n초기화 비밀번호: 1234\n\n⚠️ 해당 사원에게 즉시 비밀번호 변경을 안내해주세요.`)) {
    return
  }

  try {
    await resetUserPassword(props.targetEmp.accId)
    alert(`✅ ${form.value.name} 님의 비밀번호가 "1234"로 초기화되었습니다.\n\n사원에게 즉시 비밀번호를 변경하도록 안내해주세요.`)
  } catch (e) {
    console.error(e)
    const errorMsg = e.response?.data?.message || '비밀번호 초기화에 실패했습니다.'
    alert(`❌ ${errorMsg}`)
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    if (isEditMode.value) {
      // 1. 프로필 정보 수정 (기본 정보)
      const profilePromise = updateEmployeeProfile(props.targetEmp.empId, form.value)

      // 2. 인사 정보 수정 (부서, 직위, 사번) - 변경된 경우만
      let assignmentPromise = null
      const t = props.targetEmp
      const hasAssignmentChanges =
        form.value.deptId !== (t.deptId || null) ||
        form.value.positionId !== (t.positionId || null) ||
        form.value.employeeNo !== (t.employeeNo || t.empNo)

      if (hasAssignmentChanges) {
        const assignmentPayload = {
          deptId: form.value.deptId,
          positionId: form.value.positionId,
          employeeNo: form.value.employeeNo,
          eventReason: '사원 정보 수정', // 기본 사유
          effectiveDate: new Date().toISOString().split('T')[0]
        }
        assignmentPromise = updateEmployeeAssignment(props.targetEmp.empId, assignmentPayload)
      }

      // 병렬 실행
      const results = await Promise.all([
        profilePromise,
        ...(assignmentPromise ? [assignmentPromise] : [])
      ])

      const allSuccess = results.every(res => res.data && res.data.success)

      if (allSuccess) {
        alert('사원 정보가 성공적으로 수정되었습니다.')
        emit('success')
        close()
      } else {
        alert('일부 정보 수정에 실패했습니다.')
      }
    } else {
      // Create Logic
      // Backend expects 'phone' instead of 'phoneNo' for creation DTO
      const payload = { ...form.value, phone: form.value.phoneNo }
      const res = await createEmployee(payload)
      if(res.data && res.data.success) {
        alert('신규 사원이 등록되었습니다.')
        emit('success')
        close()
      }
    }
  } catch (e) {
    console.error(e)
    alert('처리 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 720px; /* Widened for 2 columns */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  overflow: hidden;
  max-height: 90vh; /* Prevent screen overflow */
  display: flex;
  flex-direction: column;
}

/* ... header ... */
.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* Prevent shrinking */
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e293b;
}

.close-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748b; /* Visible Slate-500 */
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover {
  background-color: #f1f5f9;
  color: #ef4444; /* Red on hover */
}

.modal-body {
  padding: 24px;
  overflow-y: auto; /* Scroll if needed */
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 2 Columns */
  gap: 16px 24px; /* RowGap ColGap */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
  font-weight: bold;
}

/* ... inputs ... */

.input {
  width: 100%;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  height: 42px; /* Fixed height for consistency */
  box-sizing: border-box;
  transition: border-color 0.2s;
  background-color: white; /* Ensure white bg */
  color: #1e293b;
  outline: none; /* Prevent focus outline */
}
/* Fix Autofill Yellow in Scoped Component */
.input:-webkit-autofill,
.input:-webkit-autofill:hover,
.input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0px 1000px white inset !important;
  transition: background-color 5000s ease-in-out 0s;
}
.input:focus {
  border-color: #3b82f6;
  outline: none;
}
.input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Custom Select Styling */
select.input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 32px; /* Space for arrow */
}

.form-actions {
  grid-column: 1 / -1; /* Span full width */
  display: flex;
  justify-content: space-between; /* Left and right sections */
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.form-actions-left {
  flex: 1;
  display: flex;
  gap: 10px;
}

.form-actions-right {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn.primary { background: var(--primary); color: white; }
.btn.secondary { background: #f3f4f6; color: var(--text-main); }
.btn.reset {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  transition: all 0.2s;
}
.btn.reset:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1);
}
.btn.reset i {
  font-size: 13px;
}
.btn:disabled { opacity: 0.7; cursor: not-allowed; }

.roles-display { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 0; }
.role-badge {
    background: #f1f5f9; color: #475569; font-size: 12px; padding: 4px 8px;
    border-radius: 4px; border: 1px solid #e2e8f0; font-weight: 500;
}

/* Colored Status Select */
.status-select { width: 100% !important; }
.status-select :deep(.select-trigger) {
    font-weight: 600;
    border-radius: 6px;
    height: 42px;
    font-size: 14px;
}
/* Working - Green */
.status-select.status-working :deep(.select-trigger) {
    background-color: #dcfce7;
    color: #15803d;
    border-color: #bbf7d0;
}
/* Leave - Yellow */
.status-select.status-leave :deep(.select-trigger) {
    background-color: #fef9c3;
    color: #a16207;
    border-color: #fde047;
}
/* Resigned - Red */
.status-select.status-resigned :deep(.select-trigger) {
    background-color: #fee2e2;
    color: #b91c1c;
    border-color: #fecaca;
}
</style>
