<template>
  <div class="min-h-[calc(100vh-84px)] bg-gray-50 p-6 sm:p-4">
    <!-- 搜索和操作栏 -->
    <div class="mb-6 rounded-lg bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <!-- 使用flex-col在移动端垂直布局 -->
      <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <!-- 搜索区域 -->
        <div class="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <el-input
            v-model="searchQuery"
            placeholder="搜索虚拟机..."
            class="w-full sm:w-80 transition-all duration-300 hover:shadow-sm"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch">搜索</el-button>
            </template>
          </el-input>

          <el-button
            type="primary"
            class="flex w-full sm:w-auto items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            @click="handleCreate"
          >
            <el-icon><Plus /></el-icon>
            创建虚拟机
          </el-button>
        </div>

        <!-- 刷新按钮 -->
        <el-button
          type="success"
          class="flex w-full sm:w-auto items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          @click="fetchData"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <el-table v-loading="loading" :data="tableData" class="w-full" @row-click="handleRowClick" border>
        <!-- 虚拟机名称列 -->
        <el-table-column label="虚拟机名称" prop="name" min-width="200" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <el-button link type="primary" class="text-sm font-medium">
              {{ row.name }}
            </el-button>
          </template>
        </el-table-column>

        <!-- 状态列 -->
        <el-table-column label="状态" prop="status" min-width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 资源组列 -->
        <el-table-column label="资源组" prop="resourceGroup" min-width="180" align="center" show-overflow-tooltip />

        <!-- 规格列 -->
        <el-table-column label="规格" prop="size" min-width="160" align="center" show-overflow-tooltip />

        <!-- CPU列 -->
        <el-table-column label="CPU" prop="core" min-width="100" align="center">
          <template #default="{ row }"> {{ row.core }}核 </template>
        </el-table-column>

        <!-- 内存列 -->
        <el-table-column label="内存" prop="memory" min-width="100" align="center">
          <template #default="{ row }"> {{ row.memory }}GB </template>
        </el-table-column>

        <!-- 公网IP列 -->
        <el-table-column label="公网IP" prop="publicIps" min-width="160" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.publicIps" class="text-blue-500">{{ row.publicIps }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 私网IP -->
        <el-table-column label="私网IP" prop="privateIps" min-width="160" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.privateIps">{{ row.privateIps }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- 电源状态列 -->
        <el-table-column label="电源状态" prop="powerState" min-width="120" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-2">
              <span
                class="h-2 w-2 rounded-full"
                :class="{
                  'bg-green-500': row.powerState === 'running',
                  'bg-gray-400': row.powerState === 'Stopped',
                  'bg-yellow-500': row.powerState === 'Starting'
                }"
              />
              <span>{{ row.powerState }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" min-width="160" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1">
              <template v-for="btn in buttonConfigs" :key="btn.operation">
                <el-tooltip :content="btn.title" placement="top" :show-after="500" :hide-after="300">
                  <el-button
                    v-if="btn.showCondition(row.powerState)"
                    :type="btn.type"
                    circle
                    size="small"
                    :icon="btn.icon"
                    class="operation-btn"
                    @click.stop="handleOperation(btn.operation, row)"
                  />
                </el-tooltip>
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end bg-white p-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          class="transform transition-all duration-300 hover:-translate-y-0.5"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :title="selectedVM?.name + ' 详细信息'"
      direction="rtl"
      size="500px"
      class="vm-drawer"
    >
      <template v-if="selectedVM">
        <el-descriptions :column="1" border>
          <el-descriptions-item
            v-for="(value, key) in selectedVM"
            :key="key"
            :label="key"
            class="transition-colors duration-300 hover:bg-gray-50"
          >
            {{ value }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue"
import type { Component } from "vue"
import { Search, Refresh, Plus, Delete, VideoPlay, VideoPause, RefreshRight, Edit } from "@element-plus/icons-vue"
import { useVMStore } from "@/store/modules/vms"
import type * as VM from "@/api/vms/types/vms"
import { ElMessageBox, ElMessage, ElLoading } from "element-plus"
import { useRouter } from "vue-router"

const tableData = ref<VM.VM[]>([])
const loading = ref(true)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const searchQuery = ref("")
const drawerVisible = ref(false)
const selectedVM = ref<VM.VM | null>(null)

const router = useRouter()

// 跳转到创建虚拟机页面
const handleCreate = () => {
  router.push("/vm/create")
}

interface ButtonConfig {
  type: "success" | "warning" | "primary" | "danger"
  icon: Component
  title: string
  operation: string
  showCondition: (powerState: string) => boolean
}

// 按钮配置
const buttonConfigs: ButtonConfig[] = [
  {
    type: "success",
    icon: VideoPlay,
    title: "启动",
    operation: "start",
    showCondition: (powerState) => powerState !== "running"
  },
  {
    type: "warning",
    icon: VideoPause,
    title: "关机",
    operation: "stop",
    showCondition: (powerState) => powerState === "running"
  },
  {
    type: "primary",
    icon: RefreshRight,
    title: "重启",
    operation: "restart",
    showCondition: (powerState) => powerState === "running"
  },
  {
    type: "primary",
    icon: Edit,
    title: "修改DNS别名",
    operation: "editDns",
    showCondition: () => true
  },
  {
    type: "danger",
    icon: Delete,
    title: "删除",
    operation: "delete",
    showCondition: () => true
  }
]

// 通用操作处理函数
const handleOperation = async (operation: string, row: VM.VM) => {
  const vmStore = useVMStore()
  const config = buttonConfigs.find((btn) => btn.operation === operation)
  if (!config) return

  if (operation === "editDns") {
    try {
      const { value: dnsAlias } = await ElMessageBox.prompt("请输入新的DNS前缀", "修改DNS别名", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: row.dnsAlias?.split(".")[0] || "",
        inputValidator: (value) => {
          if (!value) return "别名不能为空"
          const dnsRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/
          if (!dnsRegex.test(value)) {
            return "DNS前缀只能包含小写字母、数字和连字符，必须以字母开头，以字母或数字结尾"
          }
          if (value.length < 3 || value.length > 63) {
            return "DNS前缀长度必须在3-63个字符之间"
          }
          return true
        }
      })

      if (dnsAlias) {
        const loadingInstance = ElLoading.service({
          target: ".table-container",
          text: `正在${config.title}...`,
          background: "rgba(255, 255, 255, 0.7)"
        })

        try {
          await vmStore.updateDnsAlias(row.accountId, row.ID, dnsAlias)
          ElMessage.success("DNS别名修改成功")
          await fetchData()
        } finally {
          loadingInstance.close()
        }
      }
    } catch (error) {
      if (error !== "cancel") {
        ElMessage.error("修改失败")
        console.error(error)
      }
    }
    return
  }

  try {
    await ElMessageBox.confirm(`是否确认${config.title}虚拟机 ${row.name}？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: operation === "delete" ? "warning" : "info"
    })

    const loadingInstance = ElLoading.service({
      target: ".table-container",
      text: `正在${config.title}...`,
      background: "rgba(255, 255, 255, 0.7)"
    })

    try {
      switch (operation) {
        case "start":
          await vmStore.operateVM(row.accountId, row.ID, "start")
          break
        case "stop":
          await vmStore.operateVM(row.accountId, row.ID, "stop")
          break
        case "restart":
          await vmStore.operateVM(row.accountId, row.ID, "restart")
          break
        case "delete":
          await vmStore.operateVM(row.accountId, row.ID, "delete")
          break
      }

      ElMessage.success(`${config.title}成功`)
      await fetchData()
    } finally {
      loadingInstance.close()
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error(`${config.title}失败`)
      console.error(error)
    }
  }
}

// 处理行点击
const handleRowClick = (row: VM.VM) => {
  selectedVM.value = row
  drawerVisible.value = true
}

// 分页查询
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}

// 搜索过滤
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const fetchData = async () => {
  const vmStore = useVMStore()
  loading.value = true
  await vmStore.fetchVMs()
  tableData.value = vmStore.paginatedVMs
  total.value = vmStore.total
  loading.value = false
}

onMounted(() => {
  fetchData()
})

// 状态样式处理函数
type TagType = "success" | "warning" | "info" | "primary" | "danger"

const createStatusMapper = (statusMap: Record<string, TagType>) => {
  return (status: string): TagType => statusMap[status] || "info"
}

const getStatusType = createStatusMapper({
  succeeded: "success",
  Stopped: "info",
  Failed: "danger"
})

// const getPowerStateType = createStatusMapper({
//   running: "success",
//   Stopped: "info",
//   Starting: "warning"
// })

// const getSyncStatusType = createStatusMapper({
//   synced: "success",
//   Syncing: "warning",
//   Failed: "danger"
// })
</script>

<style scoped>
/* 基础样式 */
.vm-drawer :deep(.el-drawer__header) {
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
}

/* 表格基础样式 */
.el-table {
  --el-table-header-bg-color: #f8fafc;
  --el-table-border-color: #e5e7eb;
  --el-table-header-text-color: #374151;
  --el-table-row-hover-bg-color: #f3f4f6;
}

/* 表头和单元格样式 */
.el-table :deep(th.el-table__cell) {
  background-color: #f9fafb;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
  vertical-align: middle;
  height: 48px;
}

.el-table :deep(td.el-table__cell) {
  text-align: center;
  vertical-align: middle;
}

/* 操作按钮基础样式 */
.operation-btn {
  width: 2rem;
  height: 2rem;
  transition: all 0.3s ease;
}

.operation-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 移动端优化样式 */
@media (max-width: 640px) {
  /* 操作按钮样式优化 */
  .operation-btn {
    width: 1.75rem !important;
    height: 1.75rem !important;
    padding: 0 !important;
  }

  .operation-btn :deep(.el-icon) {
    font-size: 0.75rem;
  }

  /* 调整操作列的内边距 */
  .el-table :deep(td.el-table__cell:last-child) {
    padding: 4px !important;
  }

  /* 确保按钮容器不会换行 */
  .flex.items-center.justify-center {
    flex-wrap: nowrap;
    padding: 2px 0;
  }
}
</style>
