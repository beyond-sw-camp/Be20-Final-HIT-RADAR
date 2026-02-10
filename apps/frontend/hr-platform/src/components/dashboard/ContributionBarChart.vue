<template>
  <div class="contribution-chart">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  categories: Array,
  values: Array
})

const chartRef = ref(null)
let chartInstance = null

const createOption = () => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    formatter: params => {
      const p = params[0]
      return `<b>${p.name}</b><br/>기여도: ${p.value}%`
    }
  },
  grid: { left: '6%', right: '8%', top: '6%', bottom: '6%', containLabel: true },
  xAxis: {
    type: 'value',
    max: 100,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { formatter: '{value}%' }
  },
  yAxis: {
    type: 'category',
    data: props.categories,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { fontWeight: 600 }
  },
  series: [
    {
      type: 'bar',
      data: props.categories.map(() => 100),
      barGap: '-100%',
      silent: true,
      tooltip: { show: false },
      itemStyle: { color: '#F4F6FA', borderRadius: [0, 10, 10, 0] }
    },
    {
      type: 'bar',
      data: props.values,
      label: { show: true, position: 'right', formatter: '{c}%' },
      itemStyle: {
        borderRadius: [0, 10, 10, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#6C8CFF' },
          { offset: 1, color: '#4A6CF7' }
        ])
      }
    }
  ]
})

const renderChart = async () => {
  await nextTick()
  if (!chartInstance) chartInstance = echarts.init(chartRef.value)
  chartInstance.setOption(createOption())
}

onMounted(renderChart)
watch(() => [props.categories, props.values], renderChart)

onBeforeUnmount(() => chartInstance?.dispose())
</script>

<style scoped>
.chart {
  width: 100%;
  height: 220px;
}
</style>
