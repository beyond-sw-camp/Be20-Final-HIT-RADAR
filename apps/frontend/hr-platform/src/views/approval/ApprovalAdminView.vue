<template>
  <div class="page">
    <div class="section-title">
      <h1>결재 관리 (인사팀)</h1>
      <div class="sub">전체 결재 문서를 조회하고 관리합니다.</div>
    </div>

    <section class="card filter-card">
      <div class="filter-group">
        <div class="filter-item">
          <label for="searchDocType">문서 유형</label>
          <select id="searchDocType" v-model="searchParams.docType">
            <option value="">전체</option>
            <option value="VACATION_REQUEST">휴가 신청</option>
            <option value="EXPENSE_REPORT">경비 보고서</option>
            <option value="BUSINESS_TRIP">출장 신청</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="searchStatus">상태</label>
          <select id="searchStatus" v-model="searchParams.status">
            <option value="">전체</option>
            <option value="DRAFT">임시저장</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">반려</option>
            <option value="WITHDRAWN">회수</option>
          </select>
        </div>
        <div class="filter-item">
          <label for="searchDeptId">부서</label>
          <select id="searchDeptId" v-model="searchParams.deptId">
            <option :value="null">전체</option>
            <option v-for="dept in departments" :key="dept.deptId" :value="dept.deptId">
              {{ dept.deptName }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label for="searchEmpId">사원 ID</label>
          <input type="number" id="searchEmpId" v-model="searchParams.empId" placeholder="사원 ID" />
        </div>
        <div class="filter-item">
          <label for="searchSort">정렬</label>
          <select id="searchSort" v-model="searchParams.sort">
            <option value="">기본</option>
            <option value="ASC">오름차순</option>
            <option value="DESC">내림차순</option>
          </select>
        </div>

      </div>
    </section>

    <section class="card document-list">
      <table class="table">
        <thead>
          <tr>
            <th>문서 ID</th>
            <th>제목</th>
            <th>문서 유형</th>
            <th>상태</th>
            <th>부서명</th>
            <th>기안자</th>
            <th>제출 일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="documents.length === 0">
            <td colspan="7" class="no-data">조회된 문서가 없습니다.</td>
          </tr>
          <tr v-for="(doc, index) in documents" :key="doc.docId" @click="goToDetail(doc.docId)">
            <td>{{ index + 1 }}</td>
            <td>{{ doc.title }}</td>
            <td>{{ doc.docType }}</td>
            <td>{{ doc.status }}</td>
            <td>{{ doc.deptName }}</td>
            <td>{{ doc.writerName }} ({{ doc.writerId }})</td>
            <td>{{ formatDate(doc.submittedAt) }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { fetchAdminAllDocuments } from '@/api/approvalApi';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const documents = ref([]);
const departments = ref([]);
const searchParams = ref({
  docType: '',
  status: '',
  deptId: null,
  empId: null,
  sort: '',
});

const fetchDocuments = async () => {
  try {
    const params = Object.fromEntries(
      Object.entries(searchParams.value).filter(([, value]) => value !== null && value !== '')
    );
    const response = await fetchAdminAllDocuments(params);
    documents.value = response.data.data;
  } catch (error) {
    console.error('Failed to fetch admin documents:', error);
  }
};

const fetchDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany(authStore.user?.companyId);
    const rawData = res.data?.data?.departments || res.data?.data || [];
    
    // Recursive function to flatten the department tree
    const flattenDepts = (data) => {
      if (!data) return [];
      if (Array.isArray(data)) {
        let result = [];
        data.forEach(item => {
          result.push(item);
          if (item.children && Array.isArray(item.children)) {
            result = result.concat(flattenDepts(item.children));
          }
        });
        return result;
      }
      return [data];
    };

    const flatList = flattenDepts(rawData);
    
    departments.value = flatList.map(d => ({
      deptId: d.deptId || d.id || d.departmentId,
      deptName: d.deptName || d.name || d.departmentName
    })).filter(d => d.deptId);

  } catch (error) {
    console.error('Failed to fetch departments:', error);
  }
};

watch(searchParams, fetchDocuments, { deep: true });

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
  fetchDepartments();
  fetchDocuments();
});
</script>

<style scoped>
.page {
  max-width: 1200px; /* Wider for admin view */
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

.section-title .sub {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.filter-card {
  padding: 18px 24px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: flex-end;
}

.filter-item {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 150px;
}

.filter-item label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 5px;
}

.filter-item select,
.filter-item input[type="number"] {
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  box-sizing: border-box;
}


.document-list {
  margin-top: 0; /* Adjust margin as filter card is above */
}

.table {
  width: 100%;
  border-collapse: collapse;
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
