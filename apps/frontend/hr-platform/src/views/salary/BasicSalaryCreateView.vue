<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EmployeeSelectModal from '@/views/salary/basicSalary/modal/EmployeeSelectModal.vue'
import { getToday, getYear, BASIC_OPTIONS, COMPENSATION_OPTIONS } from '@/views/salary/js/common.js'
import { createSalaryApprover } from '@/api/salaryApi.js'
import { useAuthStore } from '@/stores/authStore.js'
import { storeToRefs } from 'pinia'
import { fetchEmployeeDetail } from '@/api/employeeApi.js'
const router = useRouter()
const route = useRoute()

const authStore = useAuthStore();
const { user} = storeToRefs(authStore);

// 기본 데이터
const year = route.query.year
const employeeId = user.value.employeeId

// 화면
const pageName = ref('')
const type = route.query.type // 화면 타입 basic/compensation
const salaryType = ref('')
const submitting = ref(false)
const errorMessage = ref('')

// 모달
const isEmployeeSelectModalOpen = ref(false)
const modalMode = ref('APPROVER') // 결재선, 참조선, 대상
const approvers = ref([])
const references = ref([])
const targets = ref([])

// 화면 데이터
const approvalOption = ref([])
const basicData = reactive({
  title: '',
  type: '',
  approvers: [],
  targets: [],
  references : []
})

const employeeData = reactive({
  name : user.value.employeeId
  , deptName :user.value.department
  , positionName : user.value.position
})

// 태그 관리 모달
const openEmployeeModal = (mode) => {
  modalMode.value = mode
  isEmployeeSelectModalOpen.value = true
}

const closeEmployeeModal = () => {
  isEmployeeSelectModalOpen.value = false
}

const onEmployeeConfirm = (employees) => {
  let targetList

  if (modalMode.value === 'APPROVER') {
    targetList = approvers.value
  } else if (modalMode.value === 'REFERENCE') {
    targetList = references.value
  } else {
    targetList = targets.value
  }

  targetList.length = 0

  // 그대로 새 값 추가
  targetList.push(
    ...employees.map(emp => ({
      ...emp,
      salary: '',
      sort: '',
      remark : '',
    }))
  )

  closeEmployeeModal()
}



// 목록 이동
function goListPage() {
  router.push({ path: `/all/salary/${type}` })

}

const draftApproval = async (payload) => {
  submitting.value = true

  try {
    const result = await createSalaryApprover(payload)
    const data = result.data

    if (data.success) {

      if (payload.approvalSaveMode === 'SUBMIT') {
        alert("결재되었습니다.")

      } else if (payload.approvalSaveMode === 'DRAFT') {
        alert("임시 저장되었습니다.");
      }
      goListPage()
    }
  } catch (e) {
    errorMessage.value = e.message || '연봉 결재 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false

  }

}


// 임시저장
function draftValid() {

  if (!basicData.type) {
    alert("타입을 선택해야 임시저장이 가능합니다.")
    return
  }

  if (!basicData.title?.trim()) {
    alert("제목을 입력해야 임시저장이 가능합니다.")
    return
  }

  let common_payload = {
    approvalDocumentType : salaryType.value,
    approvalSaveMode : 'DRAFT',
    title: basicData.title,
    approverIds: approvers.value.map(item => item.empId),
    referenceIds: references.value.map(item => item.empId),
  };

  let payload = { ...common_payload };

  if (type == 'basic') {
    payload = {
      ...payload,
      salaryIncreaseType: basicData.type,
      salaries: targets.value.map(item => ({
        empId: item.empId,
        basicSalary: Number(item.salary),
      })),
    };

  } else if (type == 'compensation') {
    payload = {
      ...payload,
      compensationSalaries: targets.value.map(item => ({
        empId: item.empId,
        amount :  Number(item.salary),
        compensationType : basicData.type,
        remark : item.remark,
      })),
    };
  }

 draftApproval(payload)
}

// 결재
function approvalValid() {
  // 1. 타입 및 제목 체크
  if (!basicData.type) {
    alert("타입을 선택해주세요.")
    return
  }

  if (!basicData.title?.trim()) {
    alert("제목을 입력해주세요.")
    return
  }

  const titleLength = basicData.title.trim().length
  if (titleLength < 1) {
    alert("제목은 최소 1자 이상 입력해주세요.")
    return
  }

  if (titleLength > 190) {
    alert("제목은 최대 190자까지 입력 가능합니다.")
    return
  }

  // 2. 결재선(결재자) 체크
  if (approvers.value.length < 1) {
    alert("결재선은 1명이상 선택해 주세요.")
    return
  }

  // 결재 순서(sort) 유효성 검사 추가
  /*const sortValues = new Set();

  for (const approver of approvers.value) {
    const sortValue = approver.sort?.toString().trim();

    if (!sortValue) {
      alert(`${approver.name} 님의 결재 순서를 입력해주세요.`);
      return;
    }

    if (!/^[1-9]\d*$/.test(sortValue)) {
      alert(`${approver.name} 님의 결재 순서는 1 이상의 숫자만 입력 가능합니다.`);
      return;
    }

    if (sortValues.has(sortValue)) {
      alert(`중복된 결재 순서(${sortValue}번)가 있습니다. 다시 확인해주세요.`);
      return;
    }

    sortValues.add(sortValue);
  }*/

  // 3. 결재대상 체크
  if (targets.value.length < 1) {
    alert("결재대상은 1명이상 선택해 주세요.")
    return
  }

  // 4. 결재 금액(salary) 숫자 체크 (추가 권장 로직)
  for (const target of targets.value) {
    if (!target.salary) {
      alert(`${target.name} 님의 금액을 입력해주세요.`);
      return;
    }


    // 콤마를 제거한 순수 숫자 문자열 추출
    const rawSalary = target.salary.toString().replace(/,/g, '');
    if (rawSalary !== '' && isNaN(Number(rawSalary))) {
      alert(`${target.name} 님의 금액은 숫자만 입력 가능합니다.`);
      return;
    }
  }

  let common_payload = {
    approvalDocumentType : salaryType.value,
    approvalSaveMode : 'SUBMIT',
    title: basicData.title,
    approverIds: approvers.value.map(item => item.empId),
    referenceIds: references.value.map(item => item.empId),
  };

  let payload = { ...common_payload };

  if (type == 'basic') {
    payload = {
      ...payload,
      salaryIncreaseType: basicData.type,
      salaries: targets.value.map(item => ({
        empId: item.empId,
        basicSalary: Number(item.salary.replace(/,/g, '')),
      })),
    };

  } else if (type == 'compensation') {
    payload = {
      ...payload,
      compensationSalaries: targets.value.map(item => ({
        empId: item.empId,
        amount :  Number(item.salary.replace(/,/g, '')),
        compensationType : basicData.type,
        remark : item.remark,
      })),
    };
  }


  // 결재 API 호출
 draftApproval(payload);
}
/*

const getMyEmployee = () => {
  submitting.value = true

  try {
    const result = await
    const data = result.data

    if (data.success) {

      if (payload.approvalSaveMode === 'SUBMIT') {
        alert("결재되었습니다.")
      } else if (payload.approvalSaveMode === 'DRAFT') {
        alert("임시 저장되었습니다.");
      }

    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    goListPage()
  }
}
*/
// 스크립트 부분에 추가
const formatSalary = (item) => {
  let value = item.salary.replace(/[^0-9]/g, '');
  item.salary = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 사원정보 가져오기
const getEmployee = async () => {
  submitting.value = true

  try {
    const result = await fetchEmployeeDetail(employeeId)
    const data = result.data

    if (data.success) {
      let emp = data.data
      employeeData.name = emp.name
      employeeData.deptName = emp.deptName
      employeeData.positionName = emp.positionName
    }

  } catch (e) {
    errorMessage.value = e.message || '연봉 결재 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false

  }



}

onMounted(() => {

  // 화면 구분
  if (type == 'basic') {
    pageName.value = '기본급 생성'
    approvalOption.value = BASIC_OPTIONS
    basicData.type = 'REGULAR'
    salaryType.value = 'BASIC_SALARY'
  } else if (type == 'compensation') {
    pageName.value = '변동 보상 생성'
    approvalOption.value = COMPENSATION_OPTIONS
    basicData.type = 'PERFORMANCE'
    salaryType.value = 'COMPENSATION_SALARY'
  }

  // 사원정보
  getEmployee()

})
</script>

<template>
  <div><strong>{{ pageName }}</strong></div>

  <div class="card">
    <div class="card-section">
      <span class="card-sub-title"><strong>기안자 정보</strong></span>
      <table class="table">
        <tr>
          <th>이름</th>
          <td>{{employeeData.name}}</td>
          <th>기안일</th>
          <td>{{ getToday() }}</td>
        </tr>
        <tr>
          <th>부서</th>
          <td>{{employeeData.deptName}}</td>
          <th>직위</th>
          <td>{{employeeData.positionName}}</td>
        </tr>
      </table>
    </div>
    <div class="card-section">
      <span class="card-sub-title"><strong>결재 정보</strong></span>

      <table class="table">
        <tr>
          <th>년도</th>
          <td>{{ getYear() }}</td>
          <th>결재 유형<span class="color-red">*</span></th>
          <td>
            <select class="select" v-model="basicData.type">
              <option v-for="item in approvalOption" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </td>
        </tr>
        <tr>
          <th>결재 제목<span class="color-red">*</span></th>
          <td colspan="3">
            <input
              class="input-tbl"
              type="text"
              v-model="basicData.title"
              maxlength="99"
              placeholder="제목을 입력해주세요."
            />
          </td>
          <td></td>
        </tr>
      </table>
    </div>

    <div class="card-section">
      <span class="card-sub-title"><strong>결재선(결재자)</strong></span>
      <div class="section-btn">
        <button class="btn primary" type="button" @click="openEmployeeModal('APPROVER')">
          + 결재선 추가
        </button>
      </div>
      <div class="content-empty-state" v-if="!approvers || approvers.length === 0">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <!--            <th style="width: 10%">순서</th>-->
            <th style="width: 20%">부서</th>
            <th style="width: 20%">직위</th>
            <th style="width: 20%">사원명</th>
          </tr>
          </thead>
        </table>
        <div class="empty-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>등록된 결재선이 없습니다.</p>
        </div>
      </div>
      <table class="table" v-else>
        <thead class="tbl-hd">
          <tr>
<!--            <th style="width: 10%">순서</th>-->
            <th style="width: 20%">부서</th>
            <th style="width: 20%">직위</th>
            <th style="width: 20%">사원명</th>
          </tr>
        </thead>
        <tbody>
        <tr
          v-for="item in approvers"
          :key="item.empId"
          :value="item.empId"
        >
<!--            <td>
              <input type="text"
                     class="input"
                     maxlength="1"
                     placeholder="결재 순서"
                     v-model="item.sort"
                     @input="item.sort = item.sort.replace(/[^0-9]/g, '')"
              >
            </td>-->
            <td>{{ item.deptName }}</td>
            <td>{{ item.positionName }}</td>
            <td>{{ item.name}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-section">
      <span class="card-sub-title"><strong>참조자</strong></span>
      <div class="section-btn">
        <button class="btn primary" type="button" @click="openEmployeeModal('REFERENCE')">
          + 참조자 추가
        </button>
      </div>
      <div class="content-empty-state" v-if="!references || references.length === 0">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width: 20%">부서</th>
            <th style="width: 20%">직위</th>
            <th style="width: 20%">사원명</th>
          </tr>
          </thead>
        </table>
        <div class="empty-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>등록된 참조자가 없습니다.</p>
        </div>
      </div>
      <table class="table" v-else>
        <thead class="tbl-hd">
          <tr>
            <th style="width: 20%">부서</th>
            <th style="width: 20%">직위</th>
            <th style="width: 20%">사원명</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in references"
            :key="item.empId"
            :value="item.empId"
          >
            <td>{{ item.deptName }}</td>
            <td>{{ item.positionName }}</td>
            <td>{{ item.name}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-section">
      <span class="card-sub-title"><strong>결재 내용</strong></span>
      <div class="section-btn">
        <button class="btn primary" type="button" @click="openEmployeeModal('TARGET')">
          + 결재 대상 추가
        </button>
      </div>
      <div class="content-empty-state" v-if="!targets || targets.length === 0">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width: 20%">부서</th>
            <th style="width: 20%">직위</th>
            <th style="width: 20%">사원명</th>
          </tr>
          </thead>
        </table>
        <div class="empty-content">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>등록된 결재 대상이 없습니다.</p>
        </div>
      </div>
      <table class="table" v-else>
        <thead class="tbl-hd">
          <tr>
            <th style="width: 15%">부서</th>
            <th style="width: 15%">직위</th>
            <th style="width: 15%">사원명</th>
            <th style="width: 15%">금액</th>
            <th style="width: 40%"
                v-if="type == 'compensation'"
            >비고</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in targets"
            :key="item.empId"
            :value="item.empId"
            style="width: 10%"
          >

            <td style="width: 10%">{{ item.deptName }}</td>
            <td style="width: 10%">{{ item.positionName }}</td>
            <td style="width: 10%">{{ item.name}}</td>
            <td style="width: 10%">
              <input type="text"
                     class="input"
                     v-model="item.salary"
                     @input="item.salary = item.salary.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                     placeholder="금액"
              />
            </td>
            <td style="width: 30%"
              v-if="type == 'compensation'"
            >
              <input type="text"
                     class="input"
                     v-model="item.remark"
                     placeholder="비고"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <EmployeeSelectModal
      v-if="isEmployeeSelectModalOpen"
      :mode="modalMode"
      :presetEmployees="modalMode === 'APPROVER'
    ? approvers
    : modalMode === 'REFERENCE'
      ? references
      : targets"
      @close="closeEmployeeModal"
      @confirm="onEmployeeConfirm"
    />
    <div class="section-btn">
      <button class="btn" @click="goListPage()" type="button">목록</button>
<!--      <button class="btn" @click="draftValid()" type="button">임시저장</button>-->
      <button class="btn primary" @click="approvalValid()" type="button">결재</button>
    </div>

  </div>
</template>

<style scoped>
@import '@/views/contents/style/tableCss.css';
@import '@/views/salary/style/badge.css';

.card-section {
  padding-top: 20px;
}

.card {
  padding: 20px;
  margin: 10px;
}
.section-btn {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
  gap: 5px;
}

.table th,
.table td {
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
