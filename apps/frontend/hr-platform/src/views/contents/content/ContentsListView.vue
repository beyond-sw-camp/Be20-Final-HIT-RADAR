<script setup>
import { useRouter } from 'vue-router'
import TagModalView from '@/views/contents/tag/TagModalView.vue'
import { onMounted, reactive, ref } from 'vue'
import { fetchCustomCodes } from '@/api/contentsCustomCodeApi.js'
import { fetchContents } from '@/api/contentApi.js'
const submitting = ref(false)
const errorMessage = ref('')
const isTagModalOpen = ref(false)
const router = useRouter()

const levels = ref([])
const types = ref([])
const contents = ref([])
const searchData = reactive({
  title: '',
  type: '',
  level: '',
  learningTime: '',
  tag: '',
  isDeleted: 'N',
})

// 콘텐츠 등록
const goCreatePage = () => {
  router.push({
    path: '/all/contents/create',
    query: {
      type: 'edit',
    }
  })
}

// 상세 페이지
const goDetailPage = (contentId) => {
  router.push(`/all/contents/detail/${contentId}`)
}

// 태그 관리 모달
const isModalOpen = () => {
  isTagModalOpen.value = !isTagModalOpen.value
}

// 유형 난이도 관리
const goCustomCodePage = () => {
  router.push({ path: '/all/contents/customCode' })
}

// 유형/ 난이도 list 가져오기
const getCustomCodeList = async () => {
  // validation
  submitting.value = true

  try {
    let result = await fetchCustomCodes()
    let data = result.data

    if (data.success) {
      types.value = data.data.typeCodes
      levels.value = data.data.levelCodes
    }
  } catch (e) {
    console.log(e)
    errorMessage.value = e.message || '태그 조회 중 오류가 발생했습니다.'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 초기화
function resetSearch() {
  searchData.title = ''
  searchData.type = ''
  searchData.level = ''
  searchData.learningTime = ''
  searchData.isDeleted = ''
  searchData.tag = ''
}

// 검색
const searchContent = async (params) => {
  submitting.value = true

  try {
    const result = await fetchContents(params)
    const data = result.data

    if (data.success) {
      // 저장
      contents.value = data.data.contents
    }
  } catch (e) {
    errorMessage.value = e.message || '컨텐츠 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

// 검색
function searchBtn() {
  let payload = {
    title: searchData.title,
    type: searchData.type,
    level: searchData.level,
    learningTime: searchData.learningTime,
    isDeleted: searchData.isDeleted,
    tag: searchData.tag,
  }

  // 검색
 searchContent(payload)
}

onMounted(() => {
  getCustomCodeList()
  searchBtn()
})
</script>

<template>
  <div class="sub"><strong>학습컨텐츠 조회</strong></div>

  <div class="grid">
    <div class="card">
      <div class="card-head">
        <div class="search-section">
          <span class="label">컨텐츠 명</span>
          <input class="input"
                 type="text"
                 placeholder="컨텐츠 명"
                 v-model="searchData.title"
                 @keyup.enter="searchBtn"
          />
        </div>

        <div class="search-section">
          <div class="label">유형</div>
          <select class="select" v-model="searchData.type">
            <option value="">전체</option>
            <option v-for="type in types" :key="type.customCodeId" :value="type.customCodeId">
              {{ type.customName }}
            </option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">난이도</div>
          <select class="select" v-model="searchData.level">
            <option value="">전체</option>
            <option v-for="level in levels" :key="level.customCodeId" :value="level.customCodeId">
              {{ level.customName }}
            </option>
          </select>
        </div>

        <div class="search-btn">
          <button class="btn reset" @click="resetSearch()">초기화</button>
          <button class="btn primary search" @click="searchBtn">검색</button>
        </div>
      </div>
      <div class="card-head">
        <div class="search-section">
          <div class="label">학습시간</div>
          <select class="select" v-model="searchData.learningTime">
            <option value="">전체</option>
            <option value="30">30분</option>
            <option value="60">60분</option>
            <option value="90">90분</option>
            <option value="120">120분</option>
          </select>
        </div>

        <div class="search-section">
          <div class="label">태그</div>
          <input class="input"
                 type="text"
                 v-model="searchData.tag"
                 placeholder="태그"
                 @keyup.enter="searchBtn"
          />
        </div>

      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="section-tag">
        <button class="btn primary" type="button" @click="goCustomCodePage">
          유형/난이도 관리
        </button>
        <button class="btn primary" type="button" @click="isModalOpen">태그 관리</button>
      </div>

      <div class="card-bd">
        <div class="content-empty-state" v-if="!contents || contents.length === 0">
          <table class="table">
            <thead class="tbl-hd">
            <tr>
              <th style="width: 30%">콘텐츠 명</th>
              <th style="width: 30%">유형</th>
              <th style="width: 10%">난이도</th>
              <th style="width: 10%">학습시간</th>
              <th style="width: 30%">태그</th>
            </tr>
            </thead>
          </table>
          <div class="empty-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p>등록된 학습 컨텐츠가 없습니다.</p>
          </div>
        </div>
        <div class="table-scroll-container" v-else>
          <table class="table">
            <thead class="tbl-hd">
              <tr>
                <th style="width: 30%">콘텐츠 명</th>
                <th style="width: 30%">유형</th>
                <th style="width: 10%">난이도</th>
                <th style="width: 10%">학습시간</th>
                <th style="width: 30%">태그</th>
              </tr>
            </thead>
            <tbody
              class="tbl-bd"
              v-for="item in contents"
              :key="item.contentId"
              :value="item.contentId"
              @click="goDetailPage(item.contentId)"
            >
              <tr>
                <td>
                  {{ item.title }}
                </td>
                <td>{{ item.typeName }}</td>
                <td>{{ item.levelName }}</td>
                <td>{{ item.learningTime }}</td>
                <td>
                  <div class="tag-container">
                    <span
                      v-for="tag in item.tags"
                      :key="tag.tagId || tag.id"
                      class="tag-item"
                    >
                      #{{ tag.tagName }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="section-btn">
        <button class="btn primary" @click="goCreatePage()" type="button">등록</button>
      </div>
    </div>
  </div>



  <TagModalView v-if="isTagModalOpen" @close="isModalOpen" />
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';

.section-btn {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
}

.section-tag {
  display: flex;
  justify-content: flex-end;
  padding: 15px;
  gap: 10px;
}

.table-scroll-container {
  max-height: 500px; /* 원하는 리스트 높이로 조절 */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
}

input {
  font-size: 13px;
}

</style>
