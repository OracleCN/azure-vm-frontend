<template>
  <div class="p-5 bg-[#f5f7fa]">
    <!-- 顶部卡片统计 -->
    <el-row :gutter="20" class="mb-5">
      <el-col :xs="24" :sm="12" :lg="6" v-for="card in statsCards" :key="card.title">
        <el-card>
          <div class="flex items-center">
            <el-icon
              class="text-[32px] sm:text-[48px] mr-3 sm:mr-4 shrink-0"
              :class="{
                'text-[#409eff]': card.iconClass === 'blue',
                'text-[#67c23a]': card.iconClass === 'green',
                'text-[#f56c6c]': card.iconClass === 'red',
                'text-[#b983ff]': card.iconClass === 'purple'
              }"
            >
              <component :is="card.icon" />
            </el-icon>
            <div class="min-w-0">
              <div class="text-sm text-[#909399] truncate">{{ card.title }}</div>
              <div class="text-xl sm:text-2xl font-bold mt-1 truncate">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间区域：图表和状态 -->
    <el-row :gutter="20" class="mb-5">
      <!-- 费用趋势图 -->
      <el-col :xs="24" :lg="16">
        <cost-trend-chart :data="costData" :loading="loading" @timeRangeChange="handleTimeRangeChange" />
      </el-col>

      <!-- 账号状态 -->
      <el-col :xs="24" :lg="8">
        <el-card>
          <template #header>
            <div class="flex justify-between items-center">
              <span class="truncate">账号状态</span>
              <el-button type="primary" size="small" link>查看详情</el-button>
            </div>
          </template>
          <div>
            <div v-for="account in accounts" :key="account.name" class="py-3 border-b border-[#ebeef5] last:border-b-0">
              <div class="flex justify-between items-center mb-2">
                <span class="font-medium truncate mr-2 flex-1">{{ account.name }}</span>
                <el-tag :type="account.status === 'normal' ? 'success' : 'danger'" size="small" class="shrink-0">
                  {{ account.status === "normal" ? "正常" : "异常" }}
                </el-tag>
              </div>
              <div class="flex justify-between text-[13px] text-[#909399]">
                <span class="truncate flex-1">资源: {{ account.resources }}</span>
                <span class="truncate ml-2 shrink-0">支出: ${{ account.cost }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部标签页 -->
    <el-card>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="资源概览" name="resources">
          <el-row :gutter="20" class="-mb-5">
            <el-col :xs="12" :sm="12" :md="6" v-for="(resource, index) in resources" :key="index" class="mb-5">
              <div class="flex items-center p-2 sm:p-4 bg-white rounded shadow-sm h-full">
                <el-icon
                  class="text-[24px] sm:text-[32px] mr-2 sm:mr-3 shrink-0"
                  :class="{
                    'text-[#409eff]': resource.iconClass === 'blue',
                    'text-[#67c23a]': resource.iconClass === 'green',
                    'text-[#b983ff]': resource.iconClass === 'purple',
                    'text-[#e6a23c]': resource.iconClass === 'orange'
                  }"
                >
                  <component :is="resource.icon" />
                </el-icon>
                <div class="min-w-0">
                  <div class="text-xs sm:text-sm text-[#909399] truncate">{{ resource.title }}</div>
                  <div class="text-lg sm:text-xl font-bold mt-1 truncate">{{ resource.value }}</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="告警信息" name="alerts">
          <el-table :data="alerts" style="width: 100%">
            <el-table-column prop="time" label="时间" width="180" />
            <el-table-column prop="level" label="级别" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.level === 'high' ? 'danger' : 'warning'" class="shrink-0">
                  {{ scope.row.level === "high" ? "高" : "中" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="告警信息" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'danger' : 'success'" class="shrink-0">
                  {{ scope.row.status === "active" ? "未处理" : "已处理" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="成本分析" name="costs">
          <el-table :data="costAnalysis" style="width: 100%">
            <el-table-column prop="account" label="账号" show-overflow-tooltip />
            <el-table-column prop="resource" label="资源类型" show-overflow-tooltip />
            <el-table-column prop="cost" label="费用" width="120">
              <template #default="scope">
                <span class="shrink-0">${{ scope.row.cost }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.trend === 'up' ? 'danger' : 'success'" class="shrink-0">
                  {{ scope.row.trend === "up" ? "↑" : "↓" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import CostTrendChart from "./CostTrendChart.vue"

// 数据定义
const statsCards = [
  { title: "总账号数", value: "12", icon: "Monitor", iconClass: "blue" },
  { title: "本月支出", value: "$3,245", icon: "Money", iconClass: "green" },
  { title: "活跃告警", value: "5", icon: "Warning", iconClass: "red" },
  { title: "资源总数", value: "156", icon: "Connection", iconClass: "purple" }
]

const accounts = [
  { name: "Production", status: "normal", resources: "45", cost: "1,234" },
  { name: "Development", status: "normal", resources: "32", cost: "856" },
  { name: "Testing", status: "error", resources: "28", cost: "654" }
]

const resources = [
  { title: "虚拟机", value: "32", icon: "Odometer", iconClass: "blue" },
  { title: "数据库", value: "15", icon: "DataLine", iconClass: "green" },
  { title: "存储账户", value: "24", icon: "Box", iconClass: "purple" },
  { title: "用户数", value: "85", icon: "User", iconClass: "orange" }
]

const alerts = [
  { time: "2024-03-01 10:00", level: "high", message: "CPU使用率超过90%", status: "active" },
  { time: "2024-03-01 09:30", level: "medium", message: "内存使用率超过80%", status: "resolved" }
]

const costAnalysis = [
  { account: "Production", resource: "虚拟机", cost: "856", trend: "up" },
  { account: "Development", resource: "数据库", cost: "432", trend: "down" }
]

// 响应式变量
const activeTab = ref("resources")
// 费用数据
const costData = ref([
  { month: "1月", cost: 1200, budget: 700 },
  { month: "2月", cost: 1400, budget: 1200 },
  { month: "3月", cost: 1100, budget: 500 },
  { month: "4月", cost: 1600, budget: 1500 },
  { month: "5月", cost: 1350, budget: 900 },
  { month: "6月", cost: 1800, budget: 1200 }
])

const loading = ref(false)

// 处理时间范围变化
const handleTimeRangeChange = async (timeRange: string) => {
  try {
    loading.value = true
    // 这里可以调用 API 获取新的数据
    await fetchCostData(timeRange)
  } catch (error) {
    console.error("获取费用数据失败:", error)
  } finally {
    loading.value = false
  }
}

// 模拟获取数据的函数
const fetchCostData = async (_timeRange: string) => {
  // 实际项目中这里应该调用后端 API
  await new Promise((resolve) => setTimeout(resolve, 1000))
  // 模拟数据更新
  costData.value = costData.value.map((item) => ({
    ...item,
    cost: Math.floor(Math.random() * 2000) + 1000
  }))
}
</script>
<style>
/* 保持原有样式 */
.el-card {
  @apply overflow-hidden;
}

.el-card__body {
  @apply p-5;
}

/* 特殊处理图表卡片 */
.chart-container .el-card__body {
  @apply h-[calc(100%-73px)] p-0;
}

/* 修复行间距 */
.el-row {
  @apply mb-5 last:mb-0;
}

/* 确保列间距正确 */
.el-col {
  @apply pb-5;
}

@media (min-width: 992px) {
  .el-col {
    @apply pb-0;
  }
}

/* 表格样式修复 */
.el-table {
  @apply w-full;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .el-card__body {
    @apply p-3;
  }

  .el-tabs__header {
    @apply mx-0;
  }

  .el-table {
    @apply text-sm;
  }

  .el-table .cell {
    @apply truncate;
  }
}
</style>
