export interface Account {
  accountId: string
  loginEmail: string
  remark: string
  appId: string
  tenant: string
  vmCount: number
  displayName: string
  createdAt: string
  updatedAt: string
  subscriptionStatus: string
}

export interface AccountListResponse {
  code: number
  message: string
  data: {
    items: Account[]
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface AccountQueryParams {
  page: number
  pageSize: number
  search?: string
}

export interface AzureAccount {
  accountId: string
  loginEmail: string
  remark: string
  appId: string
  tenant: string
  vmCount: number
  displayName: string
  createdAt: string
  updatedAt: string
  subscriptionStatus: string
}

export interface CreateAccountRequest {
  loginEmail: string
  remark?: string
  appId: string
  tenant: string
  displayName: string
}

export interface CreateAccountResponse {
  code: number
  message: string
  data: AzureAccount
}

export interface SyncAccountResult {
  accountId: string
  message: string
  subscriptionCount: number
  vmCount: number
}

export interface SyncAccountsResponse {
  code: number
  message: string
  data: {
    successAccounts: SyncAccountResult[]
    failedAccounts: SyncAccountResult[]
  }
}
