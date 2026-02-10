<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { fetchDeptOptions } from '@/views/report/script/common.js'
import { fetchEmployees } from '@/api/employeeApi.js'
const emit = defineEmits(['close', 'confirm'])
const props = defineProps({
  mode: {
    type: String,
    required: true,
  },
  presetEmployees: {
    type: Array,
    default: () => [],
  },
})


const submitting = ref(false)
const errorMessage = ref('')

const deptOptions = ref([]) // 부서 option
const employees = ref([]);
const searchData = reactive({
  deptId: '',
  employeeName : ''
})
const selectedList = ref([]) // check box 선택
const confirmedList = ref([]) // confirm list

const isAllChecked = ref(false)

const toggleAll = () => {
  if (isAllChecked.value) {
    // 전체 선택
    selectedList.value = employees.value.map(emp => ({
      empId: emp.empId,
      name: emp.name,
      deptName: emp.deptName,
      positionName: emp.positionName,
      employeeNo: emp.employeeNo,
    }))

  } else {
    // 전체 해제
    selectedList.value = []
  }
}

const toggleOne = (item) => {
  // 이미 확정된 사원인지 체크
  const alreadyConfirmed = confirmedList.value.some(
    c => c.empId === item.empId
  )

  if (alreadyConfirmed) {
    alert('이미 선택된 사원입니다.')
    return
  }

  const index = selectedList.value.findIndex(
    sel => sel.empId === item.empId
  )

  if (index !== -1) {
    // 이미 선택 → 해제
    selectedList.value.splice(index, 1)
  } else {
    // 선택
    selectedList.value.push({
      empId: item.empId,
      name: item.name,
      deptName: item.deptName,
      positionName: item.positionName,
      employeeNo: item.employeeNo, // 있으면 같이 추천
    })

  }

  // 전체 선택 상태 동기화
  isAllChecked.value =
    employees.value.length > 0 &&
    selectedList.value.length === employees.value.length
}



// 취소
const closeModal = () => {
  emit('close')
}

// 확인
const confirmModal = () => {
  emit('confirm', confirmedList.value)
}

const modalTitle = computed(() => {
  return props.mode === 'APPROVER'
    ? '결재자 선택'
    : props.mode === 'REFERENCE'
      ? '참조자 선택'
      : '결재 대상 선택'
})

const selectEmployee = () => {
  if (selectedList.value.length === 0) {
    alert('선택된 사원이 없습니다.')
    return
  }

  // 확정 목록에 추가 (중복 방지)
  selectedList.value.forEach(sel => {
    const exists = confirmedList.value.some(
      c => c.empId === sel.empId
    )

    if (!exists) {
      confirmedList.value.push(sel)
    }
  })

  // 체크박스 전체 해제
  selectedList.value = []
  isAllChecked.value = false
}


const removeConfirmed = (empId) => {
  // 확정 목록 제거
  confirmedList.value = confirmedList.value.filter(
    item => item.empId !== empId
  )

  // 임시 선택도 같이 해제
  selectedList.value = selectedList.value.filter(
    item => item.empId !== empId
  )

  isAllChecked.value = false
}

// 초기화
const resetForm = () => {
  searchData.deptId = ''
  searchData.employeeName = ''
  selectedList.value = []
  isAllChecked.value = false
}

// 사원 조회
const getEmpList = async () => {

  selectedList.value = []
  isAllChecked.value = false

  let payload = {
    deptId : searchData.deptId
    , employeeName : searchData.employeeName
  }

  submitting.value = true
  try {
   const result = await fetchEmployees(payload)
    const data = result.data

    if (data.success) {
      employees.value = data.data.employees

    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }

}

// 부서 로딩
const loadDeptOptions = async () => {

  try {
    deptOptions.value = await fetchDeptOptions()
  } catch (e) {
    errorMessage.value = e.message || '부서 조회 중 오류 발생'
    alert(errorMessage.value)
  }
}

onMounted(() => {
  loadDeptOptions(); // 부서 조회
  getEmpList() // 사원조회

  confirmedList.value = props.presetEmployees.map(emp => ({
    empId: emp.empId,
    name: emp.name,
    deptName: emp.deptName,
    positionName: emp.positionName,
    employeeNo: emp.employeeNo,
  }))
})
</script>

<template>
  <teleport to="body">
    <!-- 배경 오버레이 -->
    <div class="modal-overlay" @click="closeModal"></div>

    <!-- 모달 박스 -->
    <div class="modal-wrapper">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="btn close" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="modal-search">
            <div class="search-section">
              <div class="label">부서</div>
              <select class="select" v-model="searchData.deptId">
                <option value="">전체</option>
                <option v-for="item in deptOptions"
                        :key="item.deptId"
                        :value="item.deptId"
                >
                  {{ item.deptName}}
                </option>
              </select>
            </div>
            <div class="search-section">
              <div class="label">사원명</div>
              <input class="input"
                     type="text"
                     placeholder="사원명을 입력해주세요."
                     size="45"
                     v-model="searchData.employeeName"
                     @keyup.enter="getEmpList()"
              />
            </div>

            <div class="search-btn">
              <button class="btn reset" type="reset" @click="resetForm()">초기화</button>
              <button class="btn primary search"
                      type="button"
                      @click="getEmpList()"

              >
                검색
              </button>
            </div>
          </div>

          <div class="table-scroll-container">
              <table class="table">
              <thead class="tbl-hd">
                <tr>
                  <th style="width: 10%">
                    <input type="checkbox"
                           v-model="isAllChecked"
                           @change="toggleAll"
                           :disabled="employees.length === 0 || employees.every(emp => confirmedList.some(c => c.empId === emp.empId))"
                    />
                  </th>
                  <th style="width: 20%">부서</th>
                  <th style="width: 20%">직위</th>
                  <th style="width: 20%">사번</th>
                  <th style="width: 30%">이름</th>
                </tr>
              </thead>
              <tbody class="tbl-bd">
              <tr
                v-for="item in employees"
                :key="item.empId"
                :class="{ disabledRow: confirmedList.some(c => c.empId === item.empId) }"
                @click="toggleOne(item)"
                style="cursor: pointer;"
              >
                <th>
                  <input
                    type="checkbox"
                    :checked="selectedList.some(sel => sel.empId === item.empId)"
                    :disabled="confirmedList.some(c => c.empId === item.empId)"
                    @click.stop
                    @change="toggleOne(item)"
                  />
                </th>
                <th>{{ item.deptName}}</th>
                <th>{{ item.positionName}}</th>
                <th>{{ item.employeeNo }}</th>
                <th>{{ item.name }}</th>
              </tr>

              </tbody>
            </table>
          </div>
        </div>
        <div class="search-btn">
          <button class="btn" type="button" @click="selectEmployee()">선택</button>
        </div>
        <div class="tag-box">
          <div
            class="tag"
            v-for="item in confirmedList"
            :key="item.empId"
          >
            <span>{{ item.name }}</span>
            <span
              style="cursor:pointer; margin-left:6px"
              @click="removeConfirmed(item.empId)"
            >
              ✕
            </span>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn" @click="closeModal">취소</button>
          <button class="btn primary" @click="confirmModal">확인</button>
        </div>
      </div>
    </div>
  </teleport>
</template>
<style>
@import '@/assets/styles/searchBox.css';
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 999;
}

.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  width: 800px;
  max-height: 80vh;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;

  display: flex;
  flex-direction: column;
}

.modal-header,
.modal-footer {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.modal-footer {
  border-top: 1px solid #eee;
  border-bottom: none;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.modal-body {
  padding: 16px;
  overflow-y: auto;
}

.modal-search {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;

  border: 1px solid var(--border); /* 테두리 */
  border-radius: 12px; /* 라운드 */
  background: rgba(255, 255, 255, 0.03); /* 살짝 배경 */
}
.tbl-hd th,
.tbl-bd td {
  text-align: center;
  vertical-align: middle;
}

.table .tbl-hd th {
  text-align: center;
  vertical-align: middle;
  background-color: #eaf0ff;
}

.table .tbl-bd th {
  text-align: center;
  vertical-align: middle;
}

.table .tbl-hd input[type='checkbox'] {
  width: 16px; /* 원하는 너비 */
  height: 16px; /* 원하는 높이 */
  cursor: pointer;
  vertical-align: middle;
  margin: 0; /* 기본 마진 제거 */
}
.table .tbl-bd input[type='checkbox'] {
  width: 16px; /* 원하는 너비 */
  height: 16px; /* 원하는 높이 */
  cursor: pointer;
  vertical-align: middle;
  margin: 0; /* 기본 마진 제거 */
}

.table td {
  text-align: center;
  vertical-align: middle;
}

.tag {
  border: 2px solid #7b8bb3; /* 하늘색 테두리 */
  background-color: #ffffff; /* 배경 흰색 */
  font-weight: bold;
  border-radius: 16px; /* 모서리 둥글게 */
  padding: 5px 10px; /* 안쪽 여백 */
  display: inline-block; /* 크기 내용에 맞춤 */
  font-size: 13px;
  margin: 10px 3px;
}
.tag-box {
  min-height: 80px;      /* 최소 높이 */
  max-height: 150px;     /* 스크롤이 생길 최대 높이 (사원 선택창보다 작게 설정 권장) */
  overflow-y: auto;      /* 내용이 넘치면 스크롤 생성 */
  padding: 8px;
  margin: 0 20px 10px 20px; /* 좌우 여백을 검색창과 통일 */
  border: 1px solid #eee;   /* 박스 구분선 */
  border-radius: 8px;
  background-color: #fafafa; /* 테이블과 구분되는 살짝 회색 배경 */
  text-align: left;
}

.modal-search .search-section .select {
  width: 150px;
}

.modal-search .search-section .input {
  width: 150px;
}
.disabledRow {
  background-color: #f5f5f5;
  color: #999;
}
.disabledRow input[type='checkbox'] {
  cursor: not-allowed;
}

.table-scroll-container {
  max-height: 500px; /* 원하는 리스트 높이로 조절 */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}

.search-btn {
  margin-right: 10px;
  margin-bottom: 10px;
}

</style>
