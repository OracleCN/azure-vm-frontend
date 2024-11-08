export interface Subscription {
  id: string
  accountId: string
  name: string
  status: string
  spendLimit: string
  createTime: string
  updateTime: string
}

export interface SubscriptionListResponse {
  code: number
  message: string
  data: Subscription[]
}

export interface SyncSubscriptionResponse {
  code: number
  message: string
  data: Record<string, any> // 使用更宽松的类型定义适应空对象
}

export interface SubscriptionQueryParams {
  page: number
  page_size: number
  keyword?: string
}
