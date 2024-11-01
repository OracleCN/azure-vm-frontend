<script lang="ts" setup>
import { useLayoutMode } from "@/hooks/useLayoutMode"
import logo from "@/assets/layouts/logo.png?url"
import logoText1 from "@/assets/layouts/logo-text-1.png?url"
import logoText2 from "@/assets/layouts/logo-text-2.png?url"

interface Props {
  collapse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapse: true
})

const { isLeft, isTop } = useLayoutMode()
</script>

<template>
  <div
    class="relative w-full overflow-hidden"
    :class="[{ 'h-[var(--v3-navigationbar-height)]': isTop }, { 'h-[var(--v3-header-height)]': !isTop }]"
  >
    <transition name="layout-logo-fade">
      <router-link
        v-if="props.collapse"
        key="collapse"
        to="/"
        class="absolute inset-0 flex items-center justify-center"
      >
        <img :src="logo" class="w-8 h-8" />
      </router-link>
      <router-link v-else key="expand" to="/" class="absolute inset-0 flex items-center justify-center">
        <img :src="!isLeft ? logoText2 : logoText1" class="h-full object-contain" />
      </router-link>
    </transition>
  </div>
</template>

<style>
.layout-logo-fade-enter-active,
.layout-logo-fade-leave-active {
  transition: opacity 0.3s ease;
}

.layout-logo-fade-enter-from,
.layout-logo-fade-leave-to {
  opacity: 0;
}
</style>
