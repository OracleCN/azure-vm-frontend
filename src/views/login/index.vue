<script lang="ts" setup>
import { reactive, ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "@/store/modules/user"
import { type FormInstance, type FormRules } from "element-plus"
import { User, Lock } from "@element-plus/icons-vue"
import { type LoginRequestData } from "@/api/login/types/login"
import Owl from "./components/Owl.vue"
import { useFocus } from "./hooks/useFocus"

const router = useRouter()
const { isFocus, handleBlur, handleFocus } = useFocus()

/** 登录表单元素的引用 */
const loginFormRef = ref<FormInstance | null>(null)

/** 登录按钮 Loading */
const loading = ref(false)
/** 登录表单数据 */
const loginFormData: LoginRequestData = reactive({
  email: "dnslin@qq.com",
  password: "dnslin@qq.com"
})
/** 登录表单校验规则 */
const loginFormRules: FormRules = {
  email: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 8, max: 16, message: "长度在 8 到 16 个字符", trigger: "blur" }
  ]
}
/** 登录逻辑 */
const handleLogin = () => {
  loginFormRef.value?.validate((valid: boolean, fields) => {
    if (valid) {
      loading.value = true
      useUserStore()
        .login(loginFormData)
        .then(() => {
          router.push({ path: "/" })
        })
        .catch(() => {
          loginFormData.password = ""
        })
        .finally(() => {
          loading.value = false
        })
    } else {
      console.error("表单校验不通过", fields)
    }
  })
}
</script>

<template>
  <div class="flex flex-col justify-center items-center w-full min-h-full">
    <!-- <ThemeSwitch class="fixed top-[5%] right-[5%] cursor-pointer" /> -->
    <Owl :close-eyes="isFocus" />
    <div class="w-[480px] max-w-[90%] rounded-[20px] shadow-md bg-white dark:bg-gray-800 overflow-hidden">
      <div class="mt-[5px] flex justify-center items-center h-[150px]">
        <img src="@/assets/layouts/logo-text-2.png" class="h-full" />
      </div>
      <div class="px-[50px] pb-[50px]">
        <el-form ref="loginFormRef" :model="loginFormData" :rules="loginFormRules" @keyup.enter="handleLogin">
          <el-form-item prop="email">
            <el-input
              v-model.trim="loginFormData.email"
              placeholder="用户名"
              type="text"
              tabindex="1"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model.trim="loginFormData.password"
              placeholder="密码"
              type="password"
              tabindex="2"
              :prefix-icon="Lock"
              size="large"
              show-password
              @blur="handleBlur"
              @focus="handleFocus"
            />
          </el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            size="large"
            @click.prevent="handleLogin"
            class="w-full mt-[10px]"
            >登 录</el-button
          >
        </el-form>
      </div>
    </div>
  </div>
</template>

<style>
/* 用于覆盖 el-input-group__append 的样式 */
.login-container :deep(.el-input-group__append) {
  @apply p-0 overflow-hidden;
}

.login-container :deep(.el-input-group__append) .el-image {
  @apply w-[100px] h-[40px] border-l-0 select-none cursor-pointer text-center;
}
</style>
