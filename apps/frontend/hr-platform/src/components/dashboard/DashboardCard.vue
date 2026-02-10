<template>
  <div class="dashboard-card">
    <header class="card-header">
      <div>
        <h3>{{ title }}</h3>
        <p v-if="desc">{{ desc }}</p>
      </div>
    </header>

    <div class="card-body">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  desc: String
})
</script>

<style scoped>
.dashboard-card {
  background: linear-gradient(180deg, #f9fbff, #ffffff);
  border-radius: 18px;
  padding: 20px 24px 24px;
  box-shadow: 0 12px 30px rgba(74,108,247,0.08);
}

.card-header {
  margin-bottom: 16px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.card-header p {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}
</style>
