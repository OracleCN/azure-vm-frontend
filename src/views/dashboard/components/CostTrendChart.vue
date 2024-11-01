<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from "vue"
import type { EChartsOption } from "echarts"
import * as echarts from "echarts/core"
import { BarChart, LineChart } from "echarts/charts"
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  DataZoomComponent
} from "echarts/components"
import { CanvasRenderer } from "echarts/renderers"

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  LineChart,
  MarkLineComponent,
  DataZoomComponent,
  CanvasRenderer
])

interface CostData {
  month: string
  cost: number
  budget: number
}

interface Props {
  data?: CostData[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false
})

const emit = defineEmits(["timeRangeChange"])

const timeRange = ref("30")
const costChartRef = ref<HTMLElement | null>(null)
const chartInitialized = ref(false)
let chartInstance: echarts.ECharts | null = null

const totalCost = computed(() => {
  return props.data.reduce((sum, item) => sum + item.cost, 0).toLocaleString()
})

const handleTimeRangeChange = (value: string) => {
  emit("timeRangeChange", value)
}

const getChartOption = (): EChartsOption => {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: function (params: any) {
        const costItem = params[0]
        const budgetItem = params[1]
        return `${costItem.name}<br/>
               实际支出: $${costItem.value.toLocaleString()}<br/>
               预算: $${budgetItem.value.toLocaleString()}`
      }
    },
    legend: {
      data: ["实际支出", "预算"],
      right: "4%",
      top: "0%"
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "8%",
      top: "40px",
      containLabel: true
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100
      },
      {
        show: true,
        type: "slider",
        top: "93%",
        start: 0,
        end: 100
      }
    ],
    xAxis: {
      type: "category",
      data: props.data.map((item) => item.month),
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: "#E0E0E0"
        }
      },
      axisLabel: {
        color: "#666",
        interval: 0,
        rotate: props.data.length > 12 ? 45 : 0
      }
    },
    yAxis: {
      type: "value",
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#E0E0E0"
        }
      },
      axisLabel: {
        formatter: (value: number) => `$${value.toLocaleString()}`
      }
    },
    series: [
      {
        name: "实际支出",
        type: "bar",
        barWidth: "30%",
        data: props.data.map((item) => item.cost),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#83bff6" },
            { offset: 0.5, color: "#188df0" },
            { offset: 1, color: "#188df0" }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#66a6ff" },
              { offset: 0.7, color: "#1677ff" },
              { offset: 1, color: "#1677ff" }
            ])
          }
        }
      },
      {
        name: "预算",
        type: "line",
        data: props.data.map((item) => item.budget),
        symbol: "circle",
        symbolSize: 8,
        itemStyle: {
          color: "#ff9f7f"
        },
        lineStyle: {
          type: "dashed",
          color: "#ff9f7f",
          width: 2
        }
      }
    ]
  }
}

const tryInitChart = async () => {
  if (!costChartRef.value || chartInitialized.value) return

  // Wait for next frame to ensure container is rendered
  await new Promise((resolve) => requestAnimationFrame(resolve))

  const container = costChartRef.value
  const { clientWidth, clientHeight } = container

  if (clientWidth === 0 || clientHeight === 0) {
    // Retry after a short delay if dimensions are not available
    setTimeout(tryInitChart, 100)
    return
  }

  try {
    chartInstance = echarts.init(container, undefined, {
      renderer: "canvas",
      useDirtyRect: true
    })

    chartInstance.setOption(getChartOption())
    chartInitialized.value = true

    const resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })

    resizeObserver.observe(container)

    onUnmounted(() => {
      resizeObserver.disconnect()
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
    })
  } catch (error) {
    console.error("Chart initialization failed:", error)
  }
}

const updateChart = () => {
  if (!chartInstance || !chartInitialized.value) return

  try {
    chartInstance.setOption(getChartOption())
  } catch (error) {
    console.error("Chart update failed:", error)
  }
}

watch(
  () => props.data,
  () => {
    nextTick(() => {
      if (!chartInitialized.value) {
        tryInitChart()
      } else {
        updateChart()
      }
    })
  },
  { deep: true }
)

watch(
  () => props.loading,
  (newValue) => {
    if (chartInstance) {
      newValue ? chartInstance.showLoading() : chartInstance.hideLoading()
    }
  }
)

onMounted(() => {
  tryInitChart()
})
</script>

<template>
  <div class="chart-container w-full min-h-[500px]">
    <el-card class="chart-card h-full">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <h3 class="title">费用趋势</h3>
            <div class="total">
              总支出：<span class="amount">${{ totalCost }}</span>
            </div>
          </div>
          <el-select v-model="timeRange" class="w-[120px]" @change="handleTimeRangeChange">
            <el-option label="最近7天" value="7" />
            <el-option label="最近30天" value="30" />
            <el-option label="最近90天" value="90" />
          </el-select>
        </div>
      </template>
      <div ref="costChartRef" class="cost-chart" />
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.chart-container {
  .chart-card {
    min-height: inherit;
    background: #fff;
    border-radius: 8px;

    :deep(.el-card__header) {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    :deep(.el-card__body) {
      height: calc(100% - 73px); /* Header height (57px) + padding */
      padding: 0;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: baseline;
        gap: 16px;

        .title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: #1f2937;
        }

        .total {
          color: #6b7280;
          font-size: 14px;

          .amount {
            color: #1f2937;
            font-weight: 500;
            font-size: 16px;
          }
        }
      }
    }

    .cost-chart {
      width: 100%;
      height: 100%;
      min-height: 400px;
      padding: 12px;
    }
  }
}
</style>
