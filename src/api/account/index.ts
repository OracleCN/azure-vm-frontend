import { request } from "@/utils/service"
import type * as Account from "./types/account"

/** 获取账户列表 */
export function getAccountList(params: Account.AccountListParams) {
  return request<Account.AccountListResponse>({
    url: "/accounts/list",
    method: "post",
    data: params
  })
}

/** 获取单个账户 */
export function getAccount(id: string) {
  return request<Account.AzureAccount>({
    url: `/accounts/${id}`,
    method: "get"
  })
}

/** 创建账户 */
export function createAccount(data: Account.CreateAccountRequest) {
  return request<Account.CreateAccountResponse>({
    url: "/accounts/create",
    method: "post",
    data
  })
}

/** 更新账户 */
export function updateAccount(id: string, data: Partial<Account.AzureAccount>) {
  return request<Account.AzureAccount>({
    url: `/accounts/update/${id}`,
    method: "post",
    data
  })
}

/** 删除账户 */
export function deleteAccount(id: Array<string>) {
  return request({
    url: `/accounts/delete`,
    method: "delete",
    // 这里传入的一个 数组 支持批量删除
    data: id
  })
}
