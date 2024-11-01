// stores/account.ts
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
      if (!state.accounts || state.accounts.length === 0) {
        return []
      }
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      return state.accounts.slice(start, end)
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
        total: state.accounts.length,
        normal: state.accounts.filter((acc) => acc.status === "normal").length,
        error: state.accounts.filter((acc) => acc.status === "error").length
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
    async fetchAccounts() {
      this.loading = true
      this.error = null
      try {
        const response = await getAccountList()

        // 检查响应状态和数据
        if (response.code === 0 && Array.isArray(response.data)) {
          this.accounts = response.data
          this.total = response.data.length
        } else {
          this.accounts = []
          this.total = 0
          // 可以选择是否抛出错误
          throw new Error(response.message || "获取数据失败")
        }
      } catch (err) {
        this.accounts = []
        this.total = 0
        this.error = (err as Error).message
        ElMessage.error("获取账户列表失败")
        throw err // 向上传递错误以便组件处理
      } finally {
        this.loading = false
      }
    },

    // 添加账户
    async addAccount(accountData: Account.CreateAccountRequest) {
      this.loading = true
      try {
        const newAccount = await createAccount(accountData)
        this.accounts.unshift(newAccount)
        this.total++
        ElMessage.success("添加账户成功")
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
        const index = this.accounts.findIndex((acc) => acc.id === id)
        if (index !== -1) {
          this.accounts[index] = {
            ...this.accounts[index],
            ...updatedAccount
          }
        }
        ElMessage.success("更新账户成功")
      } catch (err) {
        ElMessage.error("更新账户失败")
        throw err
      } finally {
        this.loading = false
      }
    },

    // 删除账户
    async deleteAccount(id: string) {
      try {
        await deleteAccount(id)
        const index = this.accounts.findIndex((acc) => acc.id === id)
        if (index !== -1) {
          this.accounts.splice(index, 1)
          this.total--
        }
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
          account.account.toLowerCase().includes(lowercaseQuery) ||
          account.remark.toLowerCase().includes(lowercaseQuery)
      )
    },

    // 重置状态
    resetState() {
      this.$reset()
    }
  }
})

// 导出 store 类型
export type AccountStore = ReturnType<typeof useAccountStore>
