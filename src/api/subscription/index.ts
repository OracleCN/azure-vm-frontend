import { request } from "@/utils/service"
import type * as Subscription from "./types/subscription"

/** 获取订阅列表 */
export function getSubscriptions(params: Subscription.SubscriptionQueryParams) {
  return request<Subscription.SubscriptionListResponse>({
    url: "/subscriptions/list",
    method: "post",
    data: params
  })
}

/** 同步订阅信息 */
export function syncSubscriptions(accountIds: string[]) {
  return request<{ code: number; message: string; data: any }>({
    url: "/subscriptions/sync",
    method: "post",
    data: { accountIds }
  })
}
