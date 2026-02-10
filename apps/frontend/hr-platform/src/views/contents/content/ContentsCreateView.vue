<script setup>
import { useRoute, useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import TagSideModalView from '@/views/contents/content/TagSideModalView.vue'
import { fetchCustomCodes } from '@/api/contentsCustomCodeApi.js'
import { createContent, fetchContentDetail, updateContent } from '@/api/contentApi.js'
import {fetchTagsByTagName} from '@/api/tagApi.js'

const submitting = ref(false)
const errorMessage = ref('')
const route = useRoute()
const router = useRouter()

const page = ref('')
const levels = ref([])
const types = ref([])
const isTagModalOpen = ref(false)
const tagInput = ref('')
const searchedTags = ref([])
const contentData = reactive({
  contentId : '',
  title: '', // 제목
  type: '', // 컨텐츠 타입
  level: '', // 레벨
  learningTime: '',
  resourcePath: '',
  notes: '',
  tags: [],
  isDeleted: 'N',
})

// 목록으로 이동
const goListPage = () => {
  router.push('/all/contents')
}

// 상세 페이지
const goDetailPage = (contentId) => {
  router.push(`/all/contents/detail/${contentId}`)
}

const onLearningTimeInput = (e) => {
  // 숫자 아닌 건 전부 제거
  contentData.learningTime = e.target.value.replace(/[^0-9]/g, '')
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

// 태그 입력
const onTagKeydown = async (e) => {
  let param = e.target.value
  if (!param) {
    searchedTags.value = []
    return
  }

  try {
    const result = await fetchTagsByTagName(param)
    const data = result.data

    if (data.success) {
      searchedTags.value = data.data
    } else {
      searchedTags.value = []
    }
  } catch (e) {
    console.error(e)
    searchedTags.value = []
  }
}

// 태그 선택
const selectTag = (tag) => {
  // 이미 존재하는지 확인
  const exists = contentData.tags.some(t => t.tagId === tag.tagId || t === tag.tagId)
  if (!exists) {
    // 태그 객체 자체를 저장 (화면 표시 및 ID 추출용)
    contentData.tags.push(tag)
  }
  tagInput.value = ''
  searchedTags.value = []
}

// 태그 삭제
const removeTag = (index) => {
  contentData.tags.splice(index, 1)
}

// 모달에서 태그 선택
const handleSelectedTags = (selectedTags) => {
  // contentData.tags가 null이나 undefined일 경우 빈 배열로 취급
  const currentTags = contentData.tags || [];

  const newTags = selectedTags.filter(
    (tag) => !currentTags.some((t) => (t.tagId === tag.tagId) || (t === tag.tagId)),
  );

  if (currentTags.length + newTags.length > 5) {
    alert('태그는 최대 5개까지만 등록 가능합니다.');
    return;
  }

  if (!contentData.tags) contentData.tags = [];
  contentData.tags.push(...newTags);
};

// 모달 오픈/닫기
const isModalOpen = () => {
  isTagModalOpen.value = !isTagModalOpen.value
}

// contents 수정
const contentUpdate = async (params) => {
  submitting.value = true

  try {
    const result = await updateContent(params)
    const data = result.data

    if (data.success) {
      // 성공 목록으로 이동
      alert('컨텐츠를 수정했습니다.')
    }
  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    goDetailPage(params.contentId);
    resetContent()
  }
}

// vaild
const contentValid = () => {
  // valid
  // 제목
  if (contentData.title === '') {
    alert('제목은 필수입니다.')
    return
  }

  if (contentData.type === '') {
    alert('유형은 필수입니다.')
    return
  }

  if (!contentData.tags || contentData.tags.length === 0) {
    alert('태그는 필수입니다.')
    return
  }

  let payload = {
    contentId : contentData.contentId,
    title: contentData.title,
    type: contentData.type,
    level: contentData.level,
    learningTime: contentData.learningTime,
    isDeleted: contentData.isDeleted,
    notes: contentData.notes,
    resourcePath: contentData.resourcePath,
    tags: contentData.tags.map((tag) => {
      const id = typeof tag === 'object' && tag !== null ? tag.tagId : tag;
      return Number(id);
    }),

  }
  if (page.value === 'update') {
    contentUpdate(payload)
  } else {
    createContents(payload)
  }
}

const resetContent = () => {
  contentData.title = ''
  contentData.type = ''
  contentData.level = ''
  contentData.learningTime = ''
  contentData.isDeleted = 'Y'
  contentData.notes = ''
  contentData.resourcePath = ''
  contentData.tags = []
}

// 컨텐츠 저장
const createContents = async (params) => {
  submitting.value = true

  try {
    const result = await createContent(params)
    const data = result.data

    if (data.success) {
      // 성공 목록으로 이동
      alert('컨텐츠를 등록했습니다.')
    }
  } catch (e) {
    errorMessage.value = e.message || '하위 코드 조회 중 오류 발생'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
    goListPage()
    resetContent()
  }
}

// 컨텐츠 상세
const getContentDetail = async (contentId) => {
  submitting.value = true

  try {
    const result = await fetchContentDetail(contentId)
    let data = result.data
    let contents = result.data.data.content

    if (data.success) {
      contentData.title = contents.title
      contentData.type = contents.type
      contentData.level = contents.level
      contentData.learningTime = contents.learningTime
      contentData.isDeleted = contents.isDeleted
      contentData.notes = contents.notes
      contentData.resourcePath = contents.resourcePath
      contentData.tags = contents.tags

    }
  } catch (e) {
    console.log(e)
    errorMessage.value = e.message || '태그 조회 중 오류가 발생했습니다.'
    alert(errorMessage.value)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  getCustomCodeList()

  const contentId = route.params.contentId
  page.value = contentId ? 'update' : 'edit'

  if (page.value === 'update') {
    getContentDetail(contentId)
    contentData.contentId = contentId
  }
})
</script>

<template>
  <div class="sub" v-if="page === 'update'"><strong>학습컨텐츠 수정</strong></div>
  <div class="sub" v-else><strong>학습컨텐츠 등록</strong></div>
  <div class="card">
    <div class="section">
      <div class="card-bd">
        <table class="table">
          <tr>
            <th>콘텐츠 명<span class="color-red">*</span></th>
            <td colspan="2">
              <input
                class="input-tbl"
                type="text"
                v-model="contentData.title"
                maxlength="99"
                placeholder="콘텐츠 명을 입력해주세요."
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <th>유형<span class="color-red">*</span></th>
            <td>
              <select class="select" v-model="contentData.type">
                <option value="">전체</option>
                <option v-for="type in types" :key="type.customCodeId" :value="type.customCodeId">
                  {{ type.customName }}
                </option>
              </select>
            </td>
            <th>난이도</th>
            <td>
              <select class="select" v-model="contentData.level">
                <option value="">전체</option>
                <option
                  v-for="level in levels"
                  :key="level.customCodeId"
                  :value="level.customCodeId"
                >
                  {{ level.customName }}
                </option>
              </select>
            </td>
          </tr>
          <tr>
            <th>학습시간</th>
            <td colspan="2">
              <div style="display: flex; align-items: center">
                <input
                  class="input-tbl"
                  type="text"
                  v-model="contentData.learningTime"
                  @input="onLearningTimeInput"
                  placeholder="숫자만 입력"
                  maxlength="4"
                  style="width: 150px; margin-right: 10px"
                />
                 <span>분</span>
              </div>
            </td>
            <td></td>
          </tr>
          <tr>
            <th>링크/위치</th>
            <td colspan="2">
              <input
                class="input-tbl"
                type="text"
                v-model="contentData.resourcePath"
                placeholder="링크 또는 위치를 작성해 주세요."
                maxlength="1000"
              />
            </td>
            <td></td>
          </tr>
          <tr>
            <th>비고</th>
            <td colspan="2">
              <!--              <input class="input-tbl"
                     type="text"
                     v-model="contentData.notes"
              />-->
              <textarea
                class="input-tbl"
                v-model="contentData.notes"
                placeholder="비고를 입력해주세요."
                maxlength="2000"
              ></textarea>
            </td>
            <td></td>
          </tr>
          <tr>
            <th rowspan="2" class="tag-th">
              <div>태그<span class="color-red">*</span></div>
              <div>
                <button class="btn-small" @click="isModalOpen()">태그 추가</button>
              </div>
            </th>
            <td colspan="2" rowspan="2">
              <div colspan="3" class="tag-box">
                <div class="tag" v-for="(tag, index) in contentData.tags" :key="tag.tagId || index">
                  #{{ tag.tagName || tag }}
                  <span @click="removeTag(index)">X</span>
                </div>
              </div>
            </td>
            <td></td>
          </tr>
          <tr></tr>
        </table>

        <div class="card-btn">
          <button class="btn" @click="goListPage()" v-if="page === 'update'">취소</button>
          <button class="btn" @click="goListPage()" v-else>목록</button>
          <button class="btn primary" @click="contentValid">
            <span v-if="page === 'update'">수정</span>
            <span v-else>저장</span>
          </button>
        </div>
      </div>
      <TagSideModalView v-if="isTagModalOpen" @close="isModalOpen" @select="handleSelectedTags" />
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/searchBox.css';
@import '@/views/contents/style/tableCss.css';
@import '@/views/contents/style/sideBox.css';

.td-flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}


.tag-search-list {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  list-style: none;
  padding: 0;
  margin-top: 5px;
  max-height: 150px;
  overflow-y: auto;
  position: absolute; /* 필요에 따라 조정 */
  width: 200px; /* 필요에 따라 조정 */
  z-index: 10;
}

.tag-search-list li {
  padding: 8px;
  cursor: pointer;
}

.tag-search-list li:hover {
  background-color: #f0f0f0;
}
</style>
