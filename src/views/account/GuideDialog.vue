<template>
  <el-dialog v-model="visible" :width="isMobile ? '90%' : '700px'" destroy-on-close :class="{ '!p-0': true }">
    <!-- Custom Header -->
    <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <h2 class="text-lg md:text-xl font-semibold text-center text-gray-900">如何获取 Azure 配置</h2>
    </div>

    <!-- Content with custom scrollbar -->
    <div class="max-h-[70vh] overflow-y-auto scrollbar-hide">
      <div class="divide-y divide-gray-200">
        <!-- 步骤 1 -->
        <div class="p-4 md:p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full shrink-0"
            >
              1
            </div>
            <h3 class="text-sm md:text-base font-medium text-gray-900">打开 Azure Portal 的 Cloud Shell</h3>
          </div>
          <div class="pl-9">
            <div class="rounded-lg border border-gray-200">
              <div class="flex justify-between items-center p-3 md:px-4 md:py-3 border-b border-gray-200">
                <span class="text-xs md:text-sm text-gray-600">在 Cloud Shell 中运行以下命令：</span>
                <el-tooltip content="复制命令" placement="top" :show-after="500">
                  <el-button type="primary" link @click="copyCommand" class="!ml-2">
                    <el-icon class="mr-1"><CopyDocument /></el-icon>
                    <span class="text-xs md:text-sm">复制命令</span>
                  </el-button>
                </el-tooltip>
              </div>
              <pre
                class="p-3 md:p-4 text-xs md:text-sm font-mono text-blue-700 bg-gray-50 overflow-x-auto scrollbar-hide whitespace-pre"
              ><span>az ad sp create-for-rbac --role contributor --years 99 \
  --scopes /subscriptions/$(az account list --query [].id -o tsv)</span></pre>
            </div>
          </div>
        </div>

        <!-- 步骤 2 -->
        <div class="p-4 md:p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full shrink-0"
            >
              2
            </div>
            <h3 class="text-sm md:text-base font-medium text-gray-900">复制生成的 JSON 配置</h3>
          </div>
          <div class="pl-9">
            <p class="mb-3 text-xs md:text-sm text-gray-600">命令执行后会生成如下格式的 JSON 配置：</p>
            <pre
              class="p-3 md:p-4 text-xs md:text-sm font-mono text-blue-700 bg-gray-50 border border-gray-200 rounded-lg overflow-x-auto scrollbar-hide whitespace-pre"
            >
{
  "appId": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
  "password": "xxxxxxxxxxxxxxxxxx",
  "tenant": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx",
  "displayName": "xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx"
}</pre
            >
          </div>
        </div>

        <!-- 步骤 3 -->
        <div class="p-4 md:p-6">
          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex items-center justify-center w-6 h-6 text-sm font-medium text-white bg-blue-500 rounded-full shrink-0"
            >
              3
            </div>
            <h3 class="text-sm md:text-base font-medium text-gray-900">填写配置信息</h3>
          </div>
          <div class="pl-9">
            <el-alert
              title="将生成的 JSON 配置复制到快速配置框中，系统将自动填写表单"
              type="info"
              :closable="false"
              show-icon
              class="mb-4"
            />
            <div class="text-xs md:text-sm text-gray-600">
              <p class="font-medium mb-2">配置项对应关系：</p>
              <ul class="list-disc pl-5 space-y-1.5">
                <li><code class="px-1.5 py-0.5 bg-gray-100 rounded font-mono">appId</code> → App ID</li>
                <li><code class="px-1.5 py-0.5 bg-gray-100 rounded font-mono">password</code> → App Password</li>
                <li><code class="px-1.5 py-0.5 bg-gray-100 rounded font-mono">tenant</code> → Tenant ID</li>
                <li><code class="px-1.5 py-0.5 bg-gray-100 rounded font-mono">displayName</code> → displayName</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { CopyDocument } from "@element-plus/icons-vue"
import { ElMessage } from "element-plus"

const visible = ref(false)
const isMobile = ref(window.innerWidth <= 768)

window.addEventListener("resize", () => {
  isMobile.value = window.innerWidth <= 768
})

const copyCommand = async () => {
  const command =
    "az ad sp create-for-rbac --role contributor --years 99 --scopes /subscriptions/$(az account list --query [].id -o tsv)"
  try {
    await navigator.clipboard.writeText(command)
    ElMessage.success("命令已复制到剪贴板")
  } catch (error) {
    console.error("复制失败:", error)
    ElMessage.error("复制失败，请手动复制")
  }
}

defineExpose({
  open: () => (visible.value = true),
  close: () => (visible.value = false)
})
</script>

<style>
.el-dialog__header {
  display: none !important;
}

.el-dialog__body {
  padding: 0 !important;
  margin: 0 !important;
}

/* 自定义滚动条样式 */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 确保 dialog 不会出现滚动条 */
.el-dialog {
  overflow: hidden !important;
}

/* 确保 element-plus 的内容区域不会出现滚动条 */
.el-dialog__body {
  overflow: hidden !important;
}
</style>
