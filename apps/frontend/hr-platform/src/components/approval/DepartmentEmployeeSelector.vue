<template>
  <div class="department-employee-selector-container">
    <label v-if="label">{{ label }}</label>

    <div class="selector-group">
      <!-- Department Selector -->
      <div class="department-select-wrapper">
        <select v-model="selectedDeptId" class="input-field department-select">
          <option value="">-- 부서 선택 --</option>
          <option
            v-for="dept in departments"
            :key="dept.deptId"
            :value="dept.deptId"
          >
            {{ dept.deptName }}
          </option>
        </select>
      </div>

      <!-- Employee Selector -->
      <div class="employee-selector-wrapper">
        <select
          v-model="tempSelectedEmployeeId"
          @change="handleEmployeeSelect"
          class="input-field employee-select"
          :disabled="!selectedDeptId"
        >
          <option value="">-- 사원 선택 --</option>
          <option
            v-for="employee in filteredEmployees"
            :key="employee.accId"
            :value="employee.accId"
          >
            {{ employee.name }} ({{ employee.accId }})
          </option>
        </select>
      </div>
    </div>

    <!-- 🔥 부서 전체 선택 (button ❌, div ⭕) -->
    <div
      v-if="allowDeptSelection && selectedDeptId"
      class="btn-dept-bulk"
      role="button"
      @click="selectEntireDepartment"
    >
      부서 전체 사원 선택
    </div>

    <!-- Selected Employees -->
    <div v-if="selectedEmployees.length > 0" class="selected-tags">
      <span
        v-for="employee in selectedEmployees"
        :key="employee.accId"
        class="employee-tag"
      >
        {{ employee.name }} ({{ employee.accId }})
        <span
          class="remove-tag-btn"
          role="button"
          @click="removeEmployee(employee)"
        >
          ✕
        </span>
      </span>
    </div>

    <small v-if="hint" class="hint">
      {{ hint }}
      <template v-if="maxItems < 99">
        (최대 {{ maxItems }}명)
      </template>
    </small>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, defineProps, defineEmits } from 'vue';
import { getAllDepartmentsByCompany } from '@/api/departmentApi';
import { fetchUserAccounts } from '@/api/userAccount';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  label: { type: String, default: '' },
  hint: { type: String, default: '' },
  modelValue: { type: Array, default: () => [] },
  maxItems: { type: Number, default: 100 },
  allowDeptSelection: { type: Boolean, default: false },
  valueField: { type: String, default: 'accId' },
});

const emit = defineEmits(['update:modelValue']);
const authStore = useAuthStore();

const departments = ref([]);
const selectedDeptId = ref('');
const allEmployeesInDept = ref([]);
const selectedEmployees = ref([]);
const tempSelectedEmployeeId = ref('');

/* ================= computed ================= */
const filteredEmployees = computed(() => {
  const currentUserId = Number(authStore.user?.employeeId);
  return allEmployeesInDept.value.filter(
    (emp) =>
      !selectedEmployees.value.some((s) => s.accId === emp.accId) &&
      Number(emp.accId) !== currentUserId
  );
});

/* ================= watch ================= */
watch(selectedDeptId, async (deptId) => {
  allEmployeesInDept.value = [];
  if (deptId) {
    await fetchEmployeesByDepartment(deptId);
  }
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal?.length && selectedEmployees.value.length === 0) {
      selectedEmployees.value = newVal.map((id) =>
        props.valueField === 'empId'
          ? { empId: id, accId: id, name: `Employee ${id}` }
          : { accId: id, name: `User ${id}` }
      );
    }
  },
  { immediate: true }
);

/* ================= methods ================= */
const fetchDepartments = async () => {
  try {
    const res = await getAllDepartmentsByCompany(authStore.user?.companyId);
    const rawData = res.data?.data?.departments || res.data?.data || [];
    
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

const fetchEmployeesByDepartment = async (deptId) => {
  const res = await fetchUserAccounts({ deptId });
  const accounts = res.data.data.accounts || [];
  allEmployeesInDept.value = accounts.map((u) => ({
    accId: u.accId,
    empId: u.empId,
    name: u.name,
  }));
};

const handleEmployeeSelect = () => {
  if (!tempSelectedEmployeeId.value) return;

  if (selectedEmployees.value.length >= props.maxItems) {
    alert(`최대 ${props.maxItems}명까지 선택 가능합니다.`);
    tempSelectedEmployeeId.value = '';
    return;
  }

  const employee = allEmployeesInDept.value.find(
    (e) => e.accId === tempSelectedEmployeeId.value
  );

  if (employee) {
    selectedEmployees.value.push(employee);
    emitSelectedIds();
  }

  tempSelectedEmployeeId.value = '';
};

const selectEntireDepartment = () => {
  const currentUserId = Number(authStore.user?.employeeId);

  const toAdd = allEmployeesInDept.value.filter(
    (emp) =>
      !selectedEmployees.value.some((s) => s.accId === emp.accId) &&
      Number(emp.accId) !== currentUserId
  );

  if (!toAdd.length) {
    alert('이미 해당 부서의 모든 사원이 선택되었습니다.');
    return;
  }

  if (selectedEmployees.value.length + toAdd.length > props.maxItems) {
    alert(`최대 ${props.maxItems}명을 초과합니다.`);
    return;
  }

  const deptName =
    departments.value.find((d) => d.deptId === selectedDeptId.value)
      ?.deptName || '';

  if (confirm(`${deptName} 전체 사원(${toAdd.length}명)을 추가하시겠습니까?`)) {
    selectedEmployees.value.push(...toAdd);
    emitSelectedIds();
  }
};

const removeEmployee = (emp) => {
  selectedEmployees.value = selectedEmployees.value.filter(
    (e) => e.accId !== emp.accId
  );
  emitSelectedIds();
};

const emitSelectedIds = () => {
  emit(
    'update:modelValue',
    selectedEmployees.value.map((e) =>
      props.valueField === 'empId' ? e.empId : e.accId
    )
  );
};

onMounted(fetchDepartments);
</script>

<style scoped>
.department-employee-selector-container {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

/* ================= selectors ================= */

.selector-group {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.department-select-wrapper {
  flex: 1;
}

.employee-selector-wrapper {
  flex: 2;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  box-sizing: border-box;
}

.input-field:focus {
  border-color: #2563eb;
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* ================= 부서 전체 선택 (보조 액션) ================= */

.btn-dept-bulk {
  margin-top: 8px;
  width: 100%;
  padding: 8px 12px;

  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;

  font-size: 13px;
  font-weight: 500;
  color: #334155;
  text-align: center;

  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.btn-dept-bulk:hover {
  background-color: #eef2f7;
  border-color: #94a3b8;
}

/* ================= selected tags ================= */

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.employee-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  background-color: #e8f3ff;
  border: 1px solid #d0e5ff;
  border-radius: 12px;
  padding: 6px 12px;

  font-size: 13px;
  font-weight: 500;
  color: #2563eb;
}

.remove-tag-btn {
  cursor: pointer;
  font-size: 14px;
  color: #2563eb;
  opacity: 0.7;
}

.remove-tag-btn:hover {
  opacity: 1;
  color: #1d4ed8;
}

/* ================= hint ================= */

.hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}
</style>
