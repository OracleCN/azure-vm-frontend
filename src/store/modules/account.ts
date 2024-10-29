// stores/account.ts
import { defineStore } from "pinia"
import { ElMessage } from "element-plus"

// 类型定义
interface AzureAccount {
  id: string
  account: string
  remark: string
  status: "normal" | "error"
  type: string
  vmCount: number
  addTime: string
  statusUpdateTime: string
}

interface AccountState {
  accounts: AzureAccount[]
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
    paginatedAccounts: (state): AzureAccount[] => {
      const start = (state.currentPage - 1) * state.pageSize
      const end = start + state.pageSize
      return state.accounts.slice(start, end)
    },

    accountStats: (state) => ({
      total: state.accounts.length,
      normal: state.accounts.filter((acc) => acc.status === "normal").length,
      error: state.accounts.filter((acc) => acc.status === "error").length
    })
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
        // 这里替换为实际的 API 调用
        const response = await fetch("/api/accounts")
        const data = await response.json()

        this.accounts = data.accounts
        this.total = data.total
      } catch (err) {
        this.error = (err as Error).message
        ElMessage.error("获取账户列表失败")
      } finally {
        this.loading = false
      }
    },

    // 添加账户
    async addAccount(account: Omit<AzureAccount, "id" | "addTime" | "statusUpdateTime">) {
      this.loading = true
      try {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(account)
        })
        const newAccount = await response.json()

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
    async updateAccount(id: string, data: Partial<AzureAccount>) {
      this.loading = true
      try {
        const response = await fetch(`/api/accounts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        })
        const updatedAccount = await response.json()

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
        await fetch(`/api/accounts/${id}`, {
          method: "DELETE"
        })

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

// 导出类型，以供其他文件使用
export type { AzureAccount, AccountState }
