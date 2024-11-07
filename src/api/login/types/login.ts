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
  loginEmail: string
  avatar: string
}>
