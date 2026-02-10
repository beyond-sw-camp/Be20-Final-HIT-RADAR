<template>
  <section>
    <div class="section-title">
      <div>
        <h1>직위 조회</h1>
      </div>
    </div>

    <div v-if="loading" class="loading-state">데이터를 불러오는 중...</div>
    
    <div v-else class="page-content">
      <PositionTable 
        :positions="positions" 
        :is-admin="false"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import PositionTable from '@/components/personnel/PositionTable.vue'
import { fetchPositions } from '@/api/positionApi'

const positions = ref([])
const loading = ref(false)

const loadPositions = async () => {
  loading.value = true
  try {
    const res = await fetchPositions()
    positions.value = res.data?.data?.positions || []
  } catch (e) {
    console.error('Failed to load positions', e)
  } finally {
    loading.value = false
  }
}

onMounted(loadPositions)
</script>

<style scoped>
section {
  max-width: 800px;
  margin: 0 auto;
}

.page-content {
  margin-top: 16px;
}

.loading-state {
  text-align: center;
  padding: 80px;
  color: var(--text-muted);
  background: var(--card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin-top: 16px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: 800;
  color: var(--primary);
}
</style>
