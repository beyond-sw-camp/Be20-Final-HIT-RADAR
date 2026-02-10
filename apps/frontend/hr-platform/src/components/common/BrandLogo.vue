<template>
  <div 
    class="brand-logo-container" 
    :style="{ 
      width: size + 'px', 
      height: size + 'px',
      borderRadius: (borderRadius || size/2.8) + 'px'
    }"
  >
    <img src="@/assets/images/logo.png" alt="HRadar Logo" class="logo-image" />
  </div>
</template>

<script setup>
const props = defineProps({
  size: {
    type: [Number, String],
    default: 40 // 기본 크기 상향 (32 -> 40)
  },
  borderRadius: {
    type: Number,
    default: null
  }
})
</script>

<style scoped>
.brand-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease;
}

.brand-logo-container:hover {
  transform: scale(1.05);
}

.logo-image {
  width: 100%; /* 내부 이미지 크기 상향 */
  height: 100%;
  object-fit: contain;
  display: block;
}
</style>
