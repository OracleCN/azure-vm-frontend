import { request } from "@/utils/service"
import type * as Login from "./types/login"

/** 登录并返回 Token */
export function loginApi(data: Login.LoginRequestData) {
  return request<Login.LoginResponseData>({
    url: "/login",
    method: "post",
    data
  })
}

/** 获取用户详情 */
export function getUserInfoApi() {
  return request<Login.UserInfoResponseData>({
    url: "/user",
    method: "get"
  })
}

// 更新用户信息
export function updateUserInfoApi(data: Login.UpdateUserInfoRequestData) {
  return request<Login.UserInfoResponseData>({
    url: "/user",
    method: "put",
    data
  })
}
