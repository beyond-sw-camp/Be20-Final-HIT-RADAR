<template>
  <div class="modern-select" :class="{ active: isOpen }">
    <button 
      ref="triggerRef"
      type="button" 
      class="select-trigger" 
      @click="toggle"
    >
      <span class="selected-label" :class="{ placeholder: !modelValue }">
        {{ selectedLabel }}
      </span>
      <svg 
        class="arrow-icon" 
        width="16" height="16" viewBox="0 0 24 24" 
        fill="none" stroke="currentColor" stroke-width="2" 
        stroke-linecap="round" stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="select-fade">
        <div 
          v-if="isOpen"
          ref="menuRef"
          class="modern-select-options-menu" 
          :style="menuStyle"
        >
          <div 
            v-for="opt in options" 
            :key="opt.value"
            class="option-item"
            :class="{ selected: modelValue === opt.value }"
            @click="select(opt.value)"
          >
            {{ opt.label }}
            <span v-if="modelValue === opt.value" class="check-icon">✓</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '선택하세요' }
})

const emit = defineEmits(['update:modelValue', 'change'])

const triggerRef = ref(null)
const menuRef = ref(null)
const isOpen = ref(false)
const menuStyle = ref({})

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found ? found.label : props.placeholder
})

const updatePosition = () => {
  if (!triggerRef.value) return
  const rect = triggerRef.value.getBoundingClientRect()
  menuStyle.value = {
    position: 'fixed',
    top: `${rect.bottom + 6}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 9999
  }
}

const toggle = async () => {
  if (isOpen.value) {
    close()
  } else {
    isOpen.value = true
    await nextTick()
    updatePosition()
  }
}

const close = () => {
  isOpen.value = false
}

const select = (val) => {
  emit('update:modelValue', val)
  emit('change', val)
  close()
}

// Check click outside manually since Teleport breaks directive scope
const handleClickOutside = (event) => {
  if (!isOpen.value) return
  
  const trigger = triggerRef.value
  const menu = menuRef.value
  
  // If click is inside trigger or menu, ignore
  if (trigger && trigger.contains(event.target)) return
  if (menu && menu.contains(event.target)) return
  
  close()
}

// Update position on scroll/resize
const handleUpdate = () => {
  if (isOpen.value) updatePosition()
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleUpdate, true) // Create capture listener for nested scrolling
  window.addEventListener('resize', handleUpdate)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleUpdate, true)
  window.removeEventListener('resize', handleUpdate)
})
</script>

<style scoped>
.modern-select {
  position: relative;
  width: 220px;
  min-width: 160px;
  font-family: inherit;
  user-select: none;
}

.select-trigger {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #111827;
  text-align: left;
}

.select-trigger:hover {
  background: #fff;
  border-color: #9ca3af;
}

.select-trigger:focus, .modern-select.active .select-trigger {
  outline: none;
  background: #fff;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.selected-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
.selected-label.placeholder {
  color: #9ca3af;
  font-weight: 400;
}

.arrow-icon {
  color: #6b7280;
  transition: transform 0.25s ease;
  flex-shrink: 0;
  margin-left: 8px;
}
.modern-select.active .arrow-icon {
  transform: rotate(180deg);
  color: #3b82f6;
}
</style>

<style>
/* Global scope for Teleported menu */
.modern-select-options-menu {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1), 
    0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 6px;
  max-height: 260px;
  overflow-y: auto;
  box-sizing: border-box;
}

.modern-select-options-menu .option-item {
  padding: 10px 12px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.1s;
}

.modern-select-options-menu .option-item:hover {
  background: #f3f4f6;
  color: #111827;
}

.modern-select-options-menu .option-item.selected {
  background: #eff6ff;
  color: #2563eb;
  font-weight: 600;
}

.modern-select-options-menu .check-icon {
  font-size: 12px;
  color: #2563eb;
}

/* Scrollbar clean */
.modern-select-options-menu::-webkit-scrollbar {
  width: 6px;
}
.modern-select-options-menu::-webkit-scrollbar-track {
  background: transparent;
}
.modern-select-options-menu::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 10px;
}

/* Transition Styles */
.select-fade-enter-active,
.select-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
