export interface LoginRequestData {
  /** admin 或 editor */
  email: string
  /** 密码 */
  password: string
}

export type LoginCodeResponseData = ApiResponseData<string>

export type LoginResponseData = ApiResponseData<{ accessToken: string }>

export type UserInfoResponseData = ApiResponseData<{
  nickname: string
  userId: string
  roles: string[]
  email: string
  avatar: string
}>

// 更新用户信息
export interface UpdateUserInfoRequestData {
  nickname?: string
  avatar?: string
  loginEmail?: string
  oldPassword?: string
  newPassword?: string
  confirmPassword?: string
}
