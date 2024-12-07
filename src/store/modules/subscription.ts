import { defineStore } from "pinia"
import * as SubscriptionApi from "@/api/subscription"
import type * as Subscription from "@/api/subscription/types/subscription"

interface SubscriptionState {
  subscriptions: Subscription.Subscription[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
}

export const useSubscriptionStore = defineStore("subscription", {
  state: (): SubscriptionState => ({
    subscriptions: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 0
  }),

  getters: {
    subscriptionStats: (state) => {
      return {
        total: state.subscriptions.length,
        active: state.subscriptions.filter((sub) => sub.State === "Enabled").length,
        suspended: state.subscriptions.filter((sub) => sub.State === "Suspended").length,
        error: state.subscriptions.filter((sub) => sub.State === "Disabled").length
      }
    }
  },

  actions: {
    // 获取订阅列表
    async fetchSubscriptions(params: Subscription.SubscriptionQueryParams) {
      this.loading = true
      this.error = null
      try {
        const response = await SubscriptionApi.getSubscriptions(params)
        if (response.code === 0) {
          this.subscriptions = response.data.items
          this.total = response.data.total
          this.totalPages = response.data.totalPages
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
    async syncSubscriptions(accountId: string[]) {
      this.loading = true
      try {
        const response = await SubscriptionApi.syncSubscriptions(accountId)
        if (response.code === 0) {
          await this.fetchSubscriptions({
            page: 1,
            pageSize: 10
          })
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
