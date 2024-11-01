export interface AzureAccount {
  id: string
  account: string
  remark: string
  status: "normal" | "error"
  type: string
  vmCount: number
  addTime: string
  statusUpdateTime: string
}

export interface AccountListResponse {
  code: number
  message: string
  data: AzureAccount[]
}

export interface CreateAccountRequest {
  loginEmail: string
  loginPassword?: string
  appId: string
  password: string
  tenant: string
  vmCount: number
  displayName: string
  remark: string
}
