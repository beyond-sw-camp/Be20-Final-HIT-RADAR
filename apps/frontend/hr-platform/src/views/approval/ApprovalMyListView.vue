<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 문서 조회</h1>
    </div>

    <div class="tabs-container">
      <div class="status-cards">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['status-card', tab.id, { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          <span class="card-content">
            <span class="card-count">{{ counts[tab.id] }}</span>
            <span class="card-label">{{ tab.name }}</span>
          </span>
        </button>
      </div>

      <div class="tab-panel card">
        <div v-if="loading" class="loading-state">
          데이터를 불러오는 중입니다...
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th class="col-id">ID</th>
              <th class="col-title">문서 제목</th>
              <th class="col-type">문서 유형</th>
              <th class="col-status">결재 상태</th>
              <th class="col-date">제출 일시</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="documents.length === 0">
              <td colspan="5" class="no-data">조회된 문서가 없습니다.</td>
            </tr>
            <tr v-for="(doc, index) in documents" :key="doc.docId" @click="goToDetail(doc.docId)">
              <td class="id-cell">{{ index + 1 }}</td>
              <td class="title-cell">
                <span class="doc-title">{{ doc.title }}</span>
              </td>
              <td class="type-cell">
                <span class="doc-type-badge">{{ doc.docType }}</span>
              </td>
              <td class="status-cell">
                <ApprovalStatusTracker :status="doc.status" />
              </td>
              <td class="date-cell">{{ formatDate(doc.submittedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import ApprovalStatusTracker from '@/components/approval/ApprovalStatusTracker.vue';
import { 
  fetchMyDocuments, 
  fetchApprovalTasks, 
  fetchRejectedDocuments, 
  fetchReferenceDocuments 
} from '@/api/approvalApi';

const router = useRouter();
const documents = ref([]);
const loading = ref(false);
const currentTab = ref('my');

const tabs = [
  { id: 'my', name: '내 문서함' },
  { id: 'inbox', name: '결재 문서함' },
  { id: 'rejected', name: '반려 문서함' },
  { id: 'references', name: '참조 문서함' }
];

const counts = ref({
  my: 0,
  inbox: 0,
  rejected: 0,
  references: 0
});

const fetchDocuments = async () => {
  loading.value = true;
  try {
    let response;
    if (currentTab.value === 'my') {
      response = await fetchMyDocuments();
    } else if (currentTab.value === 'inbox') {
      response = await fetchApprovalTasks();
    } else if (currentTab.value === 'rejected') {
      response = await fetchRejectedDocuments();
    } else if (currentTab.value === 'references') {
      response = await fetchReferenceDocuments();
    }
    
    if (response && response.data && response.data.data) {
      documents.value = response.data.data;
      // Update count for current tab immediately
      counts.value[currentTab.value] = documents.value.length;
    } else {
      documents.value = [];
      counts.value[currentTab.value] = 0;
    }
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    documents.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchAllCounts = async () => {
  try {
    const [myRes, inboxRes, rejectedRes, refRes] = await Promise.allSettled([
      fetchMyDocuments(),
      fetchApprovalTasks(),
      fetchRejectedDocuments(),
      fetchReferenceDocuments()
    ]);

    if (myRes.status === 'fulfilled') counts.value.my = myRes.value.data.data?.length || 0;
    if (inboxRes.status === 'fulfilled') counts.value.inbox = inboxRes.value.data.data?.length || 0;
    if (rejectedRes.status === 'fulfilled') counts.value.rejected = rejectedRes.value.data.data?.length || 0;
    if (refRes.status === 'fulfilled') counts.value.references = refRes.value.data.data?.length || 0;
  } catch (error) {
    console.error('Failed to fetch counts:', error);
  }
};

watch(currentTab, () => {
  fetchDocuments();
});

const goToDetail = (docId) => {
  router.push(`/approval/${docId}`);
};

const formatDate = (datetime) => {
  if (!datetime) return '-';
  const date = new Date(datetime);
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// getStatusClass was unused and removed


onMounted(() => {
  fetchDocuments();
  fetchAllCounts();
});
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}
.section-title {
  margin-bottom: 32px;
}
.section-title h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.025em;
}

/* Dashboard Cards */
.status-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.status-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  text-align: left;
  border-left: 4px solid transparent;
}

.status-card.my { border-left-color: #3b82f6; }
.status-card.inbox { border-left-color: #8b5cf6; }
.status-card.rejected { border-left-color: #ef4444; }
.status-card.references { border-left-color: #10b981; }

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
  border-color: #d1d5db;
}

.status-card.active {
  border-color: #d1d5db;
}
.status-card.my.active { background-color: #eff6ff; }
.status-card.inbox.active { background-color: #f5f3ff; }
.status-card.rejected.active { background-color: #fef2f2; }
.status-card.references.active { background-color: #ecfdf5; }

.card-content {
    display: flex;
    flex-direction: column;
}

.card-count {
  font-size: 2.25rem;
  font-weight: 600;
  color: #111827;
  line-height: 1;
  margin-bottom: 8px;
}

.card-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #6b7280;
}



.tab-panel.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.loading-state, .no-data {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
  font-size: 16px;
}

/* Table Styles */
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
}

.table th {
  padding: 16px 24px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.col-id, .col-title, .col-type, .col-status, .col-date {
  width: 20%;
}

.table td {
  padding: 20px 24px;
  font-size: 15px;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.table tbody tr {
  cursor: pointer;
  transition: background 0.15s;
}

.table tbody tr:hover {
  background-color: #f9fafb;
}

.title-cell {
  font-weight: 500;
  color: #111827;
  font-size: 16px;
}

.date-cell {
  color: #6b7280;
  font-size: 14px;
}

.doc-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* Compact Table Styles */
.id-cell {
  font-size: 13px;
  color: #9ca3af;
}

.doc-title {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.doc-type-badge {
  font-size: 12px;
  color: #4b5563;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #e5e7eb;
}

.status-cell {
  padding: 12px 24px;
}
</style>
