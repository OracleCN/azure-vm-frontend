import { defineStore } from "pinia"
import * as SubscriptionApi from "@/api/subscription"
import type * as Subscription from "@/api/subscription/types/subscription"

interface SubscriptionState {
  subscriptions: Subscription.Subscription[]
  loading: boolean
  error: string | null
}

export const useSubscriptionStore = defineStore("subscription", {
  state: (): SubscriptionState => ({
    subscriptions: [],
    loading: false,
    error: null
  }),

  getters: {
    subscriptionStats: (state) => {
      return {
        total: state.subscriptions.length,
        active: state.subscriptions.filter((sub) => sub.status === "active").length,
        suspended: state.subscriptions.filter((sub) => sub.status === "suspended").length,
        error: state.subscriptions.filter((sub) => sub.status === "error").length
      }
    }
  },

  actions: {
    // 获取订阅列表
    async fetchSubscriptions(accountId: string) {
      this.loading = true
      this.error = null
      try {
        const response = await SubscriptionApi.getSubscriptions(accountId)
        if (response.code === 0) {
          this.subscriptions = response.data
        } else {
          throw new Error(response.message || "获取订阅列表失败")
        }
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // 同步订阅
    async syncSubscriptions(accountId: string) {
      this.loading = true
      try {
        const response = await SubscriptionApi.syncSubscriptions(accountId)
        if (response.code === 0) {
          // 只检查 code
          await this.fetchSubscriptions(accountId) // 同步成功后刷新列表
          return response.data
        }
        throw new Error(response.message || "同步订阅失败")
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

export type SubscriptionStore = ReturnType<typeof useSubscriptionStore>
