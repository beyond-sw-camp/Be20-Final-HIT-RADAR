<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 등록</h1>
    </div>

    <section class="card form-card">
      <DocumentTypeSelector label="문서 유형" v-model="form.docType" />

      <div class="form-group">
        <label for="title">제목</label>
        <input type="text" id="title" v-model="form.title" class="input-field" placeholder="제목을 입력하세요." />
      </div>

      <div class="form-group">
        <label>기간 및 초과근무 (선택 사항)</label>
        <div class="date-range-group">
            <input type="date" v-model="form.startDate" class="input-field date-input" />
            <span class="tilde">~</span>
            <input type="date" v-model="form.endDate" class="input-field date-input" :min="form.startDate" />
            
            <div class="overtime-group">
                <input type="number" v-model="form.overtimeMinutes" class="input-field overtime-input" placeholder="0" />
                <span class="unit-label">분 초과근무</span>
            </div>
        </div>
      </div>

      <div class="form-group">
        <label for="content">본문 (선택 사항)</label>
        <textarea 
            id="content" 
            v-model="form.content" 
            class="input-field" 
            rows="5" 
            maxlength="2000"
            placeholder="내용을 입력하세요. (최대 2000자)"
        ></textarea>
      </div>

      <DepartmentEmployeeSelector label="결재자" v-model="form.approverIds" hint="결재자를 검색하여 추가하세요." />
      
      <DepartmentEmployeeSelector label="참조자 (선택 사항)" v-model="form.referenceIds" hint="참조자를 검색하여 추가하세요. (선택 사항)" :allowDeptSelection="true" />


      <div class="form-actions">
        <button class="btn btn-secondary" @click="saveDraft" :disabled="isSubmitting">
          {{ isSubmitting ? '처리중...' : '임시저장' }}
        </button>
        <button class="btn btn-primary" @click="handleSubmitApproval" :disabled="isSubmitting">
          {{ isSubmitting ? '처리중...' : '상신' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DocumentTypeSelector from '@/components/approval/DocumentTypeSelector.vue';
import DepartmentEmployeeSelector from '@/components/approval/DepartmentEmployeeSelector.vue';
import {
  createApprovalDraft,
  submitApproval,
  submitNewApproval,
  fetchApprovalDetail,
} from '@/api/approvalApi';

const route = useRoute();
const router = useRouter();

const docId = ref(null);
const form = ref({
  docType: '',
  title: '',
  content: '',
  startDate: '',
  endDate: '',
  overtimeMinutes: 0,
  approverIds: [],
  referenceIds: [],
});

const existingPayload = ref({});

onMounted(async () => {
  // 1. Handle Query Parameters (Redirect from other pages like Leave Admin)
  const { type, title, content, payload } = route.query;
  if (type) form.value.docType = type;
  if (title) form.value.title = title;
  if (content) form.value.content = content;
  if (payload) {
    try {
        const parsed = JSON.parse(payload);
        existingPayload.value = parsed;
        if (parsed.overtimeMinutes) form.value.overtimeMinutes = parsed.overtimeMinutes;
    } catch (e) {
        console.error('Failed to parse query payload:', e);
    }
  }

  // 2. Handle Existing Document ID (Redirect from Drafts)
  if (route.params.id) {
    docId.value = parseInt(route.params.id);
    try {
      const response = await fetchApprovalDetail(docId.value);
      const detail = response.data.data;
      if (detail) {
        form.value.docType = detail.docType;
        form.value.title = detail.title;
        form.value.content = detail.content || '';
        form.value.startDate = detail.startDate || '';
        form.value.endDate = detail.endDate || '';
        if (detail.payload) {
            try {
                const payloadStr = JSON.parse(detail.payload);
                existingPayload.value = payloadStr; // Preserve all fields
                form.value.overtimeMinutes = payloadStr.overtimeMinutes || 0;
            } catch {
                console.warn('Failed to parse payload');
            }
        }
        form.value.approverIds = detail.approverIds || [];
        form.value.referenceIds = detail.referenceIds || [];
      }
    } catch (error) {
      alert('결재 문서를 불러오는 데 실패했습니다.');
      console.error('Failed to fetch approval detail:', error);
      docId.value = null;
    }
  }
});

const isSubmitting = ref(false);

const validateForm = () => {
  if (!form.value.docType) {
    alert('문서 유형을 선택해주세요.');
    return false;
  }
  if (!form.value.title.trim()) {
    alert('제목을 입력해주세요.');
    return false;
  }
  // Content check removed as requested
  
  if (form.value.approverIds.length === 0) {
    alert('결재자를 1명 이상 지정해주세요.');
    return false;
  }
  return true;
};

const saveDraft = async () => {
  if (isSubmitting.value) return;
  if (!validateForm()) return;

  isSubmitting.value = true;
  const request = {
    docType: form.value.docType,
    title: form.value.title,
    content: form.value.content,
    approverIds: form.value.approverIds,
    referenceIds: form.value.referenceIds,
    startDate: form.value.startDate || null,
    endDate: form.value.endDate || null,
    payload: {
        ...existingPayload.value, // Merge existing fields
        startDate: form.value.startDate || null,
        endDate: form.value.endDate || null,
        overtimeMinutes: form.value.overtimeMinutes || 0
    }, 
    Payload: {}  
  };

  console.log('Sending Draft Request:', request);

  try {
    const response = await createApprovalDraft(request);
    alert('문서가 임시저장되었습니다. 문서 ID: ' + response.data.data);
    router.push(`/approval/my-documents`);
  } catch (error) {
    alert('임시저장에 실패했습니다. 관리자에게 문의하거나 브라우저 새로고침(F5)을 해주세요.');
    console.error('Failed to save draft:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const handleSubmitApproval = async () => {
  if (isSubmitting.value) return;
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    if (!docId.value) {
      // 신규 작성 시 바로 상신 API 호출
      const submitRequest = {
        docType: form.value.docType,
        title: form.value.title,
        content: form.value.content,
        approverIds: form.value.approverIds,
        referenceIds: form.value.referenceIds,
        startDate: form.value.startDate || null,
        endDate: form.value.endDate || null,
        payload: {
            ...existingPayload.value, // Merge existing fields
            startDate: form.value.startDate || null,
            endDate: form.value.endDate || null,
            overtimeMinutes: form.value.overtimeMinutes || 0
        },
        Payload: {}
      };
      
      console.log('Sending Direct Submit Request:', submitRequest);
      await submitNewApproval(submitRequest);
      
    } else {
      // 이미 임시저장된 문서가 있는 경우 기존 로직
      await submitApproval(docId.value);
    }

    alert('문서가 성공적으로 상신되었습니다.');
    router.push(`/approval/my-documents`);
  } catch (error) {
    if (error.response?.data?.message) {
      alert(`상신 실패: ${error.response.data.message}`);
    } else {
      alert('문서 상신에 실패했습니다. 입력 정보를 확인해주세요.');
    }
    console.error('Failed to submit approval:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
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
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

textarea.input-field {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background-color: #007bff;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: #ffffff;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.date-range-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.date-input {
    max-width: 200px;
}

.tilde {
    color: #666;
    font-weight: bold;
}

.overtime-group {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 16px;
    padding-left: 16px;
    border-left: 1px solid #e0e0e0;
}

.overtime-input {
    width: 80px;
    text-align: right;
}

.unit-label {
    font-size: 14px;
    color: #666;
    white-space: nowrap;
}
</style>
