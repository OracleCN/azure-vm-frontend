<template>
  <div class="dashboard">
    <!-- 顶部卡片统计 -->
    <el-row :gutter="20" class="dashboard-header">
      <el-col :xs="24" :sm="12" :lg="6" v-for="card in statsCards" :key="card.title">
        <el-card class="stats-card">
          <div class="stats-content">
            <el-icon class="stats-icon" :class="card.iconClass">
              <component :is="card.icon" />
            </el-icon>
            <div class="stats-info">
              <div class="stats-title">{{ card.title }}</div>
              <div class="stats-value">{{ card.value }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 中间区域：图表和状态 -->
    <el-row :gutter="20" class="dashboard-main">
      <!-- 费用趋势图 -->
      <el-col :xs="24" :lg="16">
        <cost-trend-chart :data="costData" :loading="loading" @timeRangeChange="handleTimeRangeChange" />
      </el-col>

      <!-- 账号状态 -->
      <el-col :xs="24" :lg="8">
        <el-card class="status-card">
          <template #header>
            <div class="card-header">
              <span>账号状态</span>
              <el-button type="primary" size="small" link>查看详情</el-button>
            </div>
          </template>
          <div class="account-list">
            <div v-for="account in accounts" :key="account.name" class="account-item">
              <div class="account-info">
                <span class="account-name">{{ account.name }}</span>
                <el-tag :type="account.status === 'normal' ? 'success' : 'danger'" size="small">
                  {{ account.status === "normal" ? "正常" : "异常" }}
                </el-tag>
              </div>
              <div class="account-details">
                <span>资源: {{ account.resources }}</span>
                <span>支出: ${{ account.cost }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 底部标签页 -->
    <el-card class="dashboard-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="资源概览" name="resources">
          <el-row :gutter="20" class="resource-overview">
            <el-col :xs="24" :sm="12" :md="6" v-for="(resource, index) in resources" :key="index">
              <div class="resource-item">
                <el-icon :class="resource.iconClass">
                  <component :is="resource.icon" />
                </el-icon>
                <div class="resource-info">
                  <div class="resource-title">{{ resource.title }}</div>
                  <div class="resource-value">{{ resource.value }}</div>
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
                <el-tag :type="scope.row.level === 'high' ? 'danger' : 'warning'">
                  {{ scope.row.level === "high" ? "高" : "中" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="告警信息" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'active' ? 'danger' : 'success'">
                  {{ scope.row.status === "active" ? "未处理" : "已处理" }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="成本分析" name="costs">
          <el-table :data="costAnalysis" style="width: 100%">
            <el-table-column prop="account" label="账号" />
            <el-table-column prop="resource" label="资源类型" />
            <el-table-column prop="cost" label="费用">
              <template #default="scope"> ${{ scope.row.cost }} </template>
            </el-table-column>
            <el-table-column prop="trend" label="趋势">
              <template #default="scope">
                <el-tag :type="scope.row.trend === 'up' ? 'danger' : 'success'">
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

<style lang="scss" scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;

  &-header {
    margin-bottom: 20px;
  }

  &-main {
    margin-bottom: 20px;
  }

  .stats-card {
    margin-bottom: 20px;

    .stats-content {
      display: flex;
      align-items: center;

      .stats-icon {
        font-size: 48px;
        margin-right: 16px;

        &.blue {
          color: #409eff;
        }
        &.green {
          color: #67c23a;
        }
        &.red {
          color: #f56c6c;
        }
        &.purple {
          color: #b983ff;
        }
      }

      .stats-info {
        .stats-title {
          font-size: 14px;
          color: #909399;
        }

        .stats-value {
          font-size: 24px;
          font-weight: bold;
          margin-top: 4px;
        }
      }
    }
  }

  .chart-card {
    .cost-chart {
      height: 300px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .time-select {
      width: 120px;
    }
  }

  .status-card {
    .account-list {
      .account-item {
        padding: 12px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-child {
          border-bottom: none;
        }

        .account-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .account-name {
            font-weight: 500;
          }
        }

        .account-details {
          display: flex;
          justify-content: space-between;
          color: #909399;
          font-size: 13px;
        }
      }
    }
  }

  .resource-overview {
    .resource-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background-color: #fff;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

      .el-icon {
        font-size: 32px;
        margin-right: 12px;

        &.blue {
          color: #409eff;
        }
        &.green {
          color: #67c23a;
        }
        &.purple {
          color: #b983ff;
        }
        &.orange {
          color: #e6a23c;
        }
      }

      .resource-info {
        .resource-title {
          font-size: 14px;
          color: #909399;
        }

        .resource-value {
          font-size: 20px;
          font-weight: bold;
          margin-top: 4px;
        }
      }
    }
  }
}
</style>
