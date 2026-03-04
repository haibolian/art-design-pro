import request from '@/utils/http'

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/login',
    params
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.GetInfoResponse>({
    url: '/getInfo'
  })
}

/**
 * 退出登录
 */
export function fetchLogout() {
  return request.post<void>({
    url: '/logout'
  })
}

/**
 * 获取验证码
 */
export function fetchCaptchaImage() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/captchaImage',
    timeout: 20000,
    showErrorMessage: false
  })
}
