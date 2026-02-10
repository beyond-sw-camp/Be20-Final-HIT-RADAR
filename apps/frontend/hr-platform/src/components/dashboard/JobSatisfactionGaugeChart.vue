<template>
  <div ref="chartRef" class="gauge-chart"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  percentage: { type: Number, required: true }
})

const chartRef = ref(null)
let chart = null

const option = () => ({
  series: [
    {
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      progress: {
        show: true,
        width: 14,
        itemStyle: { color: '#4F46E5' }
      },
      axisLine: {
        lineStyle: {
          width: 14,
          color: [[1, '#E5E7EB']]
        }
      },
      pointer: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        fontSize: 28,
        fontWeight: 800,
        color: '#4338CA',
        offsetCenter: [0, '10%']
      },
      data: [{ value: props.percentage }]
    }
  ]
})

const render = async () => {
  if (!chartRef.value) return
  await nextTick()
  chart ||= echarts.init(chartRef.value)
  chart.setOption(option())
}

onMounted(render)
watch(() => props.percentage, render)
onBeforeUnmount(() => chart?.dispose())
</script>

<style scoped>
.gauge-chart {
  height: 180px;
  width: 100%;
}
</style>
