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

/** 更新DNS别名 */
export function updateDnsAlias(accountId: string, vmId: string, dnsLabel: string) {
  return request<VM.UpdateDnsAliasResponse>({
    url: `/vms/update/dns/${accountId}/${vmId}`,
    method: "post",
    data: { dnsLabel }
  })
}

/** 操作虚拟机  /vms/{accountId}/{id}/operate*/
export function operateVM(
  accountId: string,
  id: string,
  operation: string,
  force: boolean = false // 添加可选的 force 参数，默认为 false
) {
  return request<VM.OperateVMResponse>({
    url: `/vms/${accountId}/${id}/operate`,
    method: "post",
    data: {
      operation,
      force // 在请求数据中包含 force 参数
    }
  })
}
