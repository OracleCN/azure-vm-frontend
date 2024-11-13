import { defineStore } from "pinia"
import * as AccountApi from "@/api/account"
import type * as Account from "@/api/account/types/account"

interface AccountState {
  accounts: Account.Account[]
  total: number
  loading: boolean
  error: string | null
}

export const useAccountStore = defineStore("account", {
  state: (): AccountState => ({
    accounts: [],
    total: 0,
    loading: false,
    error: null
  }),

  actions: {
    // 获取账号列表
    async fetchAccounts(params: Account.AccountQueryParams) {
      this.loading = true
      this.error = null
      try {
        const response = await AccountApi.getAccounts(params)
        if (response.code === 0) {
          this.accounts = response.data.items
          this.total = response.data.total
        } else {
          throw new Error(response.message || "获取账号列表失败")
        }
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    // 同步账号
    async syncAccounts(accountIds: string[]) {
      this.loading = true
      try {
        const response = await AccountApi.syncAccounts(accountIds)
        if (response.code === 0) {
          return response
        }
        throw new Error(response.message || "同步账号失败")
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
