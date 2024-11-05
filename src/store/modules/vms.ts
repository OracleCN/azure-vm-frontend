import { defineStore } from "pinia"
import * as VMApi from "@/api/vms"
import type * as VM from "@/api/vms/types/vms"

interface VMState {
  vms: VM.VM[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
}

export const useVMStore = defineStore("vms", {
  state: (): VMState => ({
    vms: [],
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10
  }),

  getters: {
    paginatedVMs: (state): VM.VM[] => {
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      return state.vms.slice(start, end)
    },

    vmStats: (state) => {
      return {
        total: state.vms.length,
        running: state.vms.filter((vm) => vm.status === "running").length,
        stopped: state.vms.filter((vm) => vm.status === "stopped").length,
        error: state.vms.filter((vm) => vm.status === "error").length
      }
    }
  },

  actions: {
    // 设置分页参数
    setPageParams(currentPage: number, pageSize: number) {
      this.currentPage = currentPage
      this.pageSize = pageSize
    },

    // 获取虚拟机列表
    async fetchVMs(params?: VM.VMListParams) {
      this.loading = true
      this.error = null
      try {
        const response = await VMApi.getVMList(params || {})
        if (response.code === 0 && response.data) {
          this.vms = response.data.list
          this.total = response.data.total
        } else {
          throw new Error(response.message || "获取虚拟机列表失败")
        }
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // 同步指定账号的虚拟机
    async syncAccountVMs(accountId: string) {
      this.loading = true
      try {
        const response = await VMApi.syncVMs(accountId)
        if (response.code === 0) {
          return true
        } else {
          throw new Error(response.message || "同步虚拟机失败")
        }
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // 同步指定订阅的虚拟机
    async syncSubscriptionVMs(accountId: string, subscriptionId: string) {
      this.loading = true
      try {
        const response = await VMApi.syncVMsBySubscription(accountId, subscriptionId)
        if (response.code === 0) {
          await this.fetchVMs() // 重新加载列表
        } else {
          throw new Error(response.message || "同步虚拟机失败")
        }
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // 重置状态
    resetState() {
      this.$reset()
    }
  }
})

export type VMStore = ReturnType<typeof useVMStore>
