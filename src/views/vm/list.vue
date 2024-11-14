<template>
  <div class="min-h-[calc(100vh-84px)] bg-gray-50 p-6 sm:p-4">
    <!-- 搜索和操作栏 -->
    <div class="search-bar mb-6 rounded-lg bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div class="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <!-- 搜索区域 -->
        <div class="flex flex-1 flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <el-input
            v-model="searchQuery"
            placeholder="搜索虚拟机..."
            class="search-input w-full sm:w-80 transition-all duration-300 hover:shadow-sm"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon class="text-gray-400"><Search /></el-icon>
            </template>
          </el-input>

          <el-button
            type="primary"
            class="create-btn flex items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            @click="handleCreate"
          >
            <el-icon><Plus /></el-icon>
            创建虚拟机
          </el-button>
        </div>

        <!-- 刷新按钮 -->
        <el-button
          type="success"
          class="refresh-btn flex items-center justify-center gap-1 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          @click="fetchData"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <el-table
        v-loading="loading"
        :data="tableData"
        class="w-full"
        @row-click="handleRowClick"
        border
        v-bind="tableProps"
      >
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

        <template #empty>
          <div class="flex flex-col items-center justify-center py-8">
            <el-empty :image-size="200" description="暂无虚拟机数据">
              <template #description>
                <p class="text-gray-500">还没有创建任何虚拟机</p>
              </template>
              <el-button type="primary" @click="handleCreate">立即创建</el-button>
            </el-empty>
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper flex justify-end bg-white p-4">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          class="pagination transform transition-all duration-300 hover:-translate-y-0.5"
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
      :size="isMobile ? '90%' : '600px'"
      class="vm-drawer"
    >
      <template v-if="selectedVM">
        <el-descriptions :column="1" border>
          <template v-for="(value, key) in formattedVMDetails" :key="key">
            <el-descriptions-item :label="key" class="transition-colors duration-300 hover:bg-gray-50">
              {{ value }}
            </el-descriptions-item>
          </template>
        </el-descriptions>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onUnmounted } from "vue"
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

// 添加移动端检测
const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
  window.removeEventListener("resize", handleResize)
})

// 字段映射表
const fieldMappings: Record<string, string> = {
  name: "虚拟机名称",
  status: "状态",
  resourceGroup: "资源组",
  size: "规格",
  core: "CPU核数",
  memory: "内存大小",
  publicIps: "公网IP",
  privateIps: "私网IP",
  powerState: "电源状态",
  dnsAlias: "DNS别名",
  location: "地区",
  osType: "操作系统类型",
  osName: "操作系统",
  diskSize: "磁盘大小",
  createdTime: "创建时间",
  lastModifiedTime: "最后修改时间"
}

// 格式化VM详情数据
const formattedVMDetails = computed(() => {
  if (!selectedVM.value) return {}

  const details: Record<string, any> = {}

  // 遍历字段映射表,只显示需要的字段
  Object.entries(fieldMappings).forEach(([key, label]) => {
    if (selectedVM.value && key in selectedVM.value) {
      let value = selectedVM.value[key as keyof VM.VM]

      // 特殊字段处理
      if (key === "memory") value = `${value}GB`
      if (key === "core") value = `${value}核`
      if (key === "diskSize") value = `${value}GB`
      if (key === "createdTime" || key === "lastModifiedTime") {
        value = new Date(value).toLocaleString()
      }

      details[label] = value || "-"
    }
  })

  return details
})

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

      ElMessage.success(`${config.title}功`)
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

const tableProps = {
  elementLoadingText: "加载中...",
  elementLoadingBackground: "rgba(255, 255, 255, 0.9)",
  elementLoadingSvgViewBox: "-10, -10, 50, 50",
  elementLoadingSpinner: "el-icon-loading"
}
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

/* 抽屉样式优化 */
.vm-drawer :deep(.el-drawer__body) {
  padding: 20px;
  overflow-y: auto;
}

/* 描述列表样式优化 */
.vm-drawer :deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

.vm-drawer :deep(.el-descriptions__label) {
  width: 120px;
  color: #4b5563;
  font-weight: 500;
}

/* 移动端样式优化 */
@media (max-width: 768px) {
  .vm-drawer :deep(.el-drawer__header) {
    padding: 12px 16px;
    margin-bottom: 0;
  }

  .vm-drawer :deep(.el-drawer__body) {
    padding: 12px;
  }

  .vm-drawer :deep(.el-descriptions__cell) {
    padding: 8px 12px;
  }

  .vm-drawer :deep(.el-descriptions__label) {
    width: 100px;
  }
}

/* 表格响应式优化 */
@media (max-width: 768px) {
  /* 调整表格字体大小 */
  .el-table {
    font-size: 13px;
  }

  /* 优化表格头部 */
  .el-table :deep(th.el-table__cell) {
    padding: 8px 0;
    height: 40px;
  }

  /* 优化表格单元格 */
  .el-table :deep(td.el-table__cell) {
    padding: 6px 0;
  }

  /* 状态标签优化 */
  .el-table :deep(.el-tag) {
    font-size: 12px;
    padding: 0 4px;
    height: 22px;
    line-height: 20px;
  }

  /* 电源状态指示点优化 */
  .power-state-dot {
    width: 6px;
    height: 6px;
  }
}

/* 表格hover效果优化 */
.el-table :deep(.el-table__row) {
  transition: all 0.3s ease;
  cursor: pointer;
}

.el-table :deep(.el-table__row:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 表格加载状态优化 */
.el-table :deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
}

/* 搜索区域样式优化 */
.search-bar {
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.9);
}

.search-input :deep(.el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
}

/* 按钮动画效果 */
.create-btn,
.refresh-btn {
  position: relative;
  overflow: hidden;
}

.create-btn::after,
.refresh-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.create-btn:active::after,
.refresh-btn:active::after {
  width: 200px;
  height: 200px;
}

/* 移动端优化 */
@media (max-width: 640px) {
  .search-bar {
    padding: 12px;
  }

  .search-input :deep(.el-input__inner) {
    height: 36px;
  }

  .create-btn,
  .refresh-btn {
    height: 36px;
    padding: 0 12px;
  }
}

/* 分页样式优化 */
.pagination-wrapper {
  border-top: 1px solid #e5e7eb;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
}

.pagination :deep(.el-pagination__total),
.pagination :deep(.el-pagination__sizes) {
  margin-right: 16px;
}

.pagination :deep(.el-pagination button) {
  transition: all 0.3s ease;
}

.pagination :deep(.el-pagination button:hover:not([disabled])) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 移动端分页优化 */
@media (max-width: 640px) {
  .pagination-wrapper {
    padding: 12px;
  }

  .pagination :deep(.el-pagination__total),
  .pagination :deep(.el-pagination__sizes) {
    display: none !important;
  }

  .pagination :deep(.el-pagination button) {
    min-width: 28px;
    height: 28px;
  }
}

/* 添加页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

/* 表格行动画 */
.el-table :deep(.el-table__row) {
  animation: fadeIn 0.3s ease-out forwards;
}

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

/* 加载状态动画 */
.loading-overlay {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
}

/* 抽屉过渡动画优化 */
.vm-drawer :deep(.el-drawer__body) {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
