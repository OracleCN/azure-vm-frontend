import { request } from "@/utils/service"
import type * as Account from "./types/account"

/** 获取账户列表 */
export function getAccountList() {
  return request<Account.AccountListResponse>({
    url: "/accounts/list",
    method: "post"
  })
}

/** 获取账户列表 */
export function getAccount() {
  return request<Account.AzureAccount>({
    url: "/accounts/${id}",
    method: "get"
  })
}

/** 创建账户 */
export function createAccount(data: Account.CreateAccountRequest) {
  return request<Account.AzureAccount>({
    url: "/accounts/create",
    method: "post",
    data
  })
}

/** 更新账户 */
export function updateAccount(id: string, data: Partial<Account.AzureAccount>) {
  return request<Account.AzureAccount>({
    url: `/accounts/${id}`,
    method: "post",
    data
  })
}

/** 删除账户 */
export function deleteAccount(id: string) {
  return request({
    url: `/accounts/${id}`,
    method: "get"
  })
}
