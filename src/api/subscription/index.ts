import { request } from "@/utils/service"
import type * as Subscription from "./types/subscription"

/** 获取指定账号的订阅列表 */
export function getSubscriptions(params: Subscription.SubscriptionQueryParams) {
  return request<Subscription.SubscriptionListResponse>({
    url: `/subscriptions/list`,
    method: "post",
    data: {
      page: params.page,
      page_size: params.page_size,
      keyword: params.keyword
    }
  })
}

/** 获取指定订阅详情 */
export function getSubscription(accountId: string, subscriptionId: string) {
  return request<Subscription.Subscription>({
    url: `/subscriptions/${accountId}/${subscriptionId}`,
    method: "get"
  })
}

/** 同步账号的订阅信息 */
export function syncSubscriptions(accountIds: string[]) {
  return request<Subscription.SyncSubscriptionResponse>({
    url: `/subscriptions/sync`,
    method: "post",
    data: {
      accountIds: accountIds
    }
  })
}
