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

// 获取用户详情（不传 userId 时返回新增表单所需角色/岗位）
export function fetchGetUserDetail(userId?: number) {
  return request.get<Api.SystemManage.UserDetailResponse>({
    url: `/system/user/${userId ?? ''}`,
    returnRawResponse: true
  })
}

// 新增用户
export function fetchAddUser(data: Api.SystemManage.UserPayload) {
  return request.post<void>({
    url: '/system/user',
    params: data
  })
}

// 更新用户
export function fetchUpdateUser(data: Api.SystemManage.UserPayload) {
  return request.put<void>({
    url: '/system/user',
    params: data
  })
}

// 删除用户
export function fetchDeleteUser(userId: number | number[]) {
  const id = Array.isArray(userId) ? userId.join(',') : userId
  return request.del<void>({
    url: `/system/user/${id}`
  })
}

// 修改用户状态
export function fetchChangeUserStatus(userId: number, status: '0' | '1') {
  return request.put<void>({
    url: '/system/user/changeStatus',
    params: {
      userId,
      status
    }
  })
}

// 重置用户密码
export function fetchResetUserPwd(userId: number, password: string) {
  return request.put<void>({
    url: '/system/user/resetPwd',
    params: {
      userId,
      password
    }
  })
}

// 获取部门树
export function fetchGetDeptTree() {
  return request.get<Api.SystemManage.TreeSelectNode[]>({
    url: '/system/user/deptTree'
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

// 获取角色详情
export function fetchGetRoleDetail(roleId: number) {
  return request.get<Api.SystemManage.RoleListItem>({
    url: `/system/role/${roleId}`
  })
}

// 新增角色
export function fetchAddRole(data: Api.SystemManage.RolePayload) {
  return request.post<void>({
    url: '/system/role',
    params: data
  })
}

// 更新角色
export function fetchUpdateRole(data: Api.SystemManage.RolePayload) {
  return request.put<void>({
    url: '/system/role',
    params: data
  })
}

// 删除角色
export function fetchDeleteRole(roleId: number | number[]) {
  const id = Array.isArray(roleId) ? roleId.join(',') : roleId
  return request.del<void>({
    url: `/system/role/${id}`
  })
}

// 修改角色状态
export function fetchChangeRoleStatus(roleId: number, status: '0' | '1') {
  return request.put<void>({
    url: '/system/role/changeStatus',
    params: {
      roleId,
      status
    }
  })
}

// 获取菜单树（角色新增/编辑）
export function fetchGetMenuTree() {
  return request.get<Api.SystemManage.TreeSelectNode[]>({
    url: '/system/menu/treeselect'
  })
}

// 根据角色获取菜单树和已选菜单
export function fetchGetRoleMenuTree(roleId: number) {
  return request.get<Api.SystemManage.RoleMenuTreeResponse>({
    url: `/system/menu/roleMenuTreeselect/${roleId}`
  })
}

// 获取动态路由（用于路由初始化）
export function fetchGetRouters() {
  return request.get<AppRouteRecord[]>({
    url: '/getRouters'
  })
}

// 获取菜单列表（菜单管理）
export function fetchGetMenuList(params?: Api.SystemManage.MenuQueryParams) {
  return request.get<Api.SystemManage.MenuListItem[]>({
    url: '/system/menu/list',
    params
  })
}

// 获取菜单详情
export function fetchGetMenuDetail(menuId: number) {
  return request.get<Api.SystemManage.MenuListItem>({
    url: `/system/menu/${menuId}`
  })
}

// 新增菜单
export function fetchAddMenu(data: Api.SystemManage.MenuPayload) {
  return request.post<void>({
    url: '/system/menu',
    params: data
  })
}

// 更新菜单
export function fetchUpdateMenu(data: Api.SystemManage.MenuPayload) {
  return request.put<void>({
    url: '/system/menu',
    params: data
  })
}

// 删除菜单
export function fetchDeleteMenu(menuId: number) {
  return request.del<void>({
    url: `/system/menu/${menuId}`
  })
}
