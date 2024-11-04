export interface AzureAccount {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  accountId: string
  userId: string
  loginEmail: string
  loginPassword: string
  remark: string
  appId: string
  password: string
  tenant: string
  vmCount: number
  displayName: string
  subscription_status: "normal" | "error"
}

export interface AccountListResponse {
  code: number
  message: string
  data: AzureAccount[]
  total?: number
  page?: number
  pageSize?: number
}

export interface CreateAccountRequest {
  loginEmail: string
  loginPassword: string
  appId: string
  password: string
  tenant: string
  vmCount: number
  displayName: string
  remark: string
}

export interface AccountListParams {
  page: number
  pageSize: number
  search?: string
}
export interface UpdateAccountRequest {
  id: string
  loginEmail?: string
  loginPassword?: string
  appId?: string
  password?: string
  tenant?: string
  displayName?: string
  remark?: string
}
