<template>
  <div class="job-bar-chart">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true }
})

const chartRef = ref(null)
let chart = null

const option = () => ({
  grid: { left: '4%', right: '6%', top: '6%', bottom: '6%', containLabel: true },
  xAxis: {
    type: 'value',
    max: 100,
    axisLabel: { formatter: '{value}%', color: '#9CA3AF' },
    splitLine: { lineStyle: { color: '#F3F4F6' } }
  },
  yAxis: {
    type: 'category',
    data: props.labels,
    axisLabel: { color: '#374151', fontSize: 12 }
  },
  tooltip: {
    trigger: 'axis',
    formatter: p => `${p[0].name}<br/><b>${p[0].value}%</b>`
  },
  series: [
    {
      type: 'bar',
      data: props.values,
      barWidth: 18,
      label: {
        show: true,
        position: 'right',
        formatter: '{c}%',
        color: '#4F46E5',
        fontWeight: 600
      },
      itemStyle: {
        borderRadius: [0, 8, 8, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#A5B4FC' },
          { offset: 1, color: '#4F46E5' }
        ])
      }
    }
  ]
})

const render = async () => {
  if (!chartRef.value) return
  await nextTick()
  chart ||= echarts.init(chartRef.value)
  chart.setOption(option())
  chart.resize()
}

onMounted(render)
watch(() => [props.labels, props.values], render, { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>

<style scoped>
.chart { height: 260px; width: 100%; }
</style>
