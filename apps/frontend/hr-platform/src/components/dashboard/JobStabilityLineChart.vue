<template>
  <div ref="chartRef" class="chart"></div>
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

const render = async () => {
  if (!chartRef.value) return
  await nextTick()

  if (!chart) {
    chart = echarts.init(chartRef.value)
  }

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: params =>
        `${params[0].axisValue}<br/><b>${params[0].data}건</b>`
    },
    grid: {
      left: 40,
      right: 20,
      top: 20,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: props.labels,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: {
        formatter: '{value}건',
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: { color: '#f3f4f6' }
      }
    },
    series: [
      {
        type: 'line',
        data: props.values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#6366f1'
        },
        itemStyle: {
          color: '#6366f1'
        },
        areaStyle: {
          color: 'rgba(99,102,241,0.15)'
        }
      }
    ]
  })

  chart.resize()
}

onMounted(render)
watch(() => [props.labels, props.values], render, { deep: true })
onBeforeUnmount(() => chart?.dispose())
</script>

<style scoped>
.chart {
  width: 100%;
  height: 260px;
}
</style>
