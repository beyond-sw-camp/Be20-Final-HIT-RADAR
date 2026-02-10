<template>
  <div class="user-selector-container">
    <label v-if="label">{{ label }}</label>

    <div class="search-input-group">
      <input
        type="text"
        v-model="searchQuery"
        @keyup.enter="performSearch"
        placeholder="이름으로 검색..."
        class="input-field"
      />
      <button @click="performSearch" class="btn btn-search">검색</button>
    </div>

    <div v-if="searchResults.length > 0" class="search-results-dropdown">
      <ul class="results-list">
        <li
          v-for="user in filteredSearchResults"
          :key="user.accId"
          @click="selectUser(user)"
          class="result-item"
        >
          {{ user.name }} ({{ user.accId }})
        </li>
      </ul>
    </div>

    <div v-if="selectedUsers.length > 0" class="selected-users-tags">
      <span v-for="user in selectedUsers" :key="user.accId" class="user-tag">
        {{ user.name }} ({{ user.accId }})
        <button @click="removeUser(user)" class="remove-tag-btn">✕</button>
      </span>
    </div>

    <small v-if="hint" class="hint">{{ hint }}</small>
  </div>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits } from 'vue';
import { searchUsers } from '@/api/userAccount'; // Assuming this API is for user search

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  modelValue: {
    type: Array, // Expecting an array of user IDs
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue']);

const searchQuery = ref('');
const searchResults = ref([]);
const selectedUsers = ref([]); // Stores { accId, name } objects

// Initialize selectedUsers from modelValue (array of IDs)
watch(() => props.modelValue, (newVal) => {
  // This is a simplified initialization. In a real app, you might fetch full user objects
  // for the initial IDs if only IDs are passed via modelValue.
  // For now, it assumes modelValue provides IDs and selectedUsers stores objects.
  // We'll focus on getting the search and selection working.
  if (newVal && newVal.length > 0 && selectedUsers.value.length === 0) {
    // Prevent re-initializing if selectedUsers already has data from user interaction
    // A more robust solution might involve fetching user details for these IDs
    // or ensuring modelValue directly contains { accId, name } objects.
  }
}, { immediate: true });

const filteredSearchResults = computed(() => {
  // Filter out already selected users from search results
  return searchResults.value.filter(
    (result) => !selectedUsers.value.some((selected) => selected.accId === result.accId)
  );
});

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  try {
    const response = await searchUsers(searchQuery.value);
    // Assuming API returns { accId, name } or similar
    searchResults.value = response.data.data.map(user => ({
      accId: user.accId || user.employeeId, // Adjust based on actual API response structure
      name: user.name || user.employeeName // Adjust based on actual API response structure
    }));
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    searchResults.value = [];
  }
};

const selectUser = (user) => {
  if (!selectedUsers.value.some((selected) => selected.accId === user.accId)) {
    selectedUsers.value.push(user);
    emitSelectedUserIds();
  }
  searchQuery.value = ''; // Clear search query after selection
  searchResults.value = []; // Clear search results
};

const removeUser = (userToRemove) => {
  selectedUsers.value = selectedUsers.value.filter(
    (user) => user.accId !== userToRemove.accId
  );
  emitSelectedUserIds();
};

const emitSelectedUserIds = () => {
  const ids = selectedUsers.value.map((user) => user.accId);
  emit('update:modelValue', ids);
};

// Initial data for selectedUsers if modelValue is provided
// This part needs a proper way to get user names from IDs if modelValue only provides IDs.
// For a fully functional initial state with names, you'd need to fetch user details by ID.
// For now, we'll assume `modelValue` is empty or only for initial data.
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal.length > 0 && selectedUsers.value.length === 0) {
    // This is a placeholder: If you receive IDs, you might need to fetch user names
    // For simplicity, I'm just creating dummy objects if only IDs are available.
    selectedUsers.value = newVal.map(id => ({ accId: id, name: `User ${id}` }));
  }
}, { immediate: true });
</script>

<style scoped>
.user-selector-container {
  margin-bottom: 20px;
  position: relative;
}

.user-selector-container label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.search-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.input-field {
  flex-grow: 1;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.btn-search {
  padding: 10px 15px;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.btn-search:hover {
  background-color: #0056b3;
}

.search-results-dropdown {
  position: absolute;
  top: 100%; /* Position below the search input group */
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 5px;
}

.results-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.result-item {
  padding: 10px 15px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.result-item:hover {
  background-color: #f0f8ff;
}

.selected-users-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.user-tag {
  display: inline-flex;
  align-items: center;
  background-color: #e0e0e0;
  padding: 6px 10px;
  border-radius: 15px;
  font-size: 13px;
  color: #333;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #777;
  font-size: 14px;
  margin-left: 5px;
  cursor: pointer;
}

.remove-tag-btn:hover {
  color: #dc3545;
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}
</style>