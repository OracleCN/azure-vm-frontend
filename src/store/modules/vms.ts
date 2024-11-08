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
      // 添加防护检查，确保 vms 存在且是数组
      console.log(state.vms)
      if (!state.vms || !Array.isArray(state.vms)) {
        return []
      }

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
          // 转换数据
          this.vms = response.data.items.map((item) => ({
            ...item,
            // 格式化时间
            lastSyncAt: formatDateTime(item.lastSyncAt),
            createdTime: formatDateTime(item.createdTime)
          }))
          this.total = response.data.total || 0
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
          return response.data
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

    // updateDnsAlias 更新 DNS 别名
    async updateDnsAlias(accountId: string, vmId: string, dnsLabel: string) {
      const response = await VMApi.updateDnsAlias(accountId, vmId, dnsLabel)
      if (response.code === 0) {
        return response.data
      } else {
        throw new Error(response.message || "更新 DNS 别名失败")
      }
    },
    // 操作虚拟机
    async operateVM(accountId: string, id: string, operation: string) {
      const response = await VMApi.operateVM(accountId, id, operation)
      if (response.code === 0) {
        return response.data
      } else {
        throw new Error(response.message || "操作虚拟机失败")
      }
    },
    // 重置状态
    resetState() {
      this.$reset()
    }
  }
})

export type VMStore = ReturnType<typeof useVMStore>

// 时间格式化函数
function formatDateTime(dateStr: string): string {
  if (!dateStr) return "-"
  try {
    const date = new Date(dateStr)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
  } catch {
    return "-"
  }
}
