<script lang="ts" setup>
import { ref, onMounted } from "vue"
import type { Component } from "vue"
import { Search, Refresh, Plus, Delete, VideoPlay, VideoPause, RefreshRight, Edit } from "@element-plus/icons-vue"
import { useVMStore } from "@/store/modules/vms"
import type * as VM from "@/api/vms/types/vms"
// 导入 store
import { ElMessageBox, ElMessage, ElLoading } from "element-plus"
import { useRouter } from "vue-router"

const tableData = ref<VM.VM[]>([])
const loading = ref(true)
const total = ref(0)
const pageSize = ref(10)
const currentPage = ref(1)
const searchQuery = ref("")

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
        inputValue: row.dnsAlias?.split(".")[0] || "", // 只显示当前前缀
        inputValidator: (value) => {
          if (!value) return "别名不能为空"
          // DNS前缀规则：只允许小写字母、数字和连字符，以字母开头，以字母或数字结尾
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

// 分页查询
const handleCurrentChange = (val: number) => {
  currentPage.value = val
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
  console.log(tableData.value)
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

const getPowerStateType = createStatusMapper({
  running: "success",
  Stopped: "info",
  Starting: "warning"
})

const getSyncStatusType = createStatusMapper({
  synced: "success",
  Syncing: "warning",
  Failed: "danger"
})
</script>

<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <div
      class="mb-4 flex items-center justify-between bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <div class="flex items-center gap-4">
        <el-input
          v-model="searchQuery"
          placeholder="搜索虚拟机..."
          class="w-96"
          :prefix-icon="Search"
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button type="primary" @click="handleSearch" class="search-button">
              <el-icon class="mr-1"><Search /></el-icon>搜索
            </el-button>
          </template>
        </el-input>

        <!-- 新增创建按钮 -->
        <el-button type="primary" @click="handleCreate" class="create-button">
          <el-icon class="mr-1"><Plus /></el-icon>创建虚拟机
        </el-button>
      </div>

      <el-button type="success" @click="fetchData" class="refresh-button">
        <el-icon class="mr-1"><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- 修改表格容器 -->
    <div class="bg-white p-4 rounded-lg shadow-sm table-container">
      <el-table v-loading="loading" :data="tableData" border stripe class="custom-table">
        <!-- 调整关键列的宽度 -->
        <el-table-column prop="name" label="名称" width="100" show-overflow-tooltip />
        <el-table-column prop="resourceGroup" label="资源组" width="100" show-overflow-tooltip />
        <el-table-column prop="location" label="位置" width="180" />
        <el-table-column prop="size" label="规格" width="180" />
        <el-table-column prop="osImage" label="操作系统" width="180" show-overflow-tooltip />
        <el-table-column prop="core" label="CPU" width="80">
          <template #default="{ row }"> {{ row.core }} 核 </template>
        </el-table-column>
        <el-table-column prop="memory" label="内存" width="80">
          <template #default="{ row }"> {{ row.memory }} GB </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="powerState" label="电源状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getPowerStateType(row.powerState)">{{ row.powerState }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="privateIps" label="私有IP" min-width="120" show-overflow-tooltip />
        <el-table-column prop="publicIps" label="公网IP" min-width="120" show-overflow-tooltip />
        <el-table-column prop="dnsAlias" label="ddns域名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="osDiskSize" label="系统盘大小" min-width="100">
          <template #default="{ row }"> {{ row.osDiskSize }} GB </template>
        </el-table-column>
        <el-table-column prop="syncStatus" label="同步状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getSyncStatusType(row.syncStatus)">{{ row.syncStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastSyncAt" label="最后同步时间" min-width="120" show-overflow-tooltip />
        <el-table-column prop="createdTime" label="创建时间" min-width="120" show-overflow-tooltip />

        <!-- 新增操作列 -->
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <div class="flex gap-1 justify-center">
              <template v-for="btn in buttonConfigs" :key="btn.operation">
                <el-button
                  v-if="btn.showCondition(row.powerState)"
                  :type="btn.type"
                  size="small"
                  @click="handleOperation(btn.operation, row)"
                  :icon="btn.icon"
                  circle
                  :title="btn.title"
                  class="operation-btn"
                />
              </template>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          class="custom-pagination"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  padding: 24px;
  background-color: #f9fafb;
  min-height: calc(100vh - 84px);
}

.custom-table {
  --el-table-header-bg-color: #f5f7fa;
  --el-table-border-color: #ebeef5;
  --el-table-header-text-color: #606266;
}

.form-label {
  min-width: 120px;
  text-align: right;
  padding-right: 12px;
}
:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  width: 100%;
}

:deep(.el-table:hover) {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

:deep(.el-table--border)::before,
:deep(.el-table--border)::after {
  display: none;
}

:deep(.el-pagination) {
  --el-pagination-button-height: 36px;
  --el-pagination-button-width: 36px;

  .el-pagination__sizes {
    margin-right: 16px;
  }

  .btn-prev,
  .btn-next,
  .el-pager li {
    border-radius: 6px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }
}
:deep(.el-table) {
  /* 根据实际内容调整列宽 */
  .el-table__cell[data-col-id="name"] {
    min-width: 180px;
  }
  .el-table__cell[data-col-id="status"] {
    min-width: 100px;
  }
  .el-table__cell[data-col-id="ip"] {
    min-width: 140px;
  }
  /* 其他列可以根据需要继续添加 */
}
:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e7eb inset;
  transition: all 0.3s ease;
  border-radius: 6px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--el-color-primary-light-3) inset;
}

:deep(.el-button) {
  transition: all 0.3s ease;
  font-weight: 500;
}

:deep(.el-button:not(.is-text)) {
  border-radius: 6px;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

:deep(.el-tag) {
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-table__header) {
  th.el-table__cell {
    background-color: #f8fafc !important;
    font-weight: 600;
    height: 54px;
    border-bottom: 2px solid #e5e7eb;
    color: #374151;
  }
}

:deep(.el-table__row) {
  height: 50px;
  td.el-table__cell {
    padding: 8px;
    color: #4b5563;
    white-space: nowrap;
  }
}

.app-container {
  padding: 24px;
  background-color: #f9fafb;
  min-height: calc(100vh - 84px);
}

/* 新增画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeIn 0.3s ease-out;
}

/* 新增按钮样式 */
:deep(.el-button.create-button) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  padding: 10px 10px;
  height: 35px;
}

:deep(.el-button[circle]) {
  transition: all 0.3s ease;
}

:deep(.el-button[circle]:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

/* 操作按钮工具提示 */
[title] {
  position: relative;
}

[title]:hover::after {
  content: attr(title);
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 1000;
}

.operation-btn {
  margin: 0 2px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &::before {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    padding: 4px 8px;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
  }

  &:hover::before {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-8px);
  }
}

/* 为不同类型的按钮添加悬浮效果 */
:deep(.el-button.operation-btn) {
  &.el-button--primary:hover {
    background-color: var(--el-color-primary-light-3);
  }

  &.el-button--success:hover {
    background-color: var(--el-color-success-light-3);
  }

  &.el-button--warning:hover {
    background-color: var(--el-color-warning-light-3);
  }

  &.el-button--danger:hover {
    background-color: var(--el-color-danger-light-3);
  }
}

.table-container {
  width: 100%;
  margin: 0 auto; /* 居中显示 */
  overflow-x: auto; /* 添加横向滚动 */
}

:deep(.el-table) {
  /* 设置表格最小宽度，确保内容不会挤压 */
  min-width: 1200px;
}

/* 优化滚动条样式 */
.table-container::-webkit-scrollbar {
  height: 8px;
}

.table-container::-webkit-scrollbar-thumb {
  background-color: #ddd;
  border-radius: 4px;
}

.table-container::-webkit-scrollbar-track {
  background-color: #f5f5f5;
}
</style>
