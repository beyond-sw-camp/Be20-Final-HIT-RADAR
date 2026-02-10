<script setup>
import { onMounted, reactive, ref } from 'vue'
import {fetchTags } from '@/api/tagApi.js'
const submitting = ref(false)
const errorMessage = ref('')
const tags = ref([])
const tagCount = ref(0)
const emit = defineEmits(['close', 'select'])
const tagData = reactive({
  tagName: '',
})

const isModalOpen = () => {
  emit('close')
}

// 태그 조회
const getTagList = async () => {

  let param = {
    tagName: tagData.tagName,
  }

  // validation
  submitting.value = true

  try {
    let result = await fetchTags(param)
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
  }
}

const selectTags = () => {
  const selectedTags = tags.value.filter(tag => tag.checked)
  if (selectedTags.length === 0) {
    alert('태그를 선택해주세요.')
    return
  }
  emit('select', selectedTags)
  emit('close')
}


onMounted(() => {
  getTagList()
})
</script>

<template>
  <div class="side-box">
    <div class="side-header">
      <span class="side-box-title">태그 목록</span>
      <span @click="isModalOpen()">X</span>
    </div>
    <div class="side-search">
      <div>
        <th>태그명</th>
        <td>
          <input
            class="input"
            type="text"
            placeholder="태그명"
            size="45"
            v-model="tagData.tagName"
          />
        </td>
      </div>
      <div class="btn-box">
        <button type="button"
                class="btn primary"
                @click="getTagList"
        >조회</button>
      </div>
    </div>

    <div class="modal-hr"></div>

    <div class="side-content">
      <span class="total-span">총 {{ tagCount }} 개</span>

      <div class="table-container">
        <table class="table">
          <thead class="tbl-hd">
          <tr>
            <th style="width: 10%"></th>
            <th style="width: 40%">태그 명</th>
            <th style="width: 40%">사용 개수</th>
          </tr>
          </thead>
          <tbody class="tbl-bd">
          <tr v-for="tag in tags" :key="tag.tagId">
            <td><input type="checkbox" v-model="tag.checked"></td>
            <td>{{ tag.tagName }}</td>
            <td>{{ tag.tagCount }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="btn-box" style="float: right; margin-bottom: 10px;">
        <button type="button"
                class="btn primary"
                @click="selectTags"
        >선택</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/views/contents/style/sideBox.css';


th {
  width: 20%;
}

.table th {
  width: 30%;
  text-align: center;
  vertical-align: middle;
  background-color: #eaf0ff;
}

.table td {
  width: 30%;
  text-align: center;
  vertical-align: middle;
}

.modal-hr {
  border: 1px solid var(--border);
  margin: 10px;
}

.side-content {
  padding: 10px;
}

.table-container {
  max-height: 250px; /* 원하는 높이 */
  overflow-y: auto;  /* 내용이 넘칠 때만 스크롤 생성 */
  margin-top: 10px;
  border-bottom: 1px solid var(--border);
}
.total-span {
  font-weight: bold;
  font-size: 13px;
}
</style>
