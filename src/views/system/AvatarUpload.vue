<script lang="ts" setup>
import { ElMessage } from "element-plus"

interface Props {
  modelValue: string // 头像的 URL 或 base64
  size?: number // 头像尺寸
  maxSize?: number // 最大文件大小(MB)
}

const props = withDefaults(defineProps<Props>(), {
  size: 80, // 默认80px
  maxSize: 2 // 默认2MB
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  "upload-success": [file: File]
  "upload-error": [error: string]
}>()

// 处理头像上传
const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length) return

  const file = target.files[0]

  // 验证文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    emit("upload-error", `图片大小不能超过 ${props.maxSize}MB`)
    ElMessage.error(`图片大小不能超过 ${props.maxSize}MB`)
    return
  }

  // 验证文件类型
  if (!["image/jpeg", "image/png"].includes(file.type)) {
    emit("upload-error", "只支持 JPG/PNG 格式的图片")
    ElMessage.error("只支持 JPG/PNG 格式的图片")
    return
  }

  // 转换为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    if (e.target?.result) {
      emit("update:modelValue", e.target.result as string)
      emit("upload-success", file)
      ElMessage.success("头像更新成功")
    }
  }
  reader.readAsDataURL(file)

  // 清空input的value，确保能重复上传同一张图片
  target.value = ""
}
</script>

<template>
  <div class="avatar-upload relative group">
    <div
      class="relative overflow-hidden bg-gray-100 cursor-pointer rounded-full transition-all duration-300 hover:shadow-lg"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <!-- 头像图片 -->
      <img
        :src="modelValue"
        class="w-full h-full object-cover transition-all duration-300 group-hover:opacity-70"
        alt="User avatar"
      />

      <!-- 悬浮提示层 -->
      <div
        class="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center"
      >
        <!-- 相机图标 -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 text-white mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-white text-xs font-medium">更换头像</span>
      </div>

      <!-- 文件输入框 -->
      <input
        type="file"
        accept="image/jpeg,image/png"
        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        @change="handleAvatarUpload"
      />
    </div>
  </div>
</template>

<style scoped>
.avatar-upload:deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload:hover {
  transform: translateY(-1px);
}
</style>
