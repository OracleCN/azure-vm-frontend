import { request } from "@/utils/service"
import type * as VM from "./types/vms"

/** 获取虚拟机列表 */
export function getVMList(params: VM.VMListParams) {
  return request<VM.VMListResponse>({
    url: "/vms",
    method: "get",
    params
  })
}

/** 获取单个虚拟机详情 */
export function getVM(accountId: string, vmId: string) {
  return request<VM.VM>({
    url: `/vms/${accountId}/instance/${vmId}`,
    method: "get"
  })
}

/** 获取指定订阅下的虚拟机列表 */
export function getVMsBySubscription(accountId: string, subscriptionId: string) {
  return request<VM.VMListResponse>({
    url: `/vms/${accountId}/subscription/${subscriptionId}`,
    method: "get"
  })
}

/** 同步指定账号下的所有虚拟机 */
export function syncVMs(accountId: string) {
  return request<VM.SyncVMsResponse>({
    url: `/vms/${accountId}/sync`,
    method: "post"
  })
}

/** 同步指定订阅下的虚拟机 */
export function syncVMsBySubscription(accountId: string, subscriptionId: string) {
  return request<VM.SyncVMsResponse>({
    url: `/vms/${accountId}/subscription/${subscriptionId}/sync`,
    method: "post"
  })
}
