export interface VM {
  ID: string
  accountId: string
  subscriptionId: string
  name: string // 名称
  status: string // 状态
  size: string // 规格
  dnsAlias: string // DNS别名
  location: string // 位置
  osType: string // 操作系统类型
  vmId: string // 虚拟机ID
  createTime: string // 创建时间
  updateTime: string // 更新时间
  lastSyncAt: string // 最后同步时间
  createdTime: string // 创建时间
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
