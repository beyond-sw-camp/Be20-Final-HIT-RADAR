<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {  fetchContentDetail, deleteContent } from '@/api/contentApi.js'

const submitting = ref(false)
const errorMessage = ref('')
const route = useRoute()
const router = useRouter()
const contentId = route.params.contentId
const content = reactive({
  title: '',
  typeName: '',
  levelName: '',
  learningTime: '',
  isDeleted: '',
  tags: [],
  resourcePath: '',
  notes: '',
})

// 목록으로 이동
const goListPage = () => {
  router.push('/all/contents')
}

// 컨텐츠 상세
const getContentDetail = async () => {
  submitting.value = true

  try {
    const result = await fetchContentDetail(contentId)
    let data = result.data
    let contents = result.data.data.content
    if (data.success) {
      content.title = contents.title
      content.typeName = contents.typeName
      content.levelName = contents.levelName
      content.learningTime = contents.learningTime
      content.notes = contents.notes
      content.resourcePath = contents.resourcePath
      content.isDeleted = contents.isDeleted
      content.tags = contents.tags

    }
  } catch (e) {
    console.log(e)
    errorMessage.value = e.message || '태그 조회 중 오류가 발생했습니다.'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 삭제
const contentDelete = async (contentId) => {

  submitting.value = true



  try {
    const result = await deleteContent(contentId)
    const data = result.data

    if (data.success) {
      // 성공 목록으로 이동
      alert('컨텐츠를 삭제했습니다.')
    }
  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    goListPage()
  }




}

// 수정
const goUpdatePage = (contentId) => {

  router.push({
    path: `/all/contents/update/${contentId}`,
    query: {
      type: 'update',
    }
  })
}


onMounted(() => {
  getContentDetail()
})
</script>

<template>
  <div class="sub"><strong>학습컨텐츠 상세</strong></div>

  <div class="card">
    <div class="card-bd">
      <table class="table">
        <tr>
          <th>콘텐츠 명</th>
          <td colspan="2">
            {{ content.title }}
          </td>
          <td></td>
        </tr>
        <tr>
          <th>유형</th>
          <td>{{ content.typeName }}</td>
          <th>난이도</th>
          <td>{{ content.levelName }}</td>
        </tr>
        <tr>
          <th>학습시간</th>
          <td colspan="2">{{ content.learningTime }}분</td>
          <td></td>
        </tr>
        <tr>
          <th>링크/위치</th>
          <td colspan="2">
            {{ content.resourcePath }}
          </td>
          <td></td>
        </tr>
        <tr>
          <th>비고</th>
          <td colspan="2">
            {{ content.notes }}
          </td>
          <td></td>
        </tr>
        <tr>
          <th rowspan="2">태그</th>
          <td colspan="2" rowspan="2">
            <div colspan="3" class="tag-box">
              <div class="tag-box">
                <div class="tag" v-for="tag in content.tags" :key="tag">#{{ tag.tagName }}</div>
              </div>
            </div>
          </td>
          <td></td>
        </tr>
        <tr></tr>
      </table>

      <div class="card-btn">
        <button class="btn" @click="goListPage()">목록</button>
        <button class="btn" @click="contentDelete(contentId)">삭제</button>
        <button class="btn primary" @click="goUpdatePage(contentId)">수정</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
@import '@/views/contents/style/tableCss.css';
</style>
