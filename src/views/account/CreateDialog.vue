<template>
  <el-dialog
    v-model="visible"
    title="账户创建进度"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :width="dialogWidth"
    class="creation-progress-dialog"
  >
    <div class="space-y-6 mt-6">
      <!-- 进度步骤 -->
      <el-steps
        :active="activeStep"
        finish-status="success"
        process-status="process"
        :direction="stepsDirection"
        align-center
        class="px-2"
      >
        <el-step v-for="(step, index) in steps" :key="index" :title="step.title" :status="getStepStatus(index)">
          <template #description>
            <div class="flex items-center space-x-1 mt-2">
              <!-- 步骤图标和信息 -->
              <div v-if="getStepStatus(index) === 'success'" class="flex items-center text-green-500">
                <el-icon><CircleCheck /></el-icon>
                <span class="ml-1.5">完成</span>
              </div>
              <div v-else-if="getStepStatus(index) === 'process'" class="flex items-center text-blue-500">
                <el-icon class="animate-spin"><Loading /></el-icon>
                <span class="ml-1.5">处理中</span>
              </div>
              <div v-else-if="stepErrors[index]" class="flex items-center text-red-500">
                <el-icon><CircleClose /></el-icon>
                <span class="ml-1.5">{{ stepErrors[index] }}</span>
              </div>
            </div>
          </template>
        </el-step>
      </el-steps>

      <!-- 当前步骤详情 -->
      <div
        v-if="activeStep > 0 && !hasError && currentStepStats"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mx-2"
      >
        <p class="text-gray-600 dark:text-gray-300">
          {{ currentStepStats }}
        </p>
      </div>

      <!-- 错误提示 -->
      <div v-if="hasError" class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-4 mx-2">
        <p>{{ stepErrors[activeStep] }}</p>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button v-if="hasError || completed" @click="handleClose" :disabled="processing"> 关闭 </el-button>
        <el-button v-if="hasError" type="primary" @click="handleRetry" :loading="processing"> 重试 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useAccountStore } from "@/store/modules/account"
import { ref, reactive, computed, watch } from "vue"
import { ElMessage } from "element-plus"
import { CircleCheck, CircleClose, Loading } from "@element-plus/icons-vue"
import { useSubscriptionStore } from "@/store/modules/subscription"
import { useVMStore } from "@/store/modules/vms"
import { useWindowSize } from "@vueuse/core"
interface AuthForm {
  loginEmail: string
  loginPassword: string
  remark: string
}

interface AppForm {
  appId: string
  password: string
  tenant: string
  displayName: string
}

interface FormData {
  authForm: AuthForm
  appForm: AppForm
}

// Props 类型定义
interface Props {
  modelValue: boolean
  formData: FormData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:modelValue": [value: boolean]
  completed: [accountId: string]
  close: [completed: boolean]
}>()

// Store
const accountStore = useAccountStore()
const subscriptionStore = useSubscriptionStore()
const vmStore = useVMStore()
// 状态
const visible = ref(false)
const activeStep = ref(0)
const completed = ref(false)
const hasError = ref(false)
const processing = ref(false)
const stepErrors = reactive(["", "", ""])
const currentAccountId = ref("")
const totalSubscriptions = ref({
  count: 0
})
// 虚拟机统计
const vmStats = ref({
  total: 0,
  running: 0,
  stopped: 0
})
// 步骤定义
const steps = [
  {
    title: "创建账户",
    action: async () => {
      const response = await accountStore.addAccount({
        ...props.formData.authForm,
        ...props.formData.appForm,
        vmCount: 0
      })
      if (response && response.accountId) {
        currentAccountId.value = response.accountId
        return true
      }
      throw new Error("创建账户失败")
    }
  },
  {
    title: "同步订阅",
    action: async () => {
      if (!currentAccountId.value) {
        throw new Error("未获取到账户ID")
      }
      const stats = await subscriptionStore.syncSubscriptions(currentAccountId.value)
      totalSubscriptions.value = {
        count: stats.total
      }
      return true
    },
    getStats: () => {
      return `已同步 ${totalSubscriptions.value.count} 个订阅 `
    }
  },
  {
    title: "同步虚拟机",
    action: async () => {
      if (!currentAccountId.value) {
        throw new Error("未获取到账户ID")
      }
      const stats = await vmStore.syncAccountVMs(currentAccountId.value)
      vmStats.value = {
        total: stats.totalVMs,
        running: stats.runningVMs,
        stopped: stats.stoppedVMs
      }
      return true
    },
    getStats: () => {
      return `已同步 ${vmStats.value.total} 台虚拟机（运行中: ${vmStats.value.running}, 已停止: ${vmStats.value.stopped}）`
    }
  }
]

// 当前步骤状态信息
const currentStepStats = computed(() => {
  if (activeStep.value === 0 || activeStep.value >= steps.length) return null
  return steps[activeStep.value].getStats?.()
})

// 获取步骤状态
const getStepStatus = (step: number) => {
  if (stepErrors[step]) return "error"
  if (step < activeStep.value) return "success"
  if (step === activeStep.value) return processing.value ? "process" : "wait"
  return "wait"
}

// 开始执行进度流程
const startProgress = async () => {
  activeStep.value = 0 // 从第一步开始
  processing.value = true
  hasError.value = false
  stepErrors.fill("")

  for (let i = activeStep.value; i < steps.length; i++) {
    try {
      const step = steps[i]
      if (step.action) {
        await step.action()
      }
      activeStep.value++
    } catch (err: any) {
      hasError.value = true
      stepErrors[i] = err.message || `${steps[i].title}失败`
      processing.value = false
      return false
    }
  }

  completed.value = true
  processing.value = false
  emit("completed", currentAccountId.value) // 完成时发送 accountId
  ElMessage.success("账户创建及数据同步完成")
  // 延迟1秒关闭，让用户能看到完成状态
  setTimeout(() => {
    handleClose()
  }, 1000) // 延迟1秒关闭，让用户能看到完成状态
  return true
}

// 处理重试
const handleRetry = async () => {
  hasError.value = false
  stepErrors[activeStep.value] = ""
  await startProgress()
}

// 处理关闭
const handleClose = () => {
  emit("update:modelValue", false)
  emit("close", completed.value)
}
// 监听显示状态
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 显示时开始执行
      activeStep.value = 0
      completed.value = false
      hasError.value = false
      processing.value = false
      stepErrors.fill("")
      startProgress()
    }
  }
)

// 响应式窗口尺寸
const { width: windowWidth } = useWindowSize()

// 计算对话框宽度
const dialogWidth = computed(() => {
  return windowWidth.value < 640 ? "90%" : "460px"
})

// 计算步骤条方向
const stepsDirection = computed(() => {
  return windowWidth.value < 640 ? "vertical" : "horizontal"
})
// 同步内部状态到外部
watch(
  () => visible.value,
  (newVal) => {
    emit("update:modelValue", newVal)
  }
)
</script>
<style scoped lang="scss">
.creation-progress-dialog {
  :deep(.el-dialog) {
    @apply rounded-lg;
    margin: 15vh auto !important;

    @media (max-width: 640px) {
      margin: 10vh auto !important;
      width: 92% !important;
    }
  }

  :deep(.el-dialog__header) {
    @apply px-6 py-4 mb-2 border-b border-gray-100;

    .el-dialog__title {
      @apply text-lg font-medium;
    }
  }

  :deep(.el-dialog__body) {
    @apply px-4 py-6;

    @media (min-width: 640px) {
      @apply px-6;
    }
  }

  :deep(.el-dialog__footer) {
    @apply px-6 py-4 border-t border-gray-100;
  }

  /* 步骤条样式优化 */
  :deep(.el-step) {
    @apply overflow-visible;

    .el-step__title {
      @apply text-base font-medium;

      @media (max-width: 640px) {
        @apply text-sm;
      }
    }

    .el-step__description {
      @apply text-sm min-h-[24px];

      @media (max-width: 640px) {
        @apply text-xs min-h-[20px];
      }
    }
  }

  /* 垂直步骤条特殊处理 */
  :deep(.el-steps--vertical) {
    .el-step {
      @apply mb-6;
    }

    .el-step__description {
      @apply ml-0;
    }
  }
}

/* 动画优化 */
.el-dialog__body {
  @apply transition-all duration-300;
}
</style>
