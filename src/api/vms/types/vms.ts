export interface VM {
  ID: string
  accountId: string
  subscriptionId: string
  name: string
  status: string
  size: string
  dnsAlias: string
  location: string
  osType: string
  vmId: string
  resourceGroup: string
  osImage: string
  core: number
  memory: number
  osDiskSize: number
  privateIps: string
  publicIps: string
  powerState: string
  syncStatus: string
  lastSyncAt: string
  createdTime: string
}

export interface VMListParams {
  accountId?: string
  subscriptionId?: string
  page?: number
  pageSize?: number
  status?: string
}

export interface VMListResponse {
  code: number
  message: string
  data: {
    items: VM[]
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface SyncVMsResponse {
  code: number
  message: string
  data: {
    totalVMs: number
    runningVMs: number
    stoppedVMs: number
  }
}

// 更新DNS别名 返回值
export interface UpdateDnsAliasResponse {
  code: number
  message: string
  data: []
}

export interface OperateVMResponse {
  code: number
  message: string
  data: []
}
