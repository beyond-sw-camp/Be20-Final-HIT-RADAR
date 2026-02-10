<script setup>
import { onMounted,  ref, watch } from 'vue'
import {
  fetchGroupCodes,
  fetchCustomCodeByGroupCode,
  createCustomCode,
  existCustomCode,
  deleteCustomCodes,
} from '@/api/contentsCustomCodeApi.js'
import router from '@/router/index.js'

const submitting = ref(false)
const errorMessage = ref('')

const groups = ref([]) // 상위 그룹
const customCodes = ref([]) // 하위 코드

const selectedGroupCode = ref([])
const allChecked = ref(false) // 삭제할 때

const normalizeCustomCode = (value) => {
  if (!value) return ''

  // 영문 + _ 만 허용 (한글, 숫자, 특수문자 전부 제거)
  const filtered = value.replace(/[^a-zA-Z_]/g, '')

  // 소문자 → 대문자
  return filtered.toUpperCase()
}

// 그룹 코드 조회
const getGroupCodes = async () => {
  submitting.value = true
  try {
    const result = await fetchGroupCodes()
    const data = result.data

    if (data.success) {
      groups.value = data.data.customCodes

      // 첫 번째 그룹 자동 선택
      if (groups.value.length > 0) {
        selectedGroupCode.value = groups.value[0].groupCode
      }
    }
  } catch (e) {
    errorMessage.value = e.message || '그룹 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 하위 코드 조회
const getCustomCodeByGroupCode = async (groupCode) => {
  if (!groupCode) return

  let payload = {
    groupCode : groupCode,
    customCodeId : groups.value.find(item => item.groupCode === groupCode)?.customCodeId,
  }

  submitting.value = true
  try {
    const result = await fetchCustomCodeByGroupCode( payload )
    const data = result.data

    if (data.success) {
      customCodes.value = data.data.customCodes
    }
  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

const CUSTOM_CODE_REGEX = /^[A-Z_]+$/

const codeValid = async (code) => {

  code.customCode = normalizeCustomCode(code.customCode)

  if (!code.customCode || !CUSTOM_CODE_REGEX.test(code.customCode)) {
    alert('코드는 영문 대문자와 _(언더바)만 입력 가능합니다.')
    return
  }


  if (!code.customName || code.customName.trim() === '') {
    alert('코드명을 입력해주세요.')
    return
  }

  submitting.value = true
  try {
    const result = await existCustomCode(code.customCode)
    const data = result.data.data.exist

    if (data) {
      alert('이미 사용중인 코드입니다.');
      return
    }

    createCode(code);

  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 코드 저장
const createCode = async (code) => {

 let payload = {
    customCodeId : groups.value.find(item => item.groupCode === code.groupCode).customCodeId,
    groupCode: selectedGroupCode.value,
    customCode: code.customCode,
    customName: code.customName,
    isDeleted: code.isDeleted,
  }

  submitting.value = true

  try {
    const result = await createCustomCode(payload)
    const data = result.data

    if (data.success) {
      // 성공 다시 조회
      await getCustomCodeByGroupCode(selectedGroupCode.value)
    }
  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }

}

// 행 추가
function addRow() {
  customCodes.value.push({
    customCodeId: `NEW_${Date.now()}`, // v-for key용 임시 ID
    groupCode: selectedGroupCode.value,
    customCode: '',
    customName: '',
    isDeleted: 'Y',
    createdAt: '',
    updatedAt: '',
    btn: '',
    isNew: true,
    checked: false,
  })
}

const toggleAll = () => {
  customCodes.value.forEach(code => {
    if (!code.isNew) {
      code.checked = allChecked.value
    }
  })
}

const toggleOne = () => {
  const targets = customCodes.value.filter(code => !code.isNew)
  allChecked.value =
    targets.length > 0 &&
    targets.every(code => code.checked === true)
}

const deleteCodes = async (customCodeIds) => {

// customCodeId
  submitting.value = true

  const payload = {
    customCodeIds: (Array.isArray(customCodeIds)
        ? customCodeIds
        : [customCodeIds]
    ).map(id => Number(id)),
  }

  try {
    const result = await deleteCustomCodes(payload)
    const data = result.data

    if (data.success) {// 삭제 성공시 재조회
      alert("삭제되었습니다.");
      await getCustomCodeByGroupCode(selectedGroupCode.value);
    }

  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    allChecked.value = false
  }
}

// 삭제 확인
function deleteRow() {
  const selected = customCodes.value.filter(code => code.checked)

  if (selected.length === 0) {
    alert('삭제할 항목을 선택해주세요.')
    return
  }

  let deleteIds = [];
  for (let item of selected) {
    deleteIds.push(item.customCodeId);
  }

  alert("삭제하시겠습니까?");

  // 삭제
  deleteCodes(deleteIds);
}

function goListPage() {
  router.push({ path:'/all/contents'});
}

// 그룹 변경 감지
watch(selectedGroupCode, (groupCode) => {
  if (groupCode) {
    getCustomCodeByGroupCode(groupCode)
  }
})

onMounted(() => {
  getGroupCodes()
})
</script>

<template>
  <div class="sub"><strong>유형/레벨 관리</strong></div>
  <div class="grid">
    <div class="card">
      <div class="section-tag">
        <div class="search-section">
          <select class="select" v-model="selectedGroupCode">
            <option v-for="group in groups" :key="group.groupCode" :value="group.groupCode">
              {{ group.groupName }}
            </option>
          </select>
        </div>
        <button class="btn" type="button" @click="deleteRow">삭제</button>
        <button class="btn primary" type="button" @click="addRow">추가</button>
      </div>
      <div class="card-bd">
        <div class="content-empty-state" v-if="!customCodes || customCodes.length === 0">
          <table class="table">
            <thead class="tbl-hd">
            <tr>
              <th style="width: 10%">
              </th>
              <th style="width: 30%">코드</th>
              <th style="width: 30%">코드명</th>
              <th style="width: 10%"></th>
            </tr>
            </thead>
          </table>
          <div class="empty-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p>등록된 태그가 없습니다.</p>
          </div>
        </div>
        <div class="table-scroll-container" v-else>
        <table class="table">
          <thead class="tbl-hd">
            <tr>
              <th style="width: 10%">
                <input
                  type="checkbox"
                  class="input"
                  v-model="allChecked"
                  @change="toggleAll"
                />
              </th>
              <th style="width: 30%">코드</th>
              <th style="width: 30%">코드명</th>
              <th style="width: 10%"></th>
            </tr>
          </thead>
          <tbody class="tbl-bd">
            <tr v-for="code in customCodes" :key="code.customCodeId">
              <!-- 체크박스 -->
              <td>
                <span v-if="code.isNew"></span>
                <input
                  v-else
                  type="checkbox"
                  class="input"
                  v-model="code.checked"
                  @change="toggleOne"
                />
              </td>

              <!-- 코드 -->
              <td>
                <input
                  v-if="code.isNew"
                  :value="code.customCode"
                  @input="e => code.customCode = normalizeCustomCode(e.target.value)"
                  class="input"
                  placeholder="영문 대문자, _(언더바)만 입력 가능"
                />
                <span v-else>{{ code.customCode }}</span>
              </td>

              <!-- 코드명 -->
              <td>
                <input
                  v-if="code.isNew"
                  v-model="code.customName"
                  class="input"
                  placeholder="코드명 입력"
                />
                <span v-else>{{ code.customName }}</span>
              </td>
              <td>
                <button v-if="code.isNew" class="btn" type="button" @click="codeValid(code)">
                  저장
                </button>
                <span v-else></span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
      <div class="section-btn">
        <button class="btn" @click="goListPage()" type="button">목록</button>
      </div>
    </div>
  </div>

</template>

<style scoped>

.card {
  margin: 25px;
}
.search-section .select {
  width: 200px;
}

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding: 5px;
  width: 100%;
}

.section-tag {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  gap: 10px;
}

/* 테이블 셀 공통 정렬 */
.table th,
.table td {
  padding: 12px 8px;      /* 셀 내부 여백 조정 */
  vertical-align: middle;  /* 수직 중앙 정렬 */
  text-align: center;      /* 수평 중앙 정렬 */
}

.table td input[type="checkbox"],
.table th input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  margin: 0;               /* 기본 마진 제거가 중요! */
  vertical-align: middle;  /* 텍스트 라인과 맞춤 */
  display: inline-block;
}

.table tr td:first-child,
.table tr th:first-child {
  display: table-cell;     /* Flex 방해 방지 */
  text-align: center;
}

.table-scroll-container {
  max-height: 500px; /* 원하는 리스트 높이로 조절 */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}

</style>
