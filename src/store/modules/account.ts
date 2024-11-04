import { defineStore } from "pinia"
import { ElMessage } from "element-plus"
import { getAccountList, createAccount, updateAccount, deleteAccount } from "@/api/account"
import type * as Account from "@/api/account/types/account"

interface AccountState {
  accounts: Account.AzureAccount[]
  loading: boolean
  error: string | null
  total: number
  currentPage: number
  pageSize: number
}

export const useAccountStore = defineStore("account", {
  state: (): AccountState => ({
    accounts: [],
    loading: false,
    error: null,
    total: 0,
    currentPage: 1,
    pageSize: 10
  }),

  getters: {
    paginatedAccounts: (state): Account.AzureAccount[] => {
      return state.accounts
    },

    accountStats: (state) => {
      if (!state.accounts || state.accounts.length === 0) {
        return {
          total: 0,
          normal: 0,
          error: 0
        }
      }
      return {
        total: state.total,
        normal: state.accounts.filter((acc) => acc.subscription_status === "normal").length,
        error: state.accounts.filter((acc) => acc.subscription_status === "error").length
      }
    }
  },

  actions: {
    // 设置分页参数
    setPageParams(currentPage: number, pageSize: number) {
      this.currentPage = currentPage
      this.pageSize = pageSize
    },

    // 获取账户列表
    async fetchAccounts(params: Account.AccountListParams) {
      this.loading = true
      this.error = null
      try {
        const response = await getAccountList(params)

        // 检查响应状态和数据
        if (response.code === 0 && Array.isArray(response.data)) {
          this.accounts = response.data
          this.total = response.total ?? response.data.length
          this.currentPage = params.page
          this.pageSize = params.pageSize
        } else {
          this.accounts = []
          this.total = 0
          throw new Error(response.message || "获取数据失败")
        }
      } catch (err) {
        this.accounts = []
        this.total = 0
        this.error = (err as Error).message
        ElMessage.error("获取账户列表失败")
        throw err
      } finally {
        this.loading = false
      }
    },

    // 添加账户
    async addAccount(accountData: Account.CreateAccountRequest) {
      this.loading = true
      try {
        const newAccount = await createAccount(accountData)
        await this.fetchAccounts({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        ElMessage.success("添加账户成功")
        return newAccount
      } catch (err) {
        ElMessage.error("添加账户失败")
        throw err
      } finally {
        this.loading = false
      }
    },

    // 更新账户
    async updateAccount(id: string, data: Partial<Account.AzureAccount>) {
      this.loading = true
      try {
        const updatedAccount = await updateAccount(id, data)
        await this.fetchAccounts({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        ElMessage.success("更新账户成功")
        return updatedAccount
      } catch (err) {
        ElMessage.error("更新账户失败")
        throw err
      } finally {
        this.loading = false
      }
    },

    // 删除账户
    async deleteAccount(id: Array<string>) {
      try {
        await deleteAccount(id)
        await this.fetchAccounts({
          page: this.currentPage,
          pageSize: this.pageSize
        })
        ElMessage.success("删除账户成功")
      } catch (err) {
        ElMessage.error("删除账户失败")
        throw err
      }
    },

    // 搜索账户
    filterAccounts(query: string) {
      if (!query) return this.accounts

      const lowercaseQuery = query.toLowerCase()
      return this.accounts.filter(
        (account) =>
          account.loginEmail.toLowerCase().includes(lowercaseQuery) ||
          account.displayName.toLowerCase().includes(lowercaseQuery) ||
          account.remark.toLowerCase().includes(lowercaseQuery)
      )
    },

    // 重置状态
    resetState() {
      this.$reset()
    }
  }
})
