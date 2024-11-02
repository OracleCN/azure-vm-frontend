<!-- src/components/account/EditAccountDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="title"
    :width="dialogWidth"
    :close-on-click-modal="false"
    @close="handleClose"
    class="edit-account-dialog"
    destroy-on-close
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-position="top" class="px-2 md:px-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <!-- 登录邮箱 -->
        <el-form-item label="登录邮箱" prop="loginEmail" class="mb-2">
          <el-input v-model="formData.loginEmail" placeholder="请输入登录邮箱" class="w-full" :size="inputSize">
            <template #prefix>
              <el-icon class="text-gray-400"><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 登录密码 -->
        <el-form-item label="登录密码" prop="loginPassword" class="mb-2">
          <el-input
            v-model="formData.loginPassword"
            type="password"
            placeholder="如需修改请输入新密码"
            show-password
            class="w-full"
            :size="inputSize"
          >
            <template #prefix>
              <el-icon class="text-gray-400"><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 显示名称 -->
        <el-form-item label="显示名称" prop="displayName" class="mb-2">
          <el-input v-model="formData.displayName" placeholder="请输入显示名称" class="w-full" :size="inputSize">
            <template #prefix>
              <el-icon class="text-gray-400"><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- AppID -->
        <el-form-item label="AppID" prop="appId" class="mb-2">
          <el-input v-model="formData.appId" placeholder="请输入AppID" class="w-full" :size="inputSize">
            <template #prefix>
              <el-icon class="text-gray-400"><Key /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- AppPassword -->
        <el-form-item label="AppPassword" prop="password" class="mb-2">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="如需修改请输入新的AppPassword"
            show-password
            class="w-full"
            :size="inputSize"
          >
            <template #prefix>
              <el-icon class="text-gray-400"><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- Tenant -->
        <el-form-item label="Tenant" prop="tenant" class="mb-3">
          <el-input v-model="formData.tenant" placeholder="请输入Tenant" class="w-full" :size="inputSize">
            <template #prefix>
              <el-icon class="text-gray-400"><Help /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </div>

      <!-- 备注 -->
      <el-form-item label="备注" prop="remark" class="mb-3">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          class="w-full"
          :size="inputSize"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <el-button @click="handleClose" :size="buttonSize" class="!min-w-20"> 取消 </el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit" :size="buttonSize" class="!min-w-20">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { useWindowSize } from "@vueuse/core"
import type { FormInstance, FormRules } from "element-plus"
import { Message, Lock, User, Key, Help } from "@element-plus/icons-vue"
import { useAccountStore } from "@/store/modules/account"
import type { AzureAccount, UpdateAccountRequest } from "@/api/account/types/account"

const visible = defineModel<boolean>("visible")

const props = defineProps<{
  accountData?: AzureAccount
}>()

const emit = defineEmits<{
  (e: "success"): void
}>()

// 响应式窗口尺寸
const { width } = useWindowSize()

// 计算对话框宽度
const dialogWidth = computed(() => {
  if (width.value < 640) return "90%" // sm
  if (width.value < 1024) return "80%" // lg
  return "800px"
})

// 计算表单元素大小
const inputSize = computed(() => (width.value < 640 ? "default" : "large"))
const buttonSize = computed(() => (width.value < 640 ? "default" : "large"))

// 表单相关
const formRef = ref<FormInstance>()
const accountStore = useAccountStore()
const loading = ref(false)

// 表单数据
const formData = ref<UpdateAccountRequest>({
  id: "",
  loginEmail: "",
  loginPassword: "",
  appId: "",
  password: "",
  tenant: "",
  displayName: "",
  remark: ""
})

// 计算标题
const title = computed(() => "编辑账户")

// 表单校验规则
const rules: FormRules = {
  loginEmail: [
    { required: true, message: "请输入登录邮箱", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: "blur" }
  ],
  displayName: [{ required: true, message: "请输入显示名称", trigger: "blur" }],
  appId: [{ required: true, message: "请输入AppID", trigger: "blur" }],
  tenant: [{ required: true, message: "请输入Tenant", trigger: "blur" }]
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: "",
    loginEmail: "",
    loginPassword: "",
    appId: "",
    password: "",
    tenant: "",
    displayName: "",
    remark: ""
  }
  formRef.value?.resetFields()
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  setTimeout(() => {
    resetForm()
  }, 200)
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 过滤掉空密码字段和未修改的字段
    const updateData: UpdateAccountRequest = {
      id: formData.value.id
    }

    // 只包含已修改的字段
    if (formData.value.loginEmail !== props.accountData?.loginEmail) {
      updateData.loginEmail = formData.value.loginEmail
    }
    if (formData.value.loginPassword) {
      updateData.loginPassword = formData.value.loginPassword
    }
    if (formData.value.appId !== props.accountData?.appId) {
      updateData.appId = formData.value.appId
    }
    if (formData.value.password) {
      updateData.password = formData.value.password
    }
    if (formData.value.tenant !== props.accountData?.tenant) {
      updateData.tenant = formData.value.tenant
    }
    if (formData.value.displayName !== props.accountData?.displayName) {
      updateData.displayName = formData.value.displayName
    }
    if (formData.value.remark !== props.accountData?.remark) {
      updateData.remark = formData.value.remark
    }

    await accountStore.updateAccount(formData.value.id, updateData)
    emit("success")
    handleClose()
  } catch (error) {
    console.error("表单提交失败:", error)
  } finally {
    loading.value = false
  }
}

// 监听props变化，更新表单数据
watch(
  [() => props.accountData, () => visible.value],
  ([newAccount, isVisible]) => {
    if (newAccount && isVisible) {
      formData.value = {
        id: newAccount.ID.toString(),
        loginEmail: newAccount.loginEmail,
        displayName: newAccount.displayName,
        appId: newAccount.appId,
        tenant: newAccount.tenant,
        remark: newAccount.remark
      }
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.edit-account-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;

    .el-dialog__header {
      margin: 0;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
    }

    .el-dialog__body {
      padding: 24px 16px;

      @media (min-width: 768px) {
        padding: 24px;
      }
    }

    .el-dialog__footer {
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;

      @media (min-width: 768px) {
        padding: 20px 24px;
      }
    }

    .el-form-item__label {
      font-weight: 500;
      color: #374151;
      padding-bottom: 4px;
    }
  }
}
</style>
