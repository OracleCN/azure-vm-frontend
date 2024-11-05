<template>
  <div class="w-full max-w-[720px] min-w-[320px] mx-auto p-6 md:p-6 bg-white relative overflow-x-hidden">
    <!-- 快速配置卡片 -->
    <el-card class="mb-6 w-full">
      <template #header>
        <div class="flex justify-between items-center text-sm">
          <span>快速配置</span>
          <el-button type="primary" text @click="guideRef.open()">
            <el-icon><QuestionFilled /></el-icon>
            获取配置
          </el-button>
        </div>
      </template>

      <el-input
        type="textarea"
        v-model="configJson"
        :rows="3"
        placeholder="粘贴 Azure CloudShell 生成的配置 JSON"
        @input="handleJsonInput"
        class="w-full"
      />
      <div class="mt-2 text-xs text-gray-400">支持粘贴 JSON 格式的配置快速填写表单</div>
    </el-card>

    <!-- 步骤条 -->
    <el-steps :active="currentStep" finish-status="success" simple class="mb-8 w-full">
      <el-step title="认证信息" />
      <el-step title="应用信息" />
    </el-steps>

    <!-- 认证信息表单 -->
    <el-form
      v-show="currentStep === 0"
      ref="authFormRef"
      :model="authForm"
      :rules="authRules"
      label-position="top"
      class="relative pb-24 w-full"
      size="default"
    >
      <h3 class="text-lg text-gray-900 font-medium mb-6">Azure账户认证信息</h3>

      <el-form-item label="登录邮箱" prop="loginEmail" class="mb-6">
        <el-input
          v-model="authForm.loginEmail"
          placeholder="请输入Azure账户登录邮箱"
          :prefix-icon="Message"
          class="h-9"
        />
      </el-form-item>

      <el-form-item label="登录密码" prop="loginPassword" class="mb-6">
        <el-input
          v-model="authForm.loginPassword"
          type="password"
          placeholder="请输入登录密码（选填）"
          :prefix-icon="Lock"
          show-password
          class="h-9"
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark" class="mb-6">
        <el-input v-model="authForm.remark" type="textarea" placeholder="请输入备注信息（选填）" :rows="2" />
      </el-form-item>

      <div
        class="fixed left-0 right-0 bottom-0 md:absolute md:left-6 md:right-6 bg-white p-4 md:p-0 flex gap-4 border-t md:border-0"
      >
        <el-button type="primary" class="flex-1" @click="handleNextStep"> 下一步 </el-button>
      </div>
    </el-form>

    <!-- 应用信息表单 -->
    <el-form
      v-show="currentStep === 1"
      ref="appFormRef"
      :model="appForm"
      :rules="appRules"
      label-position="top"
      class="relative w-full"
      size="default"
    >
      <h3 class="text-lg text-gray-900 font-medium mb-2">Azure应用信息</h3>

      <el-form-item label="App ID" prop="appId" class="mb-4">
        <el-input v-model="appForm.appId" placeholder="请输入App ID" :prefix-icon="Key" class="h-9" />
      </el-form-item>

      <el-form-item label="App Password" prop="password" class="mb-4">
        <el-input
          v-model="appForm.password"
          type="password"
          placeholder="请输入App Password"
          :prefix-icon="Key"
          show-password
          class="h-9"
        />
      </el-form-item>

      <el-form-item label="Tenant" prop="tenant" class="mb-4">
        <el-input v-model="appForm.tenant" placeholder="请输入Tenant" :prefix-icon="Collection" class="h-9" />
      </el-form-item>

      <el-form-item label="displayName" prop="displayName" class="mb-4">
        <el-input v-model="appForm.displayName" placeholder="请输入displayName" :prefix-icon="Document" class="h-9" />
      </el-form-item>

      <div class="flex justify-end space-x-3 mt-6">
        <el-button @click="handlePrevStep">上一步</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit"> 创建账户 </el-button>
      </div>
    </el-form>
    <GuideDialog ref="guideRef" />
    <CreateDialog
      v-model="progressVisible"
      :form-data="{
        authForm: { ...authForm },
        appForm: { ...appForm }
      }"
      @completed="handleCreationCompleted"
      @close="handleProgressClose"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue"
import { ElMessage } from "element-plus"
import { useRouter } from "vue-router"
import type { FormInstance, FormRules } from "element-plus"
import { Message, Lock, Key, Collection, Document, QuestionFilled } from "@element-plus/icons-vue"
import GuideDialog from "./GuideDialog.vue"
import CreateDialog from "./CreateDialog.vue"
// 状态管理
const currentStep = ref(0)
const configJson = ref("")
// 表单引用
const authFormRef = ref<FormInstance>()
const appFormRef = ref<FormInstance>()
// 提交弹窗
const router = useRouter()
const progressVisible = ref(false)
const submitting = ref(false)
// json引导弹窗
const guideRef = ref()
// 认证信息表单
const authForm = reactive({
  loginEmail: "",
  loginPassword: "",
  remark: ""
})

// 应用信息表单
const appForm = reactive({
  appId: "",
  password: "",
  tenant: "",
  displayName: ""
})

// 认证信息验证规则
const authRules = reactive<FormRules>({
  loginEmail: [
    { required: true, message: "请输入登录邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ]
})

// 应用信息验证规则
const appRules = reactive<FormRules>({
  appId: [
    { required: true, message: "请输入App ID", trigger: "blur" },
    { min: 36, max: 36, message: "App ID长度应为36个字符", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入Password", trigger: "blur" },
    { min: 40, message: "Password长度不能少于40个字符", trigger: "blur" }
  ],
  tenant: [
    { required: true, message: "请输入Tenant", trigger: "blur" },
    { min: 36, max: 36, message: "Tenant 长度应为36个字符", trigger: "blur" }
  ],
  displayName: [
    { required: true, message: "请输入displayName", trigger: "blur" },
    { min: 16, max: 36, message: "displayName长度应为36个字符", trigger: "blur" }
  ]
})
const isMobile = ref(window.innerWidth <= 768)
// 检测移动端
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener("resize", checkMobile)
})

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile)
})

// 处理JSON输入
const handleJsonInput = (value: string) => {
  if (!value) return

  try {
    const config = JSON.parse(value)

    // 映射JSON数据到表单
    appForm.appId = config.appId || ""
    appForm.password = config.password || ""
    appForm.tenant = config.tenant || ""
    appForm.displayName = config.displayName || ""

    ElMessage.success("配置已自动填写")
    currentStep.value = 1 // 自动跳转到应用信息步骤
  } catch (error: unknown) {
    console.error("JSON解析失败:", error)
    ElMessage.error("JSON格式不正确，请检查输入")
  }
}
// 下一步
const handleNextStep = async () => {
  if (!authFormRef.value) return

  try {
    await authFormRef.value.validate()
    currentStep.value++
  } catch (error) {
    console.error("表单验证失败:", error)
  }
}

// 上一步
const handlePrevStep = () => {
  currentStep.value--
}

// 提交表单
const handleSubmit = async () => {
  if (!appFormRef.value) return

  try {
    await appFormRef.value.validate()
    submitting.value = true
    progressVisible.value = true
  } catch (error: any) {
    console.error("表单验证失败:", error)
    ElMessage.error(error.message || "表单验证失败")
  } finally {
    submitting.value = false
  }
}

// 处理创建完成
const handleCreationCompleted = (accountId: string) => {
  console.log("Creation completed for account:", accountId)
  // 可以在这里处理创建完成后的逻辑
}
const handleProgressClose = (completed: boolean) => {
  if (completed) {
    router.push("/account/index")
  }
  progressVisible.value = false
}
</script>
<style scoped lang="scss">
/* 全局样式覆盖 */
.el-card {
  @apply border border-gray-200;
}

.el-form-item__label {
  @apply text-sm text-gray-600 pb-2;
}

.el-input__wrapper {
  @apply shadow-none border border-gray-300 hover:border-gray-400;
}

.el-input__inner {
  @apply h-9 leading-9;
}

.el-textarea__inner {
  @apply p-2 min-h-[60px] font-sans border border-gray-300 hover:border-gray-400;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .el-form-item {
    @apply mb-4;
  }

  .el-form-item__label {
    @apply text-xs pb-1;
  }

  .el-input__inner {
    @apply h-8 leading-8 text-sm;
  }

  .el-textarea__inner {
    @apply min-h-[50px] text-sm;
  }

  /* 防止移动端横向滚动 */
  body {
    @apply overflow-x-hidden;
  }
}
</style>
