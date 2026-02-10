<template>
  <div class="page">
    <div class="section-title">
      <h1>참조 문서함</h1>
    </div>

    <section class="card document-list">
      <table class="table">
        <thead>
          <tr>
            <th>문서 ID</th>
            <th>제목</th>
            <th>문서 유형</th>
            <th>상태</th>
            <th>제출 일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="documents.length === 0">
            <td colspan="5" class="no-data">조회된 문서가 없습니다.</td>
          </tr>
          <tr v-for="(doc, index) in documents" :key="doc.docId" @click="goToDetail(doc.docId)">
            <td>{{ index + 1 }}</td>
            <td>{{ doc.title }}</td>
            <td>{{ doc.docType }}</td>
            <td>{{ doc.status }}</td>
            <td>{{ formatDate(doc.submittedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { fetchReferenceDocuments } from '@/api/approvalApi';

const router = useRouter();
const documents = ref([]);

const fetchDocuments = async () => {
  try {
    const response = await fetchReferenceDocuments();
    documents.value = response.data.data;
  } catch (error) {
    alert('참조 문서 목록을 불러오는 데 실패했습니다.');
    console.error('Failed to fetch reference documents:', error);
  }
};

const goToDetail = (docId) => {
  router.push(`/approval/${docId}`);
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
  fetchDocuments();
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
  color: #333;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.document-list {
  margin-top: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.table th,
.table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #555;
}

.table tbody tr {
  cursor: pointer;
}

.table tbody tr:hover {
  background-color: #f1f1f1;
}

.no-data {
  text-align: center;
  color: #888;
  padding: 40px;
}
</style>
