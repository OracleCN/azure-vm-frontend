<template>
  <div class="account-form-container">
    <!-- 快速配置卡片 -->
    <el-card class="quick-setup-card">
      <template #header>
        <div class="card-header">
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
      />
      <div class="json-tips">支持粘贴 JSON 格式的配置快速填写表单</div>
    </el-card>

    <!-- 步骤条 -->
    <el-steps :active="currentStep" finish-status="success" class="form-steps" simple>
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
      class="form-wrapper"
      size="default"
    >
      <h3 class="form-subtitle">Azure账户认证信息</h3>

      <el-form-item label="登录邮箱" prop="loginEmail">
        <el-input v-model="authForm.loginEmail" placeholder="请输入Azure账户登录邮箱" :prefix-icon="Message" />
      </el-form-item>

      <el-form-item label="登录密码" prop="loginPassword">
        <el-input
          v-model="authForm.loginPassword"
          type="password"
          placeholder="请输入登录密码（选填）"
          :prefix-icon="Lock"
          show-password
        />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="authForm.remark" type="textarea" placeholder="请输入备注信息（选填）" :rows="2" />
      </el-form-item>

      <div class="form-footer">
        <el-button type="primary" @click="handleNextStep">下一步</el-button>
      </div>
    </el-form>

    <!-- 应用信息表单 -->
    <el-form
      v-show="currentStep === 1"
      ref="appFormRef"
      :model="appForm"
      :rules="appRules"
      label-position="top"
      class="form-wrapper"
      size="default"
    >
      <h3 class="form-subtitle">Azure应用信息</h3>

      <el-form-item label="App ID" prop="appId">
        <el-input v-model="appForm.appId" placeholder="请输入App ID" :prefix-icon="Key" />
      </el-form-item>

      <el-form-item label="App Password" prop="appPassword">
        <el-input
          v-model="appForm.appPassword"
          type="password"
          placeholder="请输入App Password"
          :prefix-icon="Key"
          show-password
        />
      </el-form-item>

      <el-form-item label="Tenant ID" prop="tenantId">
        <el-input v-model="appForm.tenantId" placeholder="请输入Tenant ID" :prefix-icon="Collection" />
      </el-form-item>

      <el-form-item label="Subscription ID" prop="subscriptionId">
        <el-input v-model="appForm.subscriptionId" placeholder="请输入Subscription ID" :prefix-icon="Document" />
      </el-form-item>

      <div class="form-footer">
        <el-button @click="handlePrevStep">上一步</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit"> 创建账户 </el-button>
      </div>
    </el-form>
    <ConfigGuideDialog ref="guideRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue"
import { useAccountStore } from "@/store/modules/account"
import { ElMessage } from "element-plus"
import type { FormInstance, FormRules } from "element-plus"
import { Message, Lock, Key, Collection, Document, QuestionFilled } from "@element-plus/icons-vue"
import ConfigGuideDialog from "./ConfigGuideDialog.vue"
// 状态管理
const accountStore = useAccountStore()
const currentStep = ref(0)
const loading = ref(false)
const configJson = ref("")
// 表单引用
const authFormRef = ref<FormInstance>()
const appFormRef = ref<FormInstance>()

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
  appPassword: "",
  tenantId: "",
  subscriptionId: ""
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
  appPassword: [
    { required: true, message: "请输入App Password", trigger: "blur" },
    { min: 6, message: "App Password长度不能少于6个字符", trigger: "blur" }
  ],
  tenantId: [
    { required: true, message: "请输入Tenant ID", trigger: "blur" },
    { min: 36, max: 36, message: "Tenant ID长度应为36个字符", trigger: "blur" }
  ],
  subscriptionId: [
    { required: true, message: "请输入Subscription ID", trigger: "blur" },
    { min: 36, max: 36, message: "Subscription ID长度应为36个字符", trigger: "blur" }
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
    appForm.appPassword = config.password || ""
    appForm.tenantId = config.tenant || ""
    appForm.subscriptionId = config.subscriptionId || ""

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
    loading.value = true

    await accountStore.addAccount({
      ...authForm,
      ...appForm,
      status: "normal",
      type: "Azure",
      vmCount: 0
    })

    ElMessage.success("创建账户成功")
    resetForms()
  } catch (error) {
    console.error("表单验证失败:", error)
    ElMessage.error("创建账户失败")
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForms = () => {
  authFormRef.value?.resetFields()
  appFormRef.value?.resetFields()
  configJson.value = ""
  currentStep.value = 0
}
</script>

<style lang="scss" scoped>
.account-form-container {
  width: 100%;
  min-width: 500px;
  max-width: 720px;
  margin: 0 auto;
  padding: 24px;
  background-color: #fff;
  position: relative;
  .quick-setup-card {
    margin-bottom: 24px;
    width: 100%;

    :deep(.el-card__header) {
      padding: 15px 20px;
    }

    :deep(.el-card__body) {
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }

    .json-tips {
      margin-top: 8px;
      font-size: 12px;
      color: #909399;
    }
  }

  .form-steps {
    margin-bottom: 32px;
    width: 100%;

    :deep(.el-step__title) {
      font-size: 14px;
    }

    :deep(.el-step__head) {
      padding-right: 8px;
    }

    :deep(.el-step__line) {
      background-color: #dcdfe6;
    }
  }

  .form-subtitle {
    font-size: 18px;
    color: #303133;
    margin: 0 0 24px;
    font-weight: 500;
  }

  .form-wrapper {
    position: relative;
    padding-bottom: 90px;
    width: 100%;

    :deep(.el-form-item) {
      margin-bottom: 22px;

      .el-form-item__label {
        padding-bottom: 8px;
        font-size: 14px;
        line-height: 1.5;
        color: #606266;
      }

      .el-form-item__content {
        line-height: 36px;
      }

      .el-input__wrapper {
        padding: 1px 12px;
      }

      .el-input__inner {
        height: 36px;
        line-height: 36px;
      }

      .el-textarea__inner {
        padding: 8px 12px;
        min-height: 80px;
        font-family: inherit;
      }

      .el-input-group__append {
        padding: 0;

        .el-button {
          margin: 0;
          border: none;
          height: 100%;
          border-radius: 0;
        }
      }

      &.is-error {
        margin-bottom: 28px;

        .el-input__wrapper {
          box-shadow: 0 0 0 1px var(--el-color-danger) inset;
        }
      }
    }
  }

  .form-footer {
    position: absolute; // 改为绝对定位
    left: 24px; // 与容器padding对应
    right: 24px; // 与容器padding对应
    bottom: 0;
    width: auto; // 移除宽度设置
    max-width: none; // 移除最大宽度限制
    padding: 16px 0; // 调整内边距
    background: #fff;
    z-index: 10;
    display: flex;
    gap: 16px;

    .el-button {
      flex: 1;
      margin: 0;
      height: 40px;
      font-size: 14px;
      padding: 0 20px;

      &.is-loading {
        padding-left: 20px;
      }
    }
  }
}

.config-guide-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 70vh;
    overflow-y: auto;
  }

  .guide-steps {
    .guide-step {
      padding: 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &:last-child {
        border-bottom: none;
      }

      .step-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        .step-number {
          width: 24px;
          height: 24px;
          border-radius: 12px;
          background-color: var(--el-color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
        }

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }

      .step-content {
        padding-left: 36px;

        p {
          margin: 0 0 12px;
          color: var(--el-text-color-regular);
          font-size: 14px;
          line-height: 1.6;
        }

        .code-wrapper {
          .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            span {
              font-size: 14px;
              color: var(--el-text-color-regular);
            }
          }
        }

        .code-block {
          background: var(--el-fill-color-light);
          border-radius: 4px;
          padding: 16px;
          border: 1px solid var(--el-border-color-lighter);
          position: relative;

          code {
            display: block;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px;
            line-height: 1.6;
            color: var(--el-text-color-regular);
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: break-word;
          }
        }

        .tips-wrapper {
          .mapping-info {
            margin-top: 16px;

            p {
              margin-bottom: 8px;
              font-weight: 500;
            }

            ul {
              margin: 0;
              padding-left: 20px;

              li {
                margin-bottom: 6px;
                color: var(--el-text-color-regular);
                font-size: 14px;

                code {
                  background: var(--el-fill-color-light);
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                }

                &:last-child {
                  margin-bottom: 0;
                }
              }
            }
          }
        }
      }
    }
  }
}
@media screen and (max-width: 768px) {
  .account-form-container {
    min-width: unset;
    padding: 12px;
    width: 100%;
    max-height: 80vh;
    .quick-setup-card {
      margin-bottom: 12px;

      :deep(.el-card__header) {
        padding: 10px 12px;
      }

      :deep(.el-card__body) {
        padding: 10px 12px;
      }

      .card-header {
        font-size: 13px;
      }

      .json-tips {
        margin-top: 6px;
        font-size: 12px;
      }
    }

    .form-steps {
      margin-bottom: 16px;
      padding: 0 8px;

      :deep(.el-step__title) {
        font-size: 12px;
      }

      :deep(.el-step__head) {
        padding-right: 4px;
      }
    }

    .form-subtitle {
      font-size: 15px;
      margin-bottom: 16px;
    }

    .form-wrapper {
      padding-bottom: 72px;

      :deep(.el-form-item) {
        margin-bottom: 10px;

        .el-form-item__label {
          padding-bottom: 4px;
          font-size: 13px;
        }

        .el-form-item__content {
          line-height: 32px;
        }

        .el-input__wrapper {
          padding: 0 11px;
        }

        .el-input__inner {
          height: 32px;
          line-height: 32px;
          font-size: 13px;
        }

        .el-textarea__inner {
          padding: 6px 10px;
          min-height: 60px;
          font-size: 13px;
        }

        &.is-error {
          margin-bottom: 24px;
        }
      }
    }

    .form-footer {
      position: fixed;
      left: 0px; // 与移动端容器padding对应
      right: 0px; // 与移动端容器padding对应
      transform: none;
      width: 100%;
      max-width: none;
      padding: 10px 12px;
      gap: 8px;

      .el-button {
        height: 36px;
        padding: 0 15px;
        font-size: 13px;
      }
    }
  }

  .config-guide-dialog {
    .guide-steps {
      .guide-step {
        padding: 16px;

        .step-header {
          gap: 8px;
          margin-bottom: 12px;

          .step-number {
            width: 20px;
            height: 20px;
            font-size: 12px;
          }

          h3 {
            font-size: 15px;
          }
        }

        .step-content {
          padding-left: 28px;

          p {
            font-size: 13px;
            margin-bottom: 8px;
          }

          .code-block {
            padding: 12px;

            code {
              font-size: 12px;
            }
          }

          .tips-wrapper {
            .mapping-info {
              margin-top: 12px;

              ul li {
                font-size: 13px;
                margin-bottom: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
