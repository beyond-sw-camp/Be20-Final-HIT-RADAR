<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 상세</h1>
    </div>

    <section v-if="document" class="card approval-detail-card">
      <!-- Header Section -->
      <div class="detail-header-column">
        <div class="header-top">
          <h2 class="doc-title">{{ document.title }}</h2>
          <span :class="['status-badge', document.status.toLowerCase()]">{{ translateStatus(document.status) }}</span>
        </div>
        <div class="header-meta-row">
          <span class="meta-label">문서 유형:</span>
          <span class="meta-value">{{ translateDocType(document.docType) }}</span>
          <span class="divider">|</span>
          <span class="meta-label">제출 일시:</span>
          <span class="meta-value">{{ formatDate(document.submittedAt) }}</span>

          <!-- 휴가 신청인 경우 (startDate 존재) -->
          <template v-if="parsedPayload && parsedPayload.startDate">
             <span class="divider">|</span>
             <span class="meta-label">휴가 기간:</span>
             <span class="meta-value text-blue">
                {{ formatDateOnly(parsedPayload.startDate) }} ~ {{ formatDateOnly(parsedPayload.endDate || parsedPayload.startDate) }}
             </span>
          </template>

          <!-- 연차 부여인 경우 (targetEmployeeId 존재) -->
          <template v-if="parsedPayload && parsedPayload.targetEmployeeId">
             <span class="divider">|</span>
             <span class="meta-label">부여 대상:</span>
             <span class="meta-value">사원 ID {{ parsedPayload.targetEmployeeId }}</span>
             <span class="divider">|</span>
             <span class="meta-label">부여 규모:</span>
             <span class="meta-value text-green">{{ parsedPayload.days }}일 ({{ parsedPayload.year }}년도)</span>
          </template>
        </div>
      </div>

      <div class="detail-content">
        <h3>본문</h3>
        <p>{{ document.content }}</p>
      </div>

      <!-- Placeholder for "Leave Details" if needed later ("본문 밑에 휴가 있고") -->
      <!-- Ideally we would render dynamic components here based on docType -->

      <hr />

      <ApprovalLineDisplay :steps="document.approvalSteps" />
      
      <div v-if="document.references && document.references.length > 0" class="approval-references">
        <h3>참조자</h3>
        <div class="reference-container">
          <div class="reference-list">
            <span v-for="ref in visibleReferences" :key="ref.referenceId" class="reference-badge">
              {{ ref.referrerName }} <span class="ref-id">({{ ref.referrerId }})</span>
            </span>
          </div>
          <button 
            v-if="document.references.length > 6" 
            @click="toggleReferences" 
            class="btn-text-more"
          >
            {{ isReferencesExpanded ? '접기' : `+ ${document.references.length - 6}명 더보기` }}
          </button>
        </div>
      </div>

      <hr />

      <ApprovalHistoryDisplay :histories="document.histories" />

      <hr />

      <div class="approval-comments">
        <h3>댓글</h3>
        <div class="comment-section-body">
            <p v-if="!document.comments || document.comments.length === 0" class="no-comments">아직 댓글이 없습니다.</p>
            <div v-else class="comment-list-container">
              <div v-for="group in structuredComments" :key="group.parent.commentId" class="comment-group">
                <!-- Parent Comment -->
                <div class="comment-item">
                  <div class="comment-header">
                    <span class="comment-writer">{{ group.parent.writerName || group.parent.writerId }}</span>
                    <span class="comment-date">{{ formatDate(group.parent.createdAt) }}</span>
                    <button v-if="canAddComment" @click="replyTo(group.parent)" class="btn-small btn-reply">답글</button>
                  </div>
                  <div class="comment-content">{{ group.parent.content }}</div>
                </div>
                
                <!-- Replies -->
                <div v-for="reply in group.replies" :key="reply.commentId" class="comment-item is-reply">
                  <div class="comment-header">
                    <span class="comment-writer">{{ reply.writerName || reply.writerId }}</span>
                    <span class="comment-date">{{ formatDate(reply.createdAt) }}</span>
                    <!-- Nested replies limited to 1 level for simplicity as per current button logic, but they would appear here -->
                  </div>
                  <div class="comment-content">{{ reply.content }}</div>
                </div>
              </div>
            </div>

            <!-- Styled Comment Input -->
            <div v-if="canAddComment" class="comment-input-area styled-input">
                <div v-if="replyToCommentId" class="reply-indicator">
                    <span><strong>{{ replyToCommentWriter }}</strong> 님에게 답글 작성 중</span>
                    <button @click="cancelReply" class="btn-text-cancel">✖</button>
                </div>
                
                <div class="input-wrapper">
                    <textarea
                        id="newCommentInput"
                        v-model="newCommentContent"
                        placeholder="댓글을 작성하세요..."
                        class="comment-textarea"
                        rows="2"
                    ></textarea>
                    <button @click="postComment" class="btn-send-custom" :disabled="!newCommentContent.trim()">
                        등록
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div class="action-buttons">
        <button v-if="canSubmit" class="btn btn-primary" @click="submit">상신</button>
        <button v-if="canWithdraw" class="btn btn-secondary" @click="withdraw">회수</button>
        <button v-if="canApprove" class="btn btn-primary" @click="approve">승인</button>
        <button v-if="canReject" class="btn btn-danger" @click="showRejectModal = true">반려</button>
      </div>
    </section>

    <div v-else class="loading-message">
      문서 정보를 불러오는 중...
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="modal-overlay" @click.self="showRejectModal = false">
      <div class="modal-content">
        <h3>반려 사유 입력</h3>
        <textarea v-model="rejectReason" rows="5" placeholder="반려 사유를 입력해주세요."></textarea>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showRejectModal = false">취소</button>
          <button class="btn btn-danger" @click="reject">반려</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import ApprovalLineDisplay from '@/components/approval/ApprovalLineDisplay.vue';
import ApprovalHistoryDisplay from '@/components/approval/ApprovalHistoryDisplay.vue';
import {
  fetchApprovalDetail,
  submitApproval,
  approveApproval,
  rejectApproval,
  withdrawApproval,
  addApprovalComment,
} from '@/api/approvalApi';
import { useAuthStore } from '@/stores/authStore'; // Assuming authStore is available for current user info

const route = useRoute();
// const router = useRouter(); // Unused router assignment
const authStore = useAuthStore();

const document = ref(null);
const showRejectModal = ref(false);
const rejectReason = ref('');

const docId = computed(() => route.params.docId);
const currentUserId = computed(() => authStore.user?.employeeId); // Assuming employeeId is the actorId

const isReferencesExpanded = ref(false);
const visibleReferences = computed(() => {
    if (!document.value || !document.value.references) return [];
    if (isReferencesExpanded.value) return document.value.references;
    return document.value.references.slice(0, 6);
});

const toggleReferences = () => {
    isReferencesExpanded.value = !isReferencesExpanded.value;
};

const parsedPayload = computed(() => {
    if (!document.value || !document.value.payload) return null;
    try {
        return JSON.parse(document.value.payload);
    } catch (e) {
        console.error("Failed to parse payload:", e);
        return null;
    }
});

const fetchDocumentDetail = async () => {
  try {
    const response = await fetchApprovalDetail(docId.value);
    document.value = response.data.data;
    console.log('Document loaded:', document.value);
    console.log('Current User ID:', currentUserId.value);
    console.log('Document Writer ID:', document.value.writerId);
    console.log('Document Status:', document.value.status);
  } catch (error) {
    alert('문서 상세 정보를 불러오는 데 실패했습니다.');
    console.error('Failed to fetch approval detail:', error);
    document.value = null;
  }
};

const canSubmit = computed(() => {
  if (!document.value || !currentUserId.value) return false;
  const isDraft = document.value.status === 'DRAFT' || document.value.status === 'TEMP'; // Check for TEMP just in case
  const isOwner = Number(document.value.writerId) === Number(currentUserId.value);
  console.log('canSubmit check:', { status: document.value.status, writerId: document.value.writerId, currentUserId: currentUserId.value, isDraft, isOwner });
  return isDraft && isOwner;
});

const canWithdraw = computed(() => {
  if (!document.value || !currentUserId.value) return false;
  // Assuming the backend handles the specific logic for isWithdrawable
  // and the current user is the writer of the document
  // This is a simplified check, actual logic should be robust
  return (
    (document.value.status === 'IN_PROGRESS' || document.value.status === 'DRAFT') &&
     Number(document.value.writerId) === Number(currentUserId.value)
  );
});

const currentAccId = computed(() => authStore.user?.userId);

const canApprove = computed(() => {
  if (!document.value || !currentAccId.value) return false;
  // Check if current user is the PENDING approver in approvalSteps
  const currentStep = document.value.approvalSteps?.find(
    (step) => step.status === 'PENDING' && Number(step.approverId) === Number(currentAccId.value)
  );
  return document.value.status === 'IN_PROGRESS' && !!currentStep;
});

const canReject = computed(() => {
  if (!document.value || !currentAccId.value) return false;
  // Check if current user is the PENDING approver in approvalSteps
  const currentStep = document.value.approvalSteps?.find(
    (step) => step.status === 'PENDING' && Number(step.approverId) === Number(currentAccId.value)
  );
  return document.value.status === 'IN_PROGRESS' && !!currentStep;
});

// For Comments
const structuredComments = computed(() => {
  if (!document.value || !document.value.comments) return [];
  
  const comments = [...document.value.comments];
  // Sort by created date (oldest first for natural flow)
  comments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  
  const parents = comments.filter(c => !c.parentCommentId);
  const replies = comments.filter(c => c.parentCommentId);
  
  return parents.map(parent => ({
    parent,
    replies: replies.filter(r => r.parentCommentId === parent.commentId)
  }));
});

const newCommentContent = ref('');
const replyToCommentId = ref(null);
const replyToCommentWriter = ref('');

const canAddComment = computed(() => {
  if (!document.value) return false;
  const status = document.value.status;
  return status !== 'DRAFT' && status !== 'WITHDRAWN';
});

const postComment = async () => {
  if (!newCommentContent.value.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  try {
    await addApprovalComment(
      docId.value,
      newCommentContent.value,
      replyToCommentId.value
    );
    newCommentContent.value = '';
    replyToCommentId.value = null;
    replyToCommentWriter.value = '';
    await fetchDocumentDetail(); // Refresh comments
    alert('댓글이 등록되었습니다.');
  } catch (error) {
    alert('댓글 등록에 실패했습니다.');
    console.error('Failed to post comment:', error);
  }
};

const replyTo = (comment) => {
  replyToCommentId.value = comment.commentId;
  replyToCommentWriter.value = comment.writerName || comment.writerId;
  newCommentContent.value = `@${comment.writerName || comment.writerId} `;
  // Focus on the comment input field
  const commentInput = window.document.getElementById('newCommentInput');
  if (commentInput) {
    commentInput.focus();
  }
};

const cancelReply = () => {
  replyToCommentId.value = null;
  replyToCommentWriter.value = '';
  newCommentContent.value = '';
};


const submit = async () => {
  if (!confirm('문서를 상신하시겠습니까?')) return;
  try {
    await submitApproval(docId.value);
    alert('문서가 상신되었습니다.');
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 상신에 실패했습니다.');
    console.error('Failed to submit:', error);
  }
};

const approve = async () => {
  if (!confirm('문서를 승인하시겠습니까?')) return;
  try {
    await approveApproval(docId.value);
    alert('문서가 승인되었습니다.');
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 승인에 실패했습니다.');
    console.error('Failed to approve:', error);
  }
};

const reject = async () => {
  if (!rejectReason.value.trim()) {
    alert('반려 사유를 입력해주세요.');
    return;
  }
  if (!confirm('문서를 반려하시겠습니까?')) return;
  try {
    await rejectApproval(docId.value, rejectReason.value);
    alert('문서가 반려되었습니다.');
    showRejectModal.value = false;
    rejectReason.value = '';
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 반려에 실패했습니다.');
    console.error('Failed to reject:', error);
  }
};

const withdraw = async () => {
  if (!confirm('문서를 회수하시겠습니까?')) return;
  try {
    await withdrawApproval(docId.value);
    alert('문서가 회수되었습니다.');
    fetchDocumentDetail(); // Refresh document state
  } catch (error) {
    alert('문서 회수에 실패했습니다.');
    console.error('Failed to withdraw:', error);
  }
};

const translateStatus = (status) => {
  const map = {
    'DRAFT': '임시저장',
    'IN_PROGRESS': '진행중',
    'APPROVED': '승인됨',
    'REJECTED': '반려됨',
    'WITHDRAWN': '회수됨',
    'TEMP': '임시저장'
  };
  return map[status] || status;
};

const translateDocType = (type) => {
  if (type === 'LEAVE_GRANT') return '연차 등록';
  if (type === 'SICK' || type === 'SICK_LEAVE') return '병가 신청';
  if (type === 'LEAVE_REQUEST' || type.includes('ANNUAL')) return '휴가 신청';
  return type;
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(2, '0')}일`;
};

const formatDate = (datetime) => {
  if (!datetime) return '-';
  const date = new Date(datetime);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(() => {
  if (docId.value) {
    fetchDocumentDetail();
  }
});
</script>

<style scoped>
.page {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 16px;
  font-family: 'Inter', sans-serif;
}

.section-title {
  margin-bottom: 20px;
}

.section-title h1 {
  font-size: 24px;
  font-weight: bold;
  color: #1f2937;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.approval-detail-card {
  margin-top: 20px;
}

/* Header Column Layout */
.detail-header-column {
    margin-bottom: 24px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 20px;
}

.header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.doc-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.header-meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px; /* Slightly smaller as requested */
  color: #6b7280;
}

.meta-label {
    font-weight: 500;
}

.meta-value {
    color: #374151;
    font-weight: 600;
}

.divider {
    color: #d1d5db;
    margin: 0 4px;
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
}

.btn-danger:hover {
  background-color: #c82333;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
}

.status-badge.draft { background-color: #f1f5f9; color: #64748b; }
.status-badge.in_progress { background-color: #eff6ff; color: #3b82f6; }
.status-badge.approved { background-color: #f0fdf4; color: #16a34a; }
.status-badge.rejected { background-color: #fef2f2; color: #dc2626; }
.status-badge.withdrawn { background-color: #fffbeb; color: #d97706; }

.text-blue { color: #3b82f6; }
.text-green { color: #16a34a; }

.detail-content {
  margin-top: 24px;
}

.detail-content h3,
.approval-line h3,
.approval-history h3,
.approval-comments h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.detail-content p {
  font-size: 16px;
  line-height: 1.7;
  color: #1f2937;
  white-space: pre-wrap;
}

hr {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 32px 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Comment specific styles */
.no-comments {
  color: #888;
  font-style: italic;
  padding: 10px 0;
}

.comment-list-container {
  margin-top: 15px;
}

.comment-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 8px;
  border-left: 4px solid #007bff;
}

.comment-group {
    margin-bottom: 20px;
}

.comment-item.is-reply {
  margin-left: 36px;
  margin-top: -6px;
  margin-bottom: 12px;
  background-color: #f1f3f5;
  border-radius: 0 8px 8px 8px;
  border-left: none; /* Removed default border */
  position: relative;
  padding: 10px 12px;
}

/* Connecting Line for Replies (ㄴ Marker) */
.comment-item.is-reply::before {
  content: "ㄴ";
  position: absolute;
  left: -22px;
  top: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #adb5bd;
}

/* Smaller font sizes for replies */
.comment-item.is-reply .comment-writer {
  font-size: 13px;
}

.comment-item.is-reply .comment-date {
  font-size: 11px;
}

.comment-item.is-reply .comment-content {
  font-size: 13px;
  color: #555;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.comment-writer {
  font-weight: bold;
  color: #333;
  margin-right: 10px;
}

.comment-date {
  font-size: 12px;
  color: #777;
  margin-right: auto; /* Push reply button to the right */
}

.comment-content {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  white-space: pre-wrap;
}

.comment-input-area {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-input-area h4 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.comment-input-area textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  resize: vertical;
  min-height: 80px;
  margin-bottom: 10px;
}

.comment-input-area textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
}


.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-small {
  padding: 5px 10px;
  font-size: 12px;
  border-radius: 6px;
  margin-left: 8px;
}

.btn-reply {
  background-color: #6c757d;
  color: #fff;
}
.btn-reply:hover {
  background-color: #5a6268;
}

.reply-indicator {
  background-color: #e9ecef;
  border-left: 3px solid #007bff;
  padding: 8px 12px;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #495057;
}

.reply-indicator p {
  margin: 0;
}

/* Reference Styling */
.reference-container {
  display: flex;
  align-items: flex-start; /* Align button with first row if needed */
  gap: 12px;
  flex-wrap: wrap; /* Allow wrapping */
}

.reference-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr); /* Enforce 6 items per row */
  gap: 8px;
  width: 100%; /* Occupy full width */
}

.reference-badge {
  background-color: #f3f4f6;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 13px;
  color: #374151;
  display: flex; /* Changed to flex for centering content */
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e7eb;
  white-space: nowrap; /* Prevent wrapping inside badge */
  overflow: hidden;
  text-overflow: ellipsis;
}

.ref-id {
  color: #9ca3af;
  font-size: 11px;
  margin-left: 4px;
}

.btn-text-cancel {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px; /* Added from context */
  text-decoration: underline; /* Added from context */
}
.btn-text-cancel:hover {
  color: #dc3545;
}

.btn-text-more {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 8px;
  text-decoration: underline;
}
.btn-text-more:hover {
  color: #111827;
}



/* Updated Comment Input */
.comment-textarea {
  flex-grow: 1;
  min-height: 48px; /* Start smaller */
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: none;
  transition: all 0.2s;
}
.comment-textarea:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  min-height: 80px; /* Expand on focus */
}

.input-wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.btn-send-custom {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  height: 44px; /* Align with initial textarea height roughly */
  white-space: nowrap;
}
.btn-send-custom:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}
.btn-send-custom:hover:not(:disabled) {
  background-color: #2563eb;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.modal-content textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 20px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
}

.modal-content textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
