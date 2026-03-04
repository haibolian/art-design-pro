import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.UserList>({
    url: '/system/user/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.RoleList>({
    url: '/system/role/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/getRouters'
  })
}
