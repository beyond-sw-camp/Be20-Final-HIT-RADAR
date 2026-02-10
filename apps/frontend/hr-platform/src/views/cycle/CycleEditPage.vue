<!-- CycleEditPage.vue -->
<template>
  <section class="cycle-page" v-if="form">
    <h2 class="page-title">평가 회차 수정</h2>

    <BaseCard>
      <h4 class="section-title">회차 수정</h4>

      <div class="form">
        <!-- 분기 -->
        <div class="field-row">
          <div class="field">
            <label>분기</label>
            <select v-model="form.quarter" class="select">
              <option value="Q1">1분기</option>
              <option value="Q2">2분기</option>
              <option value="Q3">3분기</option>
              <option value="Q4">4분기</option>
            </select>
          </div>
        </div>

        <!-- 회차명 -->
        <div class="field">
          <label>회차명</label>
          <input v-model="form.cycleName" />
        </div>

        <!-- 기간 -->
        <div class="field-row">
          <div class="field">
            <label>시작일</label>
            <input type="datetime-local" v-model="form.startDate" />
          </div>

          <div class="field">
            <label>종료일</label>
            <input type="datetime-local" v-model="form.endDate" />
          </div>
        </div>

        <!-- 버튼 -->
        <div class="actions">
          <button class="btn-outline" @click="goBack">취소</button>
          <button class="btn-primary" @click="submit">수정 저장</button>
        </div>
      </div>
    </BaseCard>

    <div v-if="toast.show" class="toast">
      {{ toast.message }}
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'
import BaseCard from '@/components/common/BaseCard.vue'
import { fetchCycleDetail, updateCycle } from '@/api/cycleApi'

/* ----------------------------
 * router / store
 * ---------------------------- */
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const cycleId = route.params.cycleId

/* ----------------------------
 * state
 * ---------------------------- */
const form = ref(null)

const toast = ref({
  show: false,
  message: '',
})

/* ----------------------------
 * utils
 * ---------------------------- */
const showToast = (msg) => {
  toast.value.message = msg
  toast.value.show = true
  setTimeout(() => (toast.value.show = false), 2500)
}

/* ----------------------------
 * load
 * ---------------------------- */
const loadCycle = async () => {
  const { data } = await fetchCycleDetail(cycleId)


  if (
    data.status !== 'DRAFT' ||
    Number(data.empId) !== Number(authStore.user?.employeeId)
  ) {
    alert('수정 권한이 없습니다.')
    router.push(`/cycles/${cycleId}`)
    return
  }

  form.value = {
    year: data.startDate.slice(0, 4),
    quarter: data.quarter,
    cycleName: data.cycleName,
    startDate: data.startDate.slice(0, 16),
    endDate: data.endDate.slice(0, 16),
  }
}

/* ----------------------------
 * validation
 * ---------------------------- */
const validate = () => {
  if (!form.value.cycleName) return '회차명을 입력하세요'
  if (!form.value.startDate || !form.value.endDate) return '기간을 입력하세요'
  if (form.value.startDate > form.value.endDate)
    return '시작일은 종료일보다 늦을 수 없습니다'
  return null
}

/* ----------------------------
 * submit
 * ---------------------------- */
const submit = async () => {
  const error = validate()
  if (error) {
    showToast(error)
    return
  }

  await updateCycle(cycleId, {
    ...form.value,
    startDate: form.value.startDate + ':00',
    endDate: form.value.endDate + ':00',
  })

  showToast('회차가 수정되었습니다')
  setTimeout(() => {
    router.push(`/cycles/${cycleId}`)
  }, 800)
}

const goBack = () => {
  router.push(`/cycles/${cycleId}`)
}

onMounted(loadCycle)
</script>

<style scoped>
.page-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  margin: 15px auto;
  padding: 0 24px;
}

.form {
  margin: 0 auto 12px;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
}

input,
select {
  height: 34px;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-primary {
  background: #4f46e5;
  color: white;
  padding: 8px 18px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.btn-outline {
  padding: 8px 18px;
  border-radius: 10px;
  border: 1px solid #4f46e5;
  background: white;
  color: #4f46e5;
  cursor: pointer;
}

.toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: #111827;
  color: white;
  padding: 12px 20px;
  border-radius: 14px;
}
</style>
