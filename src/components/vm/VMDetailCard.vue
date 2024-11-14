<template>
  <div class="vm-detail-card">
    <el-descriptions :column="3" border>
      <!-- 基本信息 -->
      <el-descriptions-item label="虚拟机名称" :span="3">{{ vm.name }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag size="small" :type="getStatusType(vm.status)">{{ vm.status }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="资源组">{{ vm.resourceGroup }}</el-descriptions-item>
      <el-descriptions-item label="地区" :span="2">
        <div class="flex items-center gap-3">
          <div class="country-flag-wrapper">
            <img
              :src="getCountryFlag"
              :alt="countryInfo.localName"
              class="h-6 w-6 rounded-sm object-cover"
              @error="handleImageError"
            />
          </div>
          <span>{{ countryInfo.localName }}</span>
        </div>
      </el-descriptions-item>

      <!-- DNS别名处理 -->
      <el-descriptions-item label="DNS别名" :span="3">
        <el-tooltip v-if="vm.dnsAlias" :content="vm.dnsAlias" placement="top" :show-after="500">
          <span class="truncate inline-block max-w-[600px]">{{ vm.dnsAlias }}</span>
        </el-tooltip>
        <span v-else>-</span>
      </el-descriptions-item>

      <!-- 配置信息 -->
      <el-descriptions-item label="规格" :span="3">{{ vm.size }}</el-descriptions-item>
      <el-descriptions-item label="CPU">{{ vm.core }}核</el-descriptions-item>
      <el-descriptions-item label="内存">{{ vm.memory }}GB</el-descriptions-item>
      <el-descriptions-item label="磁盘大小">{{ vm.osDiskSize }}GB</el-descriptions-item>

      <el-descriptions-item label="系统类型">{{ vm.osType }}</el-descriptions-item>
      <el-descriptions-item label="操作系统" :span="2">{{ vm.osImage }}</el-descriptions-item>

      <!-- 网络信息 -->
      <el-descriptions-item label="公网IP" :span="2">
        <el-tooltip v-if="vm.publicIps" :content="vm.publicIps" placement="top" :show-after="500">
          <span class="text-blue-500 truncate inline-block max-w-[400px]">{{ vm.publicIps }}</span>
        </el-tooltip>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="电源状态">
        <div class="flex items-center gap-2">
          <span
            class="h-2 w-2 rounded-full"
            :class="{
              'bg-green-500': vm.powerState === 'running',
              'bg-gray-400': vm.powerState === 'Stopped',
              'bg-yellow-500': vm.powerState === 'Starting'
            }"
          />
          <span>{{ vm.powerState }}</span>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="私网IP" :span="3">
        <el-tooltip v-if="vm.privateIps" :content="vm.privateIps" placement="top" :show-after="500">
          <span class="truncate inline-block max-w-[600px]">{{ vm.privateIps }}</span>
        </el-tooltip>
        <span v-else>-</span>
      </el-descriptions-item>

      <!-- 时间信息 -->
      <el-descriptions-item label="创建时间" :span="3">
        {{ new Date(vm.createdTime).toLocaleString() }}
      </el-descriptions-item>
      <el-descriptions-item label="同步时间" :span="3">
        {{ new Date(vm.lastSyncAt).toLocaleString() }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import type * as VM from "@/api/vms/types/vms"
import { computed } from "vue"
import { getAzureRegionCountryInfo, AZURE_REGION_TO_COUNTRY } from "@/utils/nation"

const props = defineProps<{
  vm: VM.VM
}>()

// 获取国家信息
const countryInfo = computed(() => {
  return getAzureRegionCountryInfo(props.vm.location)
})

// 处理国旗图片路径
const getCountryFlag = computed(() => {
  try {
    const countryCode = AZURE_REGION_TO_COUNTRY[props.vm.location.toLowerCase()]
    if (!countryCode) return ""
    return new URL(`../../assets/nation/${countryCode}.svg`, import.meta.url).href
  } catch (error) {
    console.warn("Failed to load country flag:", error)
    return ""
  }
})

// 处理图片加载失败
const handleImageError = (e: Event) => {
  const imgElement = e.target as HTMLImageElement
  imgElement.style.display = "none"
}

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
</script>

<style scoped>
.vm-detail-card :deep(.el-descriptions__cell) {
  padding: 16px 24px;
}

.vm-detail-card :deep(.el-descriptions__label) {
  width: 120px;
  color: #4b5563;
  font-weight: 500;
  background-color: #f9fafb;
}

.vm-detail-card :deep(.el-descriptions__content) {
  color: #374151;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .vm-detail-card :deep(.el-descriptions__cell) {
    padding: 12px 16px;
  }

  .vm-detail-card :deep(.el-descriptions__label) {
    width: 100px;
  }

  /* 移动端文本截断宽度调整 */
  .truncate {
    max-width: 200px !important;
  }

  .country-flag-wrapper {
    width: 20px;
    height: 20px;
  }
}

/* 国旗图标样式 */
.country-flag-wrapper {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.country-flag-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
