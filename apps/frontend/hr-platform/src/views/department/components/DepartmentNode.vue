<template>
  <div class="dept-node">
    <div v-for="child in node.children" :key="child.deptId" class="dept-branch">
      <div class="node-content">
        <span class="branch-line">└</span>
        <span class="node-icon">📁</span>
        <span class="node-name">{{ child.deptName }}</span>
        <span v-if="child.managerEmpId" class="node-manager">(ID: {{ child.managerEmpId }})</span>
      </div>
      <!-- Recursive Call -->
      <div v-if="child.children && child.children.length" class="node-children">
        <DepartmentNode :node="child" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  node: {
    type: Object,
    required: true
  }
})
</script>

<script>
// Recursive component definition for Vue
export default {
  name: 'DepartmentNode'
}
</script>

<style scoped>
.dept-node {
  padding-left: 24px;
}
.node-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}
.branch-line {
  color: #cbd5e1;
  font-family: monospace;
}
.node-name {
  font-weight: 500;
  color: #334155;
}
.node-manager {
  font-size: 0.8rem;
  color: #94a3b8;
}
.node-children {
  border-left: 1px dashed #e2e8f0;
  margin-left: 4px; /* Align with branch line */
}
</style>
