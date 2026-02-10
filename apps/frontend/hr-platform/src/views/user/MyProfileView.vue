<template>
  <section class="narrow-container">
    <div class="section-title">
      <div class="header-content">
        <h1>내 정보 조회</h1>
      </div>
      <div class="actions">
        <template v-if="!isEditMode">
          <button class="btn btn-primary" @click="isEditMode = true">
            <i class="pi pi-user-edit"></i> 정보 수정
          </button>
        </template>
        <template v-else>
          <button class="btn btn-ghost" @click="cancelEdit">취소</button>
          <button class="btn btn-primary" @click="saveProfile">
            <i class="pi pi-check"></i> 저장
          </button>
        </template>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>정보를 불러오는 중입니다...</p>
    </div>
    <div v-else-if="!employee" class="error-state">
      <i class="pi pi-exclamation-triangle"></i>
      <p>사원 정보를 찾을 수 없습니다.</p>
    </div>

    <div v-else class="content-wrapper">
      <!-- Profile Card -->
      <div class="card profile-card">
        <div class="profile-header">
          <div class="avatar-area">
            <div class="avatar-lg">
              <img v-if="employee.image" :src="resolveFileUrl(employee.image)" alt="Profile" />
              <i v-else class="pi pi-user"></i>
            </div>
            
            <input 
              type="file" 
              ref="fileInputRef" 
              style="display: none" 
              accept="image/*" 
              @change="handleFileChange"
            />
            
            <button v-if="isEditMode" class="btn-xs btn-outline mt-2" @click="triggerFileUpload">
              <i class="pi pi-camera"></i> 사진 변경
            </button>
          </div>
          
          <div class="basic-info">
            <h2 v-if="!isEditMode" class="emp-name">{{ employee.name }}</h2>
            <input v-else v-model="form.name" class="input name-input" placeholder="이름 입력" maxlength="50" />
            <!-- 사번 및 입사일 (위로 이동) -->
            <div class="emp-meta">
              <span v-if="employee.employeeNo">{{ employee.employeeNo }}</span>
              <span v-if="employee.employeeNo && employee.hireDate" class="separator">·</span>
              <span v-if="employee.hireDate">입사일 {{ employee.hireDate }}</span>
            </div>

            <!-- 메타 정보 그리드 (자로 잰 듯한 정렬) -->
            <div class="profile-meta-grid">
              <div :class="['meta-item', { readonly: isEditMode }]">
                <span class="meta-label">직위</span>
                <div class="meta-value">
                  <span v-if="employee.positionName" class="badge position">{{ employee.positionName }}</span>
                  <span v-else class="text-gray">-</span>
                </div>
              </div>
              
              <div :class="['meta-item', { readonly: isEditMode }]">
                <span class="meta-label">부서</span>
                <div class="meta-value">
                  <span v-if="employee.deptName" class="badge dept">{{ employee.deptName }}</span>
                  <span v-else class="text-gray">-</span>
                </div>
              </div>

              <div class="meta-item">
                <span class="meta-label">상태</span>
                <div class="meta-value">
                   <span v-if="!isEditMode" :class="['badge status', getStatusClass(employee.employmentType)]">
                     {{ employmentTypeMap[employee.employmentType] || employee.employmentType || '상태미정' }}
                   </span>
                   <ModernSelect 
                     v-else 
                     v-model="form.employmentType" 
                     :options="statusOptions"
                     :class="['status-select', getStatusClass(form.employmentType)]"
                   />
                </div>
              </div>

              <div :class="['meta-item', { readonly: isEditMode }]">
                <span class="meta-label">권한</span>
                <div class="meta-value role-badges">
                  <template v-if="employee.roles && employee.roles.length > 0">
                    <span v-for="role in employee.roles" :key="role" class="badge role">
                      {{ role }}
                    </span>
                  </template>
                  <span v-else class="badge role">일반 사용자</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="detail-grid">
          <div class="grid-section full-width-section">
            <h3><i class="pi pi-info-circle"></i> 상세 정보</h3>
            
            <div class="field-grid-container">
              <!-- Row 1 -->
              <div :class="['field-item', { readonly: isEditMode }]">
                <div class="label">로그인 ID</div>
                <div class="value">{{ employee.loginId || '-' }}</div>
              </div>
              <div class="field-item">
                <div :class="['label', { required: isEditMode }]">이메일</div>
                <div v-if="!isEditMode" class="value">{{ employee.email || '-' }}</div>
                <input v-else type="email" v-model="form.email" class="input" placeholder="example@company.com" maxlength="150" />
              </div>

              <!-- Row 2 -->
              <div class="field-item">
                <label for="phoneNo" :class="{ required: isEditMode }">휴대전화</label>
                <div v-if="!isEditMode" class="value">{{ employee.phoneNo || '-' }}</div>
                <input v-else id="phoneNo" name="phoneNo" v-model="form.phoneNo" class="input" placeholder="010-0000-0000" maxlength="15" />
              </div>
              <div class="field-item">
                <label for="extNo">내선번호</label>
                <div v-if="!isEditMode" class="value">{{ employee.extNo || '-' }}</div>
                <input v-else id="extNo" name="extNo" v-model="form.extNo" class="input" placeholder="내선번호 입력" maxlength="15" />
              </div>

              <!-- Row 3 -->
              <div class="field-item">
                <label for="birth" :class="{ required: isEditMode }">생년월일</label>
                <div v-if="!isEditMode" class="value">{{ employee.birth || '-' }}</div>
                <input v-else id="birth" name="birth" v-model="form.birth" class="input" placeholder="YYYYMMDD" maxlength="8" />
              </div>
              <div class="field-item">
                <label for="gender" :class="{ required: isEditMode }">성별</label>
                <div v-if="!isEditMode" class="value">{{ genderMap[employee.gender] || employee.gender || '-' }}</div>
                <select v-else id="gender" name="gender" v-model="form.gender" class="input">
                  <option value="" disabled>선택하세요</option>
                  <option value="MALE">남성</option>
                  <option value="FEMALE">여성</option>
                </select>
              </div>

              <!-- Memo (Full Width) -->
              <div class="field-item full-width">
                <div class="label">비고</div>
                <div v-if="!isEditMode" class="value note-value">{{ employee.note || '-' }}</div>
                <div v-else class="w-full">
                  <textarea 
                    id="note" 
                    name="note" 
                    v-model="form.note" 
                    class="input note-input" 
                    placeholder="비고 사항 입력 (최대 1000자)" 
                    maxlength="1000"
                  ></textarea>
                  <div class="char-count">{{ form.note ? form.note.length : 0 }} / 1000</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Password Change Card -->
      <div class="card password-card">
        <h3><i class="pi pi-lock"></i> 비밀번호 변경</h3>
        <p class="info-text">보안을 위해 3개월마다 비밀번호를 변경하는 것을 권장합니다.</p>
        
        <div class="password-form">
          <div class="form-row">
            <div class="field-group">
              <label for="currentPassword">현재 비밀번호</label>
              <input id="currentPassword" name="currentPassword" v-model="pwForm.currentPassword" class="input" type="password" placeholder="현재 비밀번호" />
            </div>
            <div class="field-group">
              <label for="newPassword">새 비밀번호</label>
              <input id="newPassword" name="newPassword" v-model="pwForm.newPassword" class="input" type="password" placeholder="영문, 숫자, 특수문자 포함 8자 이상" />
            </div>
            <div class="field-group">
              <label for="confirmPassword">새 비밀번호 확인</label>
              <input id="confirmPassword" name="confirmPassword" v-model="pwForm.confirmPassword" class="input" type="password" placeholder="새 비밀번호 확인" />
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-warning" @click="handlePasswordChange" :disabled="pwLoading">
              <i v-if="pwLoading" class="pi pi-spin pi-spinner"></i>
              {{ pwLoading ? '변경 중...' : '비밀번호 변경' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { fetchEmployeeDetail, updateEmployeeProfile, uploadEmployeeProfileImage } from '@/api/employeeApi'
import { resolveFileUrl } from '@/utils/fileUrl'
import { changeMyPassword } from '@/api/userAccount'
import { useAuthStore } from '@/stores/authStore'

import ModernSelect from '@/components/common/ModernSelect.vue'

const authStore = useAuthStore()

const empId = computed(() => authStore.user?.employeeId)
const loading = ref(false)
const employee = ref(null)
const isEditMode = ref(false)

const genderMap = {
  'MALE': '남성',
  'FEMALE': '여성'
}

const statusOptions = [
  { label: '재직 (WORKING)', value: 'WORKING' },
  { label: '휴직 (LEAVE)', value: 'LEAVE' },
  { label: '퇴사 (RESIGNED)', value: 'RESIGNED' }
]

const employmentTypeMap = {
  'WORKING': '재직',
  'LEAVE': '휴직',
  'RESIGNED': '퇴사'
}

const getStatusClass = (status) => {
  if (status === 'WORKING') return 'status-working'
  if (status === 'LEAVE') return 'status-leave'
  if (status === 'RESIGNED') return 'status-resigned'
  return ''
}

const form = reactive({
  name: '',
  email: '',
  extNo: '',
  phoneNo: '',
  note: '',
  birth: '',
  gender: '',
  employmentType: ''
})

const pwForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const pwLoading = ref(false)

const loadData = async () => {
    if (!empId.value) return
    loading.value = true
    try {
        const res = await fetchEmployeeDetail(empId.value)
        if(res.data && res.data.success) {
            employee.value = res.data.data
            syncForm()
        }
    } catch(e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const syncForm = () => {
    if(!employee.value) return
    form.name = employee.value.name || ''
    form.email = employee.value.email || ''
    form.extNo = employee.value.extNo || ''
    form.phoneNo = employee.value.phoneNo || ''
    form.note = employee.value.note || ''
    form.birth = employee.value.birth || ''
    form.gender = employee.value.gender || ''
    form.employmentType = employee.value.employmentType || 'WORKING' // Default or fetch from API
}

const cancelEdit = () => {
    isEditMode.value = false
    syncForm()
}

const fileInputRef = ref(null)

const triggerFileUpload = () => {
    fileInputRef.value.click()
}

const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 유효성 검사 (이미지, 5MB)
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.')
        return
    }
    if (file.size > 5 * 1024 * 1024) {
        alert('파일 크기는 5MB를 초과할 수 없습니다.')
        return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
        const res = await uploadEmployeeProfileImage(empId.value, formData)
        if (res.data && res.data.success) {
            // 이미지 즉시 업데이트
            const newUrl = res.data.data
            employee.value.image = newUrl
            form.image = newUrl // Update form as well
            
            // AuthStore 정보 갱신 (헤더 등 전역 반영)
            if (authStore.user) {
                authStore.user.image = newUrl
                localStorage.setItem('user', JSON.stringify(authStore.user))
            }

            alert('프로필 사진이 변경되었습니다.')
        }
    } catch (e) {
        console.error(e)
        alert('사진 업로드 실패: ' + (e.response?.data?.message || '오류 발생'))
    } finally {
        // 인풋 초기화 (동일 파일 재선택 가능하게)
        event.target.value = ''
    }
}

const saveProfile = async () => {
    // 필수값 검증
    if (!form.name) { alert('이름을 입력해주세요.'); return }
    if (!form.email) { alert('이메일을 입력해주세요.'); return }
    if (!form.phoneNo) { alert('휴대전화를 입력해주세요.'); return }
    if (!form.birth) { alert('생년월일을 입력해주세요.'); return }
    if (!form.gender) { alert('성별을 선택해주세요.'); return }

    if(!confirm('정보를 수정하시겠습니까?')) return

    // 빈 문자열을 null로 변환하여 전송 (Enum 타입 바인딩 오류 방지)
    const payload = { ...form }
    // if (!payload.gender) payload.gender = null -> 위에서 필수값 체크하므로 생략 가능하나 안전장치 유지
    if (!payload.gender) payload.gender = null

    try {
        const res = await updateEmployeeProfile(empId.value, payload)
        if(res.data && res.data.success) {
            alert('저장되었습니다.')
            // 응답 데이터에 이미지가 포함되어 있다면 갱신, 아니면 유지
            const updated = res.data.data
            // 이미지는 별도 업로드이므로 기존 값 유지하거나 서버가 최신값 주면 갱신
            employee.value = { ...employee.value, ...updated } 
            
            syncForm()
            isEditMode.value = false
        }
    } catch(e) {
        console.error(e)
        alert('저장 실패: ' + (e.response?.data?.message || e.message))
    }
}

const handlePasswordChange = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
        alert('모든 필드를 입력해주세요.')
        return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.')
        return
    }
    if (!confirm('비밀번호를 변경하시겠습니까? 변경 후에는 다시 로그인해야 할 수 있습니다.')) return

    pwLoading.value = true
    try {
        await changeMyPassword({
            currentPassword: pwForm.currentPassword,
            newPassword: pwForm.newPassword
        })
        alert('비밀번호가 성공적으로 변경되었습니다. 보안을 위해 다시 로그인해주세요.')
        authStore.logout()
    } catch(e) {
        console.error(e)
        alert('비밀번호 변경 실패: ' + (e.response?.data?.message || '알 수 없는 오류가 발생했습니다.'))
    } finally {
        pwLoading.value = false
    }
}



onMounted(loadData)
</script>

<style scoped>
/* Toss-style Design System */
:root {
  --toss-blue: #3182f6;
  --toss-blue-dark: #1b64da;
  --toss-grey-bg: #f2f4f6;
  --toss-grey-100: #f9fafb;
  --toss-grey-200: #e5e8eb;
  --toss-grey-300: #b1b8c0;
  --toss-grey-400: #8b95a1;
  --toss-grey-500: #6b7684;
  --toss-grey-700: #333d4b;
  --toss-grey-900: #191f28;
}

/* Page Layout */
.narrow-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 32px 20px;
}

.section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.section-title h1 {
    font-size: 24px;
    font-weight: 800;
    color: var(--primary);
    margin: 0;
    letter-spacing: -0.02em;
}

.subtitle {
    display: none; /* Minimalist header, hide subtitle */
}

/* Buttons */
.btn {
    padding: 12px 18px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
}
.btn:active { transform: scale(0.96); }

.btn-primary { 
    background: #3182f6; 
    color: white; 
    box-shadow: 0 4px 10px rgba(49, 130, 246, 0.2);
}
.btn-primary:hover { background: #1b64da; }

.btn-ghost { background: transparent; color: #6b7684; }
.btn-ghost:hover { background: rgba(0,0,0,0.04); color: #333d4b; }

.btn-outline { 
    background: white; 
    border: 1px solid #e5e8eb; 
    color: #6b7684; 
    padding: 8px 12px;
}
.btn-warning {
    background-color: #ffeaea;
    color: #e63946;
}
.btn-xs { font-size: 13px; border-radius: 8px; }

/* Cards */
.card {
    background: white;
    border-radius: 24px; /* Super rounded */
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04); /* Very soft shadow */
    padding: 30px;
    margin-bottom: 20px;
    border: none;
    transition: transform 0.2s;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

/* Profile Header Section */
.profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-bottom: 40px;
}
.avatar-lg {
    width: 100px; height: 100px;
    border-radius: 40px; /* Squircleish */
    background: #f2f4f6;
    margin-bottom: 16px;
    overflow: hidden;
    position: relative;
    border: none;
}
.avatar-lg img { width: 100%; height: 100%; object-fit: cover; }
.avatar-lg i { font-size: 40px; color: #b1b8c0; line-height: 100px; }

.emp-name {
    font-size: 24px;
    font-weight: 700;
    color: #191f28;
    margin-bottom: 8px;
}

.profile-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4 Equal Columns */
    width: 100%;
    max-width: 800px; /* Constrain width for readability */
    margin: 20px auto 0;
    background: #ffffff;
    border: 1px solid #e5e8eb;
    border-radius: 12px;
    overflow: hidden; /* For border radius */
}

/* On mobile, stack them */
@media (max-width: 768px) {
    .profile-meta-grid {
        grid-template-columns: 1fr 1fr;
    }
}

.meta-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-right: 1px solid #e5e8eb;
    background: #f9fafb;
    position: relative;
    transition: all 0.2s;
}

.meta-item.readonly {
    opacity: 0.6;
    background-color: #f2f4f6;
}
.meta-item.readonly::after {
    content: '\e93c'; /* pi-lock */
    font-family: 'primeicons';
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 10px;
    color: #b1b8c0;
}

.meta-item:last-child {
    border-right: none;
}

/* Mobile border adjustment */
@media (max-width: 768px) {
    .meta-item:nth-child(2) { border-right: none; }
    .meta-item:nth-child(n+3) { border-top: 1px solid #e5e8eb; }
}


.meta-label {
    font-size: 13px;
    color: #6b7684;
    font-weight: 600;
    margin-bottom: 8px;
}

.meta-value {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 28px;
}

.role-badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
}

.text-gray {
    color: #b1b8c0;
    font-size: 14px;
}
.badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    background: #f2f4f6;
    color: #4e5968;
}
.badge.position { background: #e8f3ff; color: #3182f6; border: 1px solid #dbeafe; font-weight: 600; }
.badge.status.status-working { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; font-weight: 600; }
.badge.status.status-leave { background: #fef9c3; color: #a16207; border: 1px solid #fcf299; font-weight: 600; }
.badge.status.status-resigned { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; font-weight: 600; }

/* Colored Status Select */
.status-select { min-width: 160px; }
.status-select :deep(.select-trigger) {
    font-weight: 600;
    border-radius: 6px;
    height: 32px; /* Smaller height for badge look */
    font-size: 13px;
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

.emp-meta {
    font-size: 15px;
    color: #4e5968;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.emp-meta .separator {
    color: #d1d6db;
    font-weight: bold;
}

/* Detail Grid */
.detail-grid { 
    display: block; /* Removed grid split */
}

.grid-section {
    background: #f9fafb;
    padding: 24px;
    border-radius: 16px;
    height: 100%;
}

.field-grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 32px; /* Column gap only, rows handle their padding */
}
@media (max-width: 768px) {
    .field-grid-container { grid-template-columns: 1fr; }
}

.grid-section h3 {
    font-size: 18px;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e5e8eb;
}
.grid-section h3 i { font-size: 18px; }

.field-item { 
    display: flex; 
    align-items: center; 
    padding: 14px 0;
    border-bottom: 1px solid #e5e8eb;
    min-height: 52px;
}
.field-item.full-width { 
    grid-column: 1 / -1; 
    flex-direction: column; 
    align-items: flex-start; 
    gap: 8px; 
    height: auto;
    border-bottom: none;
    margin-top: 12px;
}

.field-item .label, .field-item label {
    font-size: 14px;
    color: #6b7684;
    font-weight: 600;
    width: 90px;
    flex-shrink: 0;
    text-align: left; /* Changed from justify */
    margin-right: 16px;
    position: relative;
}

/* Required Indicator */
.label.required::after, label.required::after {
    content: '*';
    color: #ef4444;
    margin-left: 2px;
    font-weight: 700;
}

.field-item .value {
    font-size: 15px;
    color: #191f28;
    font-weight: 500;
    text-align: left;
    flex: 1;
}

/* Read-only field styling in Edit Mode */
.field-item.readonly {
    opacity: 0.6;
    background-color: rgba(242, 244, 246, 0.5); /* Light grey bg */
    border-radius: 8px;
    padding-left: 12px;
    padding-right: 12px;
}
.field-item.readonly .value {
    color: #8b95a1;
    font-weight: 500;
    cursor: not-allowed;
}
.field-item.readonly::after {
    content: '\e93c'; /* pi-lock icon code */
    font-family: 'primeicons';
    font-size: 14px;
    color: #b1b8c0;
    margin-left: 8px;
}

.field-item.full-width .value {
    background: white;
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #e5e8eb;
    font-weight: 400;
    line-height: 1.5;
    color: #4e5968;
    white-space: pre-wrap; /* Preserve line breaks */
    word-break: break-all; /* Break long words */
}

/* Inputs */
.input {
    width: 100%; /* Full width to fill flex space */
    text-align: left; /* Align left to match view mode */
    border: none;
    background: #f9fafb;
    font-size: 15px;
    color: #191f28;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s;
}
.input::placeholder { color: #b1b8c0; font-weight: 400; }
.input:focus { 
    outline: none; 
    background: #e8f3ff;
    color: #1b64da;
    box-shadow: 0 0 0 2px rgba(49, 130, 246, 0.1);
}
.name-input {
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    width: 200px;
    margin-bottom: 8px;
    background: transparent; /* Cleaner look for name edit */
    border: 1px solid #e5e8eb;
}
.field-item.full-width .input {
    text-align: left;
    height: auto; /* Allow height control via class */
    width: 100%;
}

.note-value {
    max-height: 120px;
    overflow-y: auto;
    /* Custom Scrollbar for better UI */
    scrollbar-width: thin;
    scrollbar-color: #d1d6db transparent;
}
.note-input {
    height: 120px;
    resize: none;
    overflow-y: auto;
    display: block;
}

.w-full { width: 100%; }
.char-count {
    text-align: right;
    font-size: 12px;
    color: #8b95a1;
    margin-top: 4px;
}

/* Password Section */
.password-form .field-group { margin-bottom: 16px; }
.password-form label { display: block; font-size: 14px; color: #6b7684; margin-bottom: 6px; }
.password-form .input {
    text-align: left;
    background: #f2f4f6;
    padding: 14px;
    border-radius: 14px;
    color: #191f28;
    font-weight: 400;
}
.form-actions { margin-top: 24px; }
.btn-warning { width: 100%; }

/* States */
.loading-state, .error-state {
    text-align: center; padding: 80px 20px;
    background: white; border-radius: 24px;
    color: #8b95a1;
}
</style>
