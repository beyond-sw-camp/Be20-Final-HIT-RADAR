<script setup>
import { onMounted, reactive, ref } from 'vue'
import { createTag, deleteTags, fetchTags } from '@/api/tagApi.js'
const submitting = ref(false)
const errorMessage = ref('')
const emit = defineEmits(['close'])
const tags = ref([])
const tagCount = ref(0)
const tagData = reactive({
  tagCreateName: '',
  tagFetchName: '',
})
const isModalOpen = () => {
  emit('close')
}

// 태그 조회
const getTagList = async () => {
  // validation
  let tag = tagData.tagFetchName
  if (tag.length > 45) {
    alert('태그는 최대 45자까지 입력이 가능합니다.')
    return
  }

  submitting.value = true

  const payload = {
    tagName: tag,
  }

  try {
    let result = await fetchTags(payload)
    let data = result.data

    if (data.success) {
      tags.value = data.data.tags
      tagCount.value = data.data.tags.length
    }
  } catch (e) {
    console.log(e)
    errorMessage.value = e.message || '태그 조회 중 오류가 발생했습니다.'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    tagData.tagFetchName = ''
    tagData.tagCreateName = ''
  }
}

const tagDeleteValid = (tagCount) => {
  if (tagCount > 0) {
    alert('사용중인 개수가 1개 이상이라 삭제할 수 없습니다.')
    return false
  }

  return true
}

// 태그 삭제
const tagDelete = async (tagId, tagCount) => {
  let valid = tagDeleteValid(tagCount)

  if (!valid) {
    return
  }

  submitting.value = true

  const payload = {
    tagIds: [tagId],
  }

  try {
    let result = await deleteTags(payload)
    let data = result.data

    if (data.success) {
      alert("삭제되었습니다.");
    }

  } catch (e) {
    console.log(e)
    errorMessage.value = e.message || '태그 삭제 중 오류가 발생했습니다.'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    getTagList()
  }
}



// 태그 input 리셋
const resetForm = () => {
  tagData.tagFetchName = ''
  getTagList()
}

// 태그 등록
const tagAdd = async () => {
  submitting.value = true

  // validation
  let tag = tagCheck(tagData.tagCreateName)
  if (!tag) {
    return
  }

  submitting.value = true

  const payload = {
    tagName: tag,
  }

  try {
    let result = await createTag(payload)
    let data = result.data.success

    if (data) {
      alert('태그 등록되었습니다.')
    }
  } catch (e) {
    if (e.status === 400) {
      alert(e.customMessage)
    } else {
      console.log(e)
      errorMessage.value = e.message || '태그 등록 중 오류가 발생했습니다.'
      alert(errorMessage.value)
    }
  } finally {
    submitting.value = false
    tagData.tagFetchName = ''
    tagData.tagCreateName = ''
    getTagList()
  }
}

// 태그 validation
const tagCheck = (tagName) => {
  let tag = tagName.trim()

  if (!tag) {
    alert('태그명을 입력해 주세요.')
    return
  }

  if (tag.length > 45) {
    alert('태그는 최대 45자까지 입력이 가능합니다.')
    return
  }

  return tagName
}

onMounted(() => {
  getTagList()
})
</script>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal-head">
        <div class="modal-title">태그 관리</div>
        <button class="btn ghost" @click="isModalOpen">닫기</button>
      </div>

      <div class="modal-add">
        <span><strong>* 태그 등록</strong></span>

        <div class="add-box">
          <div class="search-section">
            <div class="label">태그 명</div>
            <input
              class="input"
              type="text"
              placeholder="태그명을 입력해주세요."
              size="45"
              v-model="tagData.tagCreateName"

            />
          </div>
          <div class="search-btn">
            <button type="button" class="btn primary" @click="tagAdd()" :loading="submitting">
              등록
            </button>
          </div>
        </div>
      </div>

      <div class="modal-hr"></div>

      <span><strong>* 태그 조회</strong></span>
      <div class="modal-search">
        <div class="search-section">
          <div class="label">태그 명</div>
          <input
            class="input"
            type="text"
            placeholder="태그명을 입력해주세요."
            size="45"
            v-model="tagData.tagFetchName"
            @keyup.enter="getTagList()"
          />
        </div>

        <div class="search-btn">
          <button class="btn reset" type="reset" @click="resetForm()">초기화</button>
          <button class="btn primary search" type="button" @click="getTagList()">검색</button>
        </div>
      </div>

      <div class="modal-body">
        <span class="total-span">총 {{ tagCount }} 개</span>
        <div class="content-empty-state" v-if="!tags || tags.length === 0">
          <table class="table">
            <thead class="tbl-hd">
            <tr>
              <th style="width: 40%">태그명</th>
              <th style="width: 40%">사용 개수</th>
              <th style="width: 20%"></th>
            </tr>
            </thead>
          </table>
          <div class="empty-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p>등록된 태그가 없습니다.</p>
          </div>
        </div>
        <table class="table" v-else>
          <thead class="tbl-hd">
            <tr>
              <th style="width: 40%">태그명</th>
              <th style="width: 40%">사용 개수</th>
              <th style="width: 20%"></th>
            </tr>
          </thead>
          <tbody class="tbl-bd">
            <tr v-for="tag in tags" :key="tag.tagId">
              <td>{{ tag.tagName }}</td>
              <td>{{ tag.tagCount }}</td>
              <td>
                <button class="btn" type="button" @click="tagDelete(tag.tagId, tag.tagCount)">
                  삭제
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
.modal-search {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;

  border: 1px solid var(--border); /* 테두리 */
  border-radius: 12px; /* 라운드 */
  background: rgba(255, 255, 255, 0.03); /* 살짝 배경 */
}

.modal-body .table td {
  vertical-align: middle;
}

.modal-add {
  padding-top: 25px;
}

.modal-add .add-box {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin: 20px;

  border: 1px solid var(--border); /* 테두리 */
  border-radius: 12px; /* 라운드 */
}

.modal-hr {
  border: 1px solid var(--border);
  margin: 20px;
}

span {
  font-weight: bold;
  padding-left: 30px;
}

.tbl-hd th,
.tbl-bd td {
  text-align: center;
  vertical-align: middle;
}

input {
  font-size: 13px;
}
</style>
