import { request } from "@/utils/service"
import type * as Subscription from "./types/subscription"

/** 获取指定账号的订阅列表 */
export function getSubscriptions(accountId: string) {
  return request<Subscription.SubscriptionListResponse>({
    url: `/subscriptions/${accountId}`,
    method: "get"
  })
}

/** 获取指定订阅详情 */
export function getSubscription(accountId: string, subscriptionId: string) {
  return request<Subscription.Subscription>({
    url: `/subscriptions/${accountId}/${subscriptionId}`,
    method: "get"
  })
}

/** 同步指定账号的订阅信息 */
export function syncSubscriptions(accountId: string) {
  return request<Subscription.SyncSubscriptionResponse>({
    url: `/subscriptions/${accountId}/sync`,
    method: "post"
  })
}
