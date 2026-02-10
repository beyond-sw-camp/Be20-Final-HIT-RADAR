<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>카테고리 관리</h2>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <!-- Add New Category -->
        <div class="add-category-section">
          <input
            type="text"
            v-model="newCategoryName"
            @keyup.enter="addCategory"
            placeholder="새 카테고리명"
            class="input-field"
          />
          <button @click="addCategory" class="btn primary">추가</button>
        </div>

        <!-- Category List -->
        <ul class="category-list">
          <li v-for="category in categories" :key="category.id" class="category-item">
            <template v-if="editingCategory && editingCategory.id === category.id">
              <input
                type="text"
                v-model="editingCategory.name"
                @keyup.enter="saveEdit"
                class="input-field edit-input"
              />
              <div class="actions">
                <button @click="saveEdit" class="btn small">저장</button>
                <button @click="cancelEdit" class="btn small secondary">취소</button>
              </div>
            </template>
            <template v-else>
              <span>{{ category.name }}</span>
              <div class="actions">
                <button @click="startEdit(category)" class="btn small">수정</button>
                <button @click="removeCategory(category.id)" class="btn small secondary danger">삭제</button>
              </div>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useNoticeStore } from '@/stores/noticeStore'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])
const store = useNoticeStore()

const newCategoryName = ref('')
const editingCategory = ref(null) // { id: null, name: '' }

const categories = computed(() => store.categories.filter(cat => cat.name !== '알림 관리'))

async function addCategory() {
  if (newCategoryName.value.trim()) {
    try {
      await store.createCategory(newCategoryName.value.trim())
      newCategoryName.value = ''
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }
}

function startEdit(category) {
  editingCategory.value = { ...category }
}

async function saveEdit() {
  if (editingCategory.value && editingCategory.value.name.trim()) {
    try {
      await store.updateCategory(editingCategory.value.id, editingCategory.value.name.trim())
      editingCategory.value = null
    } catch (error) {
      console.error('Error saving category:', error)
      // The alert is now handled by the Axios interceptor
    }
  }
}

function cancelEdit() {
  editingCategory.value = null
}

async function removeCategory(id) {
  if (confirm('정말로 이 카테고리를 삭제하시겠습니까?')) {
    try {
      await store.deleteCategory(id)
    } catch (error) {
      console.error('Error deleting category:', error)
      // The alert is now handled by the Axios interceptor
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Even darker overlay for maximum focus */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--panel); /* Use panel color for a clearer background */
  padding: 25px; /* Slightly more padding */
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4); /* More prominent shadow */
  border-top: 4px solid var(--primary); /* Stronger accent line */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 18px; /* Increased padding */
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border); /* Clearer separator */
}

.modal-header h2 {
  margin: 0;
  font-size: 24px; /* Larger title */
  color: var(--text-main);
  font-weight: 700;
}

.close-button {
  background: none;
  border: none;
  font-size: 32px; /* Larger close icon */
  cursor: pointer;
  color: var(--text-sub);
  line-height: 1;
}
.close-button:hover {
  color: var(--text-main);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 25px; /* Increased gap between sections */
}

/* Zone for adding new category */
.add-category-section {
  display: flex;
  gap: 12px; /* Increased gap */
  background-color: var(--background-color); /* Contrast with modal's panel background */
  padding: 18px; /* Increased padding */
  border-radius: 8px;
  border: 1px solid var(--border);
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 350px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px; /* Space between items */
  background-color: var(--background-color); /* Container for items */
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 10px; /* Padding inside the list container */
}

/* Individual list items styled as cards */
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px; /* More padding */
  border-radius: 6px;
  background-color: var(--panel); /* Contrast with list container background */
  border: 1px solid var(--border);
  transition: background-color 0.2s, box-shadow 0.2s;
}
.category-item:hover {
  background-color: var(--primary-soft);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1); /* More prominent shadow on hover */
}

.category-item span {
  flex-grow: 1;
  color: var(--text-main);
  font-weight: 600; /* Bolder text */
  font-size: 16px;
}

.category-item .actions {
  display: flex;
  gap: 10px; /* Increased gap between buttons */
}

.input-field {
  flex-grow: 1;
  padding: 12px; /* More padding */
  border-radius: 6px;
  border: 1px solid var(--border);
  background-color: var(--background-color); /* Consistent, contrasts with panel */
  color: var(--text-main);
  font-size: 15px;
}
.input-field:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}

.edit-input {
  margin-right: 12px;
}

.btn {
  padding: 10px 18px; /* Adjusted padding */
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn.primary {
  background-color: var(--primary);
  color: var(--text-on-primary);
}
.btn.primary:hover {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
}

.btn.secondary {
  background-color: var(--text-sub); /* Solid background for secondary */
  color: var(--background-color); /* Light text on dark button */
  border: none;
}
.btn.secondary:hover {
  background-color: var(--text-main); /* Darker on hover */
  color: var(--panel);
  transform: translateY(-1px);
}

.btn.danger {
  background-color: var(--danger); /* Solid background for danger */
  color: var(--text-on-primary);
  border: none;
}
.btn.danger:hover {
  background-color: var(--danger-dark);
  transform: translateY(-1px);
}

.btn.small {
  padding: 8px 12px; /* More padding for small buttons */
  font-size: 13px;
}
</style>
