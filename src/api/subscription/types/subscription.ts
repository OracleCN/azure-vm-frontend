export interface Subscription {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  AccountID: string
  SubscriptionID: string
  DisplayName: string
  State: string
  SubscriptionPolicies: string
  AuthorizationSource: string
  SubscriptionType: string
  SpendingLimit: string
  StartDate: string
  EndDate: string
}

export interface SubscriptionListResponse {
  code: number
  message: string
  data: {
    items: Subscription[]
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface SubscriptionQueryParams {
  page: number
  pageSize: number
  search?: string
}
