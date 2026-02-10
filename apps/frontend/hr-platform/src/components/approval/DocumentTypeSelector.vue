<template>
  <div class="document-type-selector">
    <label v-if="label">{{ label }}</label>
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="input-field"
    >
      <option value="">-- 선택 --</option>
      <option v-for="type in dynamicDocumentTypes" :key="type.value" :value="type.value">
        {{ type.text }}
      </option>
    </select>
    <small v-if="hint" class="hint">{{ hint }}</small>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from 'vue';
import { fetchApprovalDocumentTypes } from '@/api/approvalApi';

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
});

defineEmits(['update:modelValue']);

const dynamicDocumentTypes = ref([]);

onMounted(async () => {
  try {
    const response = await fetchApprovalDocumentTypes();
    const fetchedTypes = response.data.data.map(type => ({ value: type.docType, text: type.name }));
    
    // Ensure standard types are present
    const standardTypes = [
      { value: 'LEAVE_REQUEST', text: '휴가 신청' },
      { value: 'LEAVE_GRANT', text: '연차 등록' }
    ];

    // Combine fetched and standard (avoid duplicates)
    const combined = [...fetchedTypes];
    standardTypes.forEach(std => {
      if (!combined.some(t => t.value === std.value)) {
        combined.push(std);
      }
    });

    dynamicDocumentTypes.value = combined;
  } catch (error) {
    console.error('결재 문서 유형을 불러오는 데 실패했습니다:', error);
    // Fallback to standard types on error
    dynamicDocumentTypes.value = [
      { value: 'LEAVE_REQUEST', text: '휴가 신청' },
      { value: 'LEAVE_GRANT', text: '연차 부여' }
    ];
  }
});
</script>

<style scoped>
.document-type-selector {
  margin-bottom: 20px;
}

.document-type-selector label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  background-color: #fff; /* Ensure white background for select */
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  display: block;
}
</style>
