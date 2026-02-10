<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 유형 관리</h1>
    </div>

    <section class="card document-type-management">
      <div class="header-actions">
        <button class="btn btn-primary" @click="openCreateModal">새 문서 유형 등록</button>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>카테고리</th>
            <th>유형명</th>
            <th>시스템 연동</th>
            <th>사용 여부</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="documentTypes.length === 0">
            <td colspan="6" class="no-data">등록된 문서 유형이 없습니다.</td>
          </tr>
          <tr v-for="(type, index) in documentTypes" :key="type.typeId">
            <td>{{ index + 1 }}</td>
            <td>{{ type.docType }}</td>
            <td>{{ type.name }}</td>
            <td>
                <span :class="['category-badge', type.attendanceCategory.toLowerCase()]">
                    {{ mapCategoryName(type.attendanceCategory) }}
                </span>
            </td>
            <td>
              <button class="btn btn-secondary btn-small" @click="openEditModal(type)">수정</button>
              <button class="btn btn-danger btn-small" @click="deleteDocumentType(type.typeId)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Document Type Modal (Create/Edit) -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <h3>{{ isEditing ? '문서 유형 수정' : '새 문서 유형 등록' }}</h3>
        <div class="form-group">
          <label for="docType">카테고리 (고유 ID)</label>
          <input type="text" id="docType" v-model="form.docType" class="input-field" :disabled="isEditing" placeholder="예: VACATION_REQUEST" />
        </div>
        <div class="form-group">
          <label for="name">유형명</label>
          <input type="text" id="name" v-model="form.name" class="input-field" placeholder="예: 휴가 신청" />
        </div>
        <div class="form-group">
            <label for="attendanceCategory">시스템 연동</label>
            <select id="attendanceCategory" v-model="form.attendanceCategory" class="input-field select-field">
                <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ mapCategoryName(cat) }}
                </option>
            </select>
            <div class="connector-hint-box" v-if="form.attendanceCategory !== 'NONE'">
                <p class="hint-title"><i class="icon-bolt"></i> 승인 시 실행될 자동화 로직:</p>
                <ul class="hint-list">
                    <li v-if="isWorkCategory(form.attendanceCategory)">• 근태 현황판에 실시간 근무 상태 반영</li>
                    <li v-if="isWorkCategory(form.attendanceCategory)">• 출퇴근 기록 자동 생성 및 동기화</li>
                    <li v-if="form.attendanceCategory === 'VACATION' || form.attendanceCategory === 'LEAVE_SICK'">• 잔여 연차 자동 차감 및 휴가 이력 반영</li>
                    <li v-if="form.attendanceCategory === 'OVERTIME'">• 초과 근무 수당 정산 및 기록 생성</li>
                    <li>• 관련 사원 및 부서장에게 실시간 SSE 알림 전송</li>
                </ul>
            </div>
            <p v-else class="hint">일반 문서로 등록됩니다 (추가 자동화 로직 없음).</p>
        </div>
        <div class="form-group checkbox-group">
          <label for="active">활성화</label>
          <input type="checkbox" id="active" v-model="form.active" class="small-checkbox" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showModal = false">취소</button>
          <button class="btn btn-primary" @click="saveDocumentType">저장</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  fetchManagementDocumentTypes,
  createApprovalDocumentType,
  updateApprovalDocumentType,
  deleteApprovalDocumentType,
  fetchApprovalAttendanceCategories
} from '@/api/approvalApi.js';

const documentTypes = ref([]);
const showModal = ref(false);
const isEditing = ref(false);
const currentTypeId = ref(null);
const form = ref({
  docType: '',
  name: '',
  active: true,
  attendanceCategory: 'NONE'
});

const categories = ref(['NONE']);

const fetchDocumentTypes = async () => {
  try {
    const response = await fetchManagementDocumentTypes();
    documentTypes.value = response.data.data.map(type => ({
      typeId: type.docId,
      docType: type.docType,
      name: type.name,
      active: type.active,
      attendanceCategory: type.attendanceCategory || 'NONE'
    }));
  } catch (error) {
    console.error('Failed to fetch document types:', error);
  }
};

const fetchCategories = async () => {
    try {
        const response = await fetchApprovalAttendanceCategories();
        if (response.data && response.data.data) {
            categories.value = response.data.data;
        }
    } catch (error) {
        console.error('Failed to fetch categories:', error);
    }
}

const mapCategoryName = (cat) => {
    const mapper = {
        'NONE': '연동 없음',
        'WORK_OFFICE': '내근/출근',
        'WORK_REMOTE': '재택근무',
        'WORK_FIELD': '외근',
        'WORK_TRIP': '출장',
        'VACATION': '휴가',
        'LEAVE_SICK': '병가',
        'OVERTIME': '초과근무'
    };
    return mapper[cat] || cat;
}

const isWorkCategory = (cat) => {
    return ['WORK_OFFICE', 'WORK_REMOTE', 'WORK_FIELD', 'WORK_TRIP'].includes(cat);
}

const openCreateModal = () => {
  isEditing.value = false;
  currentTypeId.value = null;
  form.value.docType = '';
  form.value.name = '';
  form.value.active = true;
  form.value.attendanceCategory = 'NONE';
  showModal.value = true;
};

const openEditModal = async (type) => {
  isEditing.value = true;
  currentTypeId.value = type.typeId;
  form.value.docType = type.docType;
  form.value.name = type.name;
  form.value.active = type.active;
  form.value.attendanceCategory = type.attendanceCategory || 'NONE';
  showModal.value = true; // Added missing modal open
};

const saveDocumentType = async () => {
  if (!form.value.docType.trim() || !form.value.name.trim()) {
    alert('카테고리와 유형명을 모두 입력해주세요.');
    return;
  }

  try {
    if (isEditing.value) {
      await updateApprovalDocumentType(currentTypeId.value, {
        docType: form.value.docType,
        name: form.value.name,
        active: form.value.active,
        attendanceCategory: form.value.attendanceCategory
      });
      alert('문서 유형이 수정되었습니다.');
    } else {
      await createApprovalDocumentType({
        docType: form.value.docType,
        name: form.value.name,
        active: form.value.active,
        attendanceCategory: form.value.attendanceCategory
      });
      alert('새 문서 유형이 등록되었습니다.');
    }
    showModal.value = false;
    fetchDocumentTypes(); // Refresh list
  } catch (error) {
    alert('문서 유형 저장에 실패했습니다.');
    console.error('Failed to save document type:', error);
  }
};

const deleteDocumentType = async (id) => {
  if (!confirm('정말로 이 문서 유형을 삭제하시겠습니까?')) return;
  try {
    await deleteApprovalDocumentType(id);
    alert('문서 유형이 삭제되었습니다.');
    fetchDocumentTypes(); // Refresh list
  } catch (error) {
    alert('문서 유형 삭제에 실패했습니다.');
    console.error('Failed to delete document type:', error);
  }
};

onMounted(() => {
  fetchDocumentTypes();
  fetchCategories();
});
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
  color: #1e293b;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.document-type-management .header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b; /* Explicitly dark for both header and data */
}

.table th {
  background-color: #f8fafc;
  font-weight: 700;
  color: #111827; /* Darker from #475569 */
}

.table tbody tr {
  cursor: default;
}

.table tbody tr:hover {
  background-color: #f8fafc;
}

.no-data {
  text-align: center;
  color: #888;
  padding: 40px;
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

.btn-danger {
  background-color: #dc3545;
  color: #ffffff;
  margin-left: 5px; /* Spacing for action buttons */
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
}

/* Modal Styles - Reuse from ApprovalDetailView or global styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #ffffff;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 90%;
  max-width: 500px;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
  color: #1e293b;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b; /* Darker from #475569 */
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b; /* Darker from #334155 */
  box-sizing: border-box;
}

.input-field:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.input-field:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}

.modal-actions {
  gap: 10px;
  margin-top: 30px;
}

.select-field {
    background-color: #ffffff;
}

.hint {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 4px;
}

.category-badge {
    display: inline-block;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
}

.category-badge.work_office { background-color: #f0f9ff; color: #0369a1; border-color: #bae6fd; }
.category-badge.work_field { background-color: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.category-badge.work_trip { background-color: #fffaf5; color: #c2410c; border-color: #ffedd5; }
.category-badge.work_remote { background-color: #faf5ff; color: #7e22ce; border-color: #f3e8ff; }
.category-badge.vacation { background-color: #fff1f2; color: #be123c; border-color: #fecdd3; }
.category-badge.leave_sick { background-color: #fff1f2; color: #e11d48; border-color: #fda4af; }
.category-badge.overtime { background-color: #fffbeb; color: #b45309; border-color: #fef3c7; }
.category-badge.none { background-color: #f8fafc; color: #64748b; border-color: #e2e8f0; }

.connector-hint-box {
    margin-top: 12px;
    padding: 12px;
    background-color: #f8fafc;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

.hint-title {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
}

.hint-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.hint-list li {
    font-size: 12px;
    color: #475569;
    margin-bottom: 4px;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px; /* Space between label and checkbox */
}

.small-checkbox {
    width: 16px;
    height: 16px;
    margin: 0;
    cursor: pointer;
    /* Optional: Use transform for fine-tuning size if needed, but width/height is usually enough */
    transform: scale(0.9); 
    transform-origin: left top;
}
</style>
