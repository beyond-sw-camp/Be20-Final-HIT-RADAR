<template>
  <div>
    <GoalTreeItem
      v-for="goal in goals"
      :key="goal.goalId"
      :goal="goal"
      :level="1"
      :from="from"
    />
  </div>
</template>

<script setup>
import GoalTreeItem from './GoalTreeItem.vue'

defineProps({
  goals: {
    type: Array,
    required: true,
  },
  from: {
    type: String,
    default: null,
  },
})
</script>
