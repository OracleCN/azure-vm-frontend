export interface VM {
  id: string
  accountId: string
  subscriptionId: string
  name: string
  status: string
  size: string
  location: string
  createTime: string
  updateTime: string
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
    list: VM[]
    total: number
  }
}

export interface SyncVMsResponse {
  code: number
  message: string
  data: {
    success: boolean
    syncedCount: number
  }
}
