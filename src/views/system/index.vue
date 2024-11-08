<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { useUserStore } from "@/store/modules/user"
import type { FormInstance, FormRules } from "element-plus"
import { ElMessage } from "element-plus"
import AvatarUpload from "./AvatarUpload.vue"
const activeTab = ref("personalSettings")
const formRef = ref<FormInstance>()
const userStore = useUserStore()
const isLoading = ref(false)

interface UserForm {
  loginEmail: string
  nickname: string
  avatar: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const userInfo = ref<UserForm>({
  loginEmail: "",
  nickname: "",
  avatar: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
})

// 添加一个函数来动态生成验证规则
const generateRules = (form: UserForm) => {
  const baseRules: FormRules = {
    loginEmail: [
      { required: true, message: "请输入邮箱地址", trigger: "blur" },
      { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] }
    ],
    displayName: [
      { required: true, message: "请输入显示名称", trigger: "blur" },
      { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
    ]
  }

  // 如果用户正在修改密码（输入了任意密码字段），添加密码相关验证
  if (form.oldPassword || form.newPassword || form.confirmPassword) {
    baseRules.oldPassword = [
      { required: true, message: "请输入当前密码", trigger: "blur" },
      { min: 6, message: "密码长度不能少于6位", trigger: "blur" }
    ]
    baseRules.newPassword = [
      { required: true, message: "请输入新密码", trigger: "blur" },
      { min: 6, message: "密码长度不能少于6位", trigger: "blur" },
      {
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          if (value === form.oldPassword) {
            callback(new Error("新密码不能与当前密码相同"))
          } else {
            callback()
          }
        },
        trigger: "blur"
      }
    ]
    baseRules.confirmPassword = [
      { required: true, message: "请确认新密码", trigger: "blur" },
      {
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          if (value !== form.newPassword) {
            callback(new Error("两次输入的密码不一致"))
          } else {
            callback()
          }
        },
        trigger: "blur"
      }
    ]
  }

  return baseRules
}

// 修改 rules 的定义
const rules = computed(() => generateRules(userInfo.value))

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    isLoading.value = true
    await userStore.getInfo()
    userInfo.value = {
      loginEmail: userStore.loginEmail,
      nickname: userStore.nickname,
      avatar: userStore.avatar,
      oldPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  } catch (error) {
    ElMessage.error("获取用户信息失败")
    console.error("Failed to fetch user info", error)
  } finally {
    isLoading.value = false
  }
}

// 修改更新用户信息的函数
const updateUserInfo = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        isLoading.value = true

        // 构建要更新的数据对象
        const updateData: Partial<UserForm> = {}

        // 只包含已修改的字段
        if (userInfo.value.loginEmail !== userStore.loginEmail) {
          updateData.loginEmail = userInfo.value.loginEmail
        }
        if (userInfo.value.nickname !== userStore.nickname) {
          updateData.nickname = userInfo.value.nickname
        }
        if (userInfo.value.avatar !== userStore.avatar) {
          updateData.avatar = userInfo.value.avatar
        }

        // 如果有密码相关字段，则添加密码更新
        if (userInfo.value.oldPassword && userInfo.value.newPassword) {
          updateData.oldPassword = userInfo.value.oldPassword
          updateData.newPassword = userInfo.value.newPassword
        }

        await userStore.updateUserInfo(updateData)

        ElMessage.success("更新成功")
        // 清空密码字段
        userInfo.value.oldPassword = ""
        userInfo.value.newPassword = ""
        userInfo.value.confirmPassword = ""
      } catch (error) {
        ElMessage.error("更新失败，请重试")
        console.error("Failed to update user info", error)
      } finally {
        isLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 transition-all duration-300">
    <div class="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Main Content -->
      <div class="bg-white rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
        <el-tabs v-model="activeTab" class="settings-tabs" :stretch="true">
          <!-- Personal Settings Tab -->
          <el-tab-pane label="个人设置" name="personalSettings">
            <div class="p-6">
              <el-skeleton :loading="isLoading" animated>
                <template #default>
                  <div v-if="userInfo" class="space-y-8">
                    <!-- Avatar Section -->
                    <div class="flex items-center space-x-6">
                      <AvatarUpload v-model="userInfo.avatar" />
                      <div>
                        <h3 class="text-lg font-medium text-gray-900">个人头像</h3>
                        <p class="text-sm text-gray-500">支持 JPG、PNG 格式，大小不超过 2MB</p>
                      </div>
                    </div>

                    <!-- Form Section -->
                    <el-form
                      ref="formRef"
                      :model="userInfo"
                      :rules="rules"
                      label-position="top"
                      class="space-y-6"
                      @submit.prevent
                    >
                      <el-form-item label="邮箱地址" prop="loginEmail" class="form-item">
                        <el-input v-model="userInfo.loginEmail" placeholder="请输入邮箱地址">
                          <template #prefix>
                            <el-icon><Message /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>

                      <el-form-item label="显示名称" prop="nickname" class="form-item">
                        <el-input v-model="userInfo.nickname" placeholder="请输入显示名称">
                          <template #prefix>
                            <el-icon><User /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>

                      <div class="border-t border-gray-200 my-6" />

                      <h3 class="text-lg font-medium text-gray-900 mb-3">修改密码</h3>

                      <el-form-item label="当前密码" prop="oldPassword" class="form-item">
                        <el-input
                          v-model="userInfo.oldPassword"
                          type="password"
                          placeholder="请输入当前密码"
                          show-password
                        >
                          <template #prefix>
                            <el-icon><Lock /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>

                      <el-form-item label="新密码" prop="newPassword" class="form-item">
                        <el-input
                          v-model="userInfo.newPassword"
                          type="password"
                          placeholder="请输入新密码"
                          show-password
                        >
                          <template #prefix>
                            <el-icon><Lock /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>

                      <el-form-item label="确认新密码" prop="confirmPassword" class="form-item">
                        <el-input
                          v-model="userInfo.confirmPassword"
                          type="password"
                          placeholder="请再次输入新密码"
                          show-password
                        >
                          <template #prefix>
                            <el-icon><Lock /></el-icon>
                          </template>
                        </el-input>
                      </el-form-item>

                      <div class="flex justify-end pt-4">
                        <el-button
                          type="primary"
                          :loading="isLoading"
                          @click="updateUserInfo(formRef)"
                          class="w-full sm:w-auto transform transition-all duration-300 hover:scale-105"
                        >
                          保存更改
                        </el-button>
                      </div>
                    </el-form>
                  </div>
                </template>
              </el-skeleton>
            </div>
          </el-tab-pane>

          <!-- System Settings Tab -->
          <el-tab-pane label="系统设置" name="systemSettings">
            <div class="p-6">
              <p class="text-gray-500">系统设置内容开发中...</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid #e5e7eb;
}

.settings-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 1.5rem;
}

.settings-tabs :deep(.el-tabs__item) {
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  color: #4b5563;
  transition: all 0.3s ease;
}

.settings-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 500;
  transform: translateY(-1px);
}

.settings-tabs :deep(.el-tabs__active-bar) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-item :deep(.el-form-item__label) {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.form-item:hover :deep(.el-form-item__label) {
  color: #409eff;
}

.form-item :deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.form-item :deep(.el-input__wrapper:hover) {
  border-color: #a3a3a3;
  transform: translateY(-1px);
}

.form-item :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  transform: translateY(-1px);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-form-item {
  animation: slideIn 0.3s ease-out forwards;
}

/* 为每个表单项设置递增的延迟 */
.el-form-item:nth-child(1) {
  animation-delay: 0.1s;
}
.el-form-item:nth-child(2) {
  animation-delay: 0.2s;
}
.el-form-item:nth-child(3) {
  animation-delay: 0.3s;
}
.el-form-item:nth-child(4) {
  animation-delay: 0.4s;
}
.el-form-item:nth-child(5) {
  animation-delay: 0.5s;
}
</style>
