<template>
  <section class="page">
    <div class="page-header">
      <h1>휴가 정책 관리</h1>
    </div>

    <div class="content">
      <!-- 1. 사원별 연차 등록 -->
      <div class="grant-leave-card">
        <h2>사원별 연차 등록</h2>
        <form @submit.prevent="handleGrantLeave" class="policy-form">
          <div class="form-section">
            <label>부여 대상자 선택</label>
            <DepartmentEmployeeSelector 
          label="대상 및 부서 선택" 
          v-model="grantForm.targetEmployeeIds" 
          hint="연차를 부여할 사원들을 선택하세요." 
          :maxItems="50"
          :allowDeptSelection="true"
          valueField="empId"
        />
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label for="grantYear">부여 연도</label>
              <input type="number" id="grantYear" v-model.number="grantForm.grantYear" required min="2020">
            </div>
            <div class="form-field">
              <label for="grantDays">부여 일수</label>
              <input type="number" id="grantDays" v-model.number="grantForm.grantDays" required step="0.5" min="0.5">
            </div>
          </div>

          <div class="form-field mb-20">
            <label for="reason">부여 사유</label>
            <textarea id="reason" v-model="grantForm.reason" placeholder="예: 2026년 정기 연차 부여" rows="2" class="textarea-field"></textarea>
          </div>

          <div class="action-row">
            <button type="submit" class="btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '이동 중...' : '문서 등록' }}
            </button>
          </div>
        </form>
      </div>

      <!-- 2. 새 정책 등록 -->
      <div class="create-policy-card">
        <div class="card-header-with-action">
            <h2>{{ isEditPolicyMode ? '휴가 정책 수정' : '새 휴가 정책 등록' }}</h2>
            <div class="header-btns">
              <button v-if="isEditPolicyMode" class="btn-cancel-edit" @click="cancelEditMode">수정 취소</button>
              <button class="btn-outline-small" @click="showPolicyModal = true">정책 조회</button>
            </div>
        </div>
        <form @submit.prevent="handleCreatePolicy" class="policy-form">
          <div class="form-grid">
            <div class="form-field">
              <label for="typeName">정책명</label>
              <input type="text" id="typeName" v-model="newPolicy.typeName" required placeholder="예: 연차, 병가">
            </div>
            <div class="form-field">
              <label for="typeCode">정책 유형 코드</label>
              <input type="text" id="typeCode" v-model="newPolicy.typeCode" required placeholder="예: ANNUAL, SICK">
            </div>
            <div class="form-field">
              <label for="unitCode">차감 단위 코드</label>
              <select id="unitCode" v-model="newPolicy.unitCode" required>
                <option value="">선택</option>
                <option value="FULL">일차</option>
                <option value="HALF_AM">오전반차</option>
                <option value="HALF_PM">오후반차</option>
              </select>
            </div>
            <div class="form-field">
              <label for="unitDays">차감 일수</label>
              <input type="number" id="unitDays" v-model.number="newPolicy.unitDays" required step="0.1" min="0">
            </div>
          </div>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '처리중...' : (isEditPolicyMode ? '정책 수정' : '정책 생성') }}
          </button>
        </form>
      </div>
    </div>

    <!-- 3. 정책 목록 모달 -->
    <div v-if="showPolicyModal" class="modal-overlay" @click.self="showPolicyModal = false">
      <div class="modal-content policy-modal">
        <div class="modal-header">
            <h3>등록된 휴가 정책 목록</h3>
            <button class="close-btn" @click="showPolicyModal = false">✕</button>
        </div>
        <div class="modal-body">
            <div v-if="policies.length > 0" class="policy-card-grid">
              <div v-for="policy in policies" :key="policy.policyId" class="policy-card-item">
                <div class="policy-card-top">
                    <span class="policy-badge">{{ policy.typeCode }}</span>
                    <h4 class="policy-card-title">{{ policy.typeName }}</h4>
                </div>
                <div class="policy-card-info">
                  <div class="info-row">
                    <span class="info-label">용도:</span>
                    <span class="info-value">{{ policy.typeName }} 관리를 위한 기본 정책</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">차감 단위:</span>
                    <span class="info-value">{{ policy.unitCode === 'FULL' ? '일차 (1.0)' : policy.unitCode === 'HALF_AM' ? '오전반차 (0.5)' : '오후반차 (0.5)' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">차감 일수:</span>
                    <span class="info-value font-bold">{{ policy.unitDays }}일</span>
                  </div>
                  <div class="policy-card-actions">
                    <button class="btn-card-edit" @click="handleEditClick(policy)">수정</button>
                    <button class="btn-card-delete" @click="handleDeletePolicy(policy.policyId)">삭제</button>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="no-policies">
              등록된 휴가 정책이 없습니다.
            </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { getLeavePolicies, createLeavePolicy, updateLeavePolicy, deleteLeavePolicy } from '@/api/leaveApi'
import { fetchApprovalDocumentTypes } from '@/api/approvalApi'
import DepartmentEmployeeSelector from '@/components/approval/DepartmentEmployeeSelector.vue'

const router = useRouter()
const showPolicyModal = ref(false)

const authStore = useAuthStore()
const policies = ref([])
const newPolicy = ref({
  typeName: '',
  typeCode: '',
  unitCode: '',
  unitDays: 1,
})

const grantForm = ref({
  targetEmployeeIds: [],
  grantYear: new Date().getFullYear(),
  grantDays: 15,
  reason: '',
})
const docTypes = ref([])
const isEditPolicyMode = ref(false)
const editingPolicyId = ref(null)

const loadInitialData = async () => {
  await Promise.all([
    loadPolicies(),
    fetchDocTypes()
  ])
}

const fetchDocTypes = async () => {
    try {
        const response = await fetchApprovalDocumentTypes();
        docTypes.value = response.data?.data || [];
    } catch (error) {
        console.error('문서 유형을 불러오는 데 실패했습니다:', error);
    }
}

const loadPolicies = async () => {
  if (!authStore.user?.companyId) return; // ✅ 수정: user 객체 내에서 가져오기

  try {
    const response = await getLeavePolicies(authStore.user.companyId)
    policies.value = response.data.data || []
  } catch (error) {
    console.error('휴가 정책을 불러오는 중 오류 발생:', error)
    alert('휴가 정책을 불러오는 데 실패했습니다.')
  }
}

onMounted(loadInitialData)

const isSubmitting = ref(false);

const handleCreatePolicy = async () => {
  if (isSubmitting.value) return;
  if (!newPolicy.value.typeName || !newPolicy.value.typeCode || !newPolicy.value.unitCode) {
    alert('모든 필드를 입력해주세요.')
    return
  }

  isSubmitting.value = true;
  try {
    const payload = {
      ...newPolicy.value,
      companyId: authStore.user.companyId
    };

    if (isEditPolicyMode.value) {
      await updateLeavePolicy(editingPolicyId.value, payload)
      alert('휴가 정책이 수정되었습니다.')
    } else {
      await createLeavePolicy(payload)
      alert('새로운 휴가 정책이 생성되었습니다.')
    }

    resetPolicyForm()
    await loadPolicies() // 목록 새로고침
  } catch (error) {
    console.error('휴가 정책 처리 중 오류 발생:', error)
    const message = error.response?.data?.message || '처리에 실패했습니다.'
    alert(message)
  } finally {
    isSubmitting.value = false;
  }
}

const resetPolicyForm = () => {
  newPolicy.value = {
    typeName: '',
    typeCode: '',
    unitCode: '',
    unitDays: 1,
  }
  isEditPolicyMode.value = false
  editingPolicyId.value = null
}

const cancelEditMode = () => {
  resetPolicyForm()
}

const handleEditClick = (policy) => {
  newPolicy.value = {
    typeName: policy.typeName,
    typeCode: policy.typeCode,
    unitCode: policy.unitCode,
    unitDays: policy.unitDays
  }
  isEditPolicyMode.value = true
  editingPolicyId.value = policy.policyId
  showPolicyModal.value = false
  // Scroll to form?
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleDeletePolicy = async (policyId) => {
  if (!confirm('이 정책을 삭제하시겠습니까? 관련 데이터에 영향을 줄 수 있습니다.')) return

  isSubmitting.value = true
  try {
    await deleteLeavePolicy(policyId)
    alert('정책이 삭제되었습니다.')
    await loadPolicies()
  } catch (error) {
    console.error('정책 삭제 중 오류 발생:', error)
    alert(error.response?.data?.message || '정책 삭제에 실패했습니다.')
  } finally {
    isSubmitting.value = false
  }
}

const handleGrantLeave = async () => {
  if (isSubmitting.value) return;
  if (grantForm.value.targetEmployeeIds.length === 0) {
    alert('대상자를 선택해주세요.')
    return
  }
  if (grantForm.value.grantDays <= 0) {
    alert('등록 일수는 0보다 커야 합니다.')
    return
  }

  isSubmitting.value = true; // Protect navigation too
  try {
    // Redirect to Approval Create with query parameters
    const targetEmpId = grantForm.value.targetEmployeeIds[0]
    const title = `[연차등록] ${grantForm.value.grantYear}년도 연차 등록 - 대상 사원ID: ${targetEmpId}`
    const content = grantForm.value.reason || `${grantForm.value.grantYear}년도 연차 ${grantForm.value.grantDays}일 등록 건입니다.`
    
    const payload = {
      targetEmployeeId: targetEmpId,
      days: grantForm.value.grantDays,
      year: grantForm.value.grantYear
    }

    // Find LEAVE_GRANT doc type code
    let docType = 'LEAVE_GRANT'
    const found = docTypes.value.find(t => t.docType === 'LEAVE_GRANT' || t.name.includes('연차 부여'))
    if (found) docType = found.docType

    await router.push({
      path: '/approval/create',
      query: {
        type: docType,
        title: title,
        content: content,
        payload: JSON.stringify(payload)
      }
    })
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.pag.section-title h1 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.page-header p {
  font-size: 1rem;
  color: #64748b;
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.grant-leave-card,
.create-policy-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border: 1px solid #f1f5f9;
}

.card-header-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 0.75rem;
}

.card-header-with-action h2 {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
}

h2 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
  color: #334155;
  margin-top: 0;
}

.header-btns {
  display: flex;
  gap: 8px;
}

.btn-cancel-edit {
  padding: 8px 14px;
  background-color: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-cancel-edit:hover {
  background-color: #fecaca;
}

.no-policies {
  text-align: center;
  padding: 3rem;
  color: #000000;
  font-size: 1.1rem;
  font-weight: 700;
  background-color: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.policy-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
}

.form-section {
    margin-bottom: 1.25rem;
}

.form-section label,
.form-field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 0.5rem;
  display: block;
}

.form-field input,
.form-field select,
.textarea-field {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #334155;
  transition: all 0.2s;
}

.textarea-field {
    font-family: inherit;
    resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.textarea-field:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.mb-20 { margin-bottom: 20px; }

.action-row {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
}

.btn-primary {
  padding: 0.85rem 1.5rem;
  background-color: #3182f6;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(49, 130, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: #1b64da;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(49, 130, 246, 0.3);
}

.btn-primary:disabled {
    opacity: 0.5;
    background-color: #94a3b8;
    cursor: not-allowed;
    box-shadow: none;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
}

.modal-content.policy-modal {
    background: #f8fafc;
    width: 95%;
    max-width: 900px;
    border-radius: 24px;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
    font-size: 1.5rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #94a3b8;
    cursor: pointer;
    transition: color 0.2s;
}

.close-btn:hover {
    color: #475569;
}

.modal-body {
    padding: 32px;
    max-height: 70vh;
    overflow-y: auto;
}

.policy-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1.5rem;
}

.policy-card-item {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.policy-card-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #3182f6;
}

.policy-card-top {
    display: flex;
    align-items: center;
    gap: 12px;
}

.policy-badge {
    background: #eff6ff;
    color: #3b82f6;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.policy-card-title {
    font-size: 1.15rem;
    font-weight: 800;
    color: #1e293b;
    margin: 0;
}

.policy-card-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    color: #475569;
}

.info-label {
    font-weight: 500;
}

.info-value {
    color: #1e293b;
    font-weight: 700;
}

.font-bold {
    font-weight: 800;
    color: #3b82f6;
}

.policy-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-card-edit {
  padding: 6px 12px;
  background-color: #eff6ff;
  color: #3b82f6;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-card-edit:hover {
  background-color: #dbeafe;
}

.btn-card-delete {
  padding: 6px 12px;
  background-color: #fef2f2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-card-delete:hover {
  background-color: #fee2e2;
}

.btn-outline-small {
    padding: 8px 18px;
    background: transparent;
    border: 1.5px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 800;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-outline-small:hover {
    background-color: #f8fafc;
    border-color: #cbd5e1;
    color: #1e293b;
}
</style>
