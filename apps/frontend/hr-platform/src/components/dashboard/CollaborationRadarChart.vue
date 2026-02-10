<template>
  <div class="radar-chart">
    <div ref="chartRef" class="chart"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  labels: {
    type: Array,
    required: true
  },
  values: {
    type: Array,
    required: true
  },
  max: {
    type: Number,
    default: 100
  }
})

const chartRef = ref(null)
let chartInstance = null

const createOption = () => ({
  radar: {
    radius: '65%',
    indicator: props.labels.map(label => ({
      name: label,
      max: props.max
    })),
    splitNumber: 4,
    axisName: {
      color: '#374151',
      fontSize: 12,
      fontWeight: 600
    },
    splitLine: {
      lineStyle: {
        color: '#E5E7EB'
      }
    },
    splitArea: {
      areaStyle: {
        color: ['#F9FAFB', '#FFFFFF']
      }
    },
    axisLine: {
      lineStyle: {
        color: '#D1D5DB'
      }
    }
  },
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    formatter: () => {
      return props.labels
        .map((l, i) => `${l}: <b>${props.values[i]}%</b>`)
        .join('<br/>')
    }
  },
  series: [
    {
      type: 'radar',
      data: [
        {
          value: props.values,
          name: '협업 지수',
          areaStyle: {
            color: 'rgba(99,102,241,0.25)'
          },
          lineStyle: {
            color: '#6366F1',
            width: 2
          },
          itemStyle: {
            color: '#6366F1'
          },
          label: {
            show: false
          }
        }
      ]
    }
  ]
})

const renderChart = async () => {
  if (!chartRef.value) return
  await nextTick()

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption(createOption())
  chartInstance.resize()
}

onMounted(renderChart)

watch(
  () => [props.labels, props.values],
  renderChart,
  { deep: true }
)

onBeforeUnmount(() => {
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<style scoped>
.radar-chart {
  width: 100%;
}

.chart {
  width: 100%;
  height: 260px;
}
</style>
