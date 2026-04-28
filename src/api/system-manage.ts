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

// 获取部门列表
export function fetchGetDeptList(params?: Api.SystemManage.DeptQueryParams) {
  return request.get<Api.SystemManage.DeptListItem[]>({
    url: '/system/dept/list',
    params
  })
}

// 获取部门列表（排除指定节点及子节点）
export function fetchGetDeptListExcludeChild(deptId: number) {
  return request.get<Api.SystemManage.DeptListItem[]>({
    url: `/system/dept/list/exclude/${deptId}`
  })
}

// 获取部门详情
export function fetchGetDeptDetail(deptId: number) {
  return request.get<Api.SystemManage.DeptListItem>({
    url: `/system/dept/${deptId}`
  })
}

// 新增部门
export function fetchAddDept(data: Api.SystemManage.DeptPayload) {
  return request.post<void>({
    url: '/system/dept',
    params: data
  })
}

// 更新部门
export function fetchUpdateDept(data: Api.SystemManage.DeptPayload) {
  return request.put<void>({
    url: '/system/dept',
    params: data
  })
}

// 删除部门
export function fetchDeleteDept(deptId: number) {
  return request.del<void>({
    url: `/system/dept/${deptId}`
  })
}

// 获取岗位列表
export function fetchGetPostList(params: Api.SystemManage.PostSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.PostList>({
    url: '/system/post/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

export function fetchGetPostDetail(postId: number) {
  return request.get<Api.SystemManage.PostListItem>({
    url: `/system/post/${postId}`
  })
}

export function fetchAddPost(data: Api.SystemManage.PostPayload) {
  return request.post<void>({
    url: '/system/post',
    params: data
  })
}

export function fetchUpdatePost(data: Api.SystemManage.PostPayload) {
  return request.put<void>({
    url: '/system/post',
    params: data
  })
}

export function fetchDeletePost(postId: number | number[]) {
  const id = Array.isArray(postId) ? postId.join(',') : postId
  return request.del<void>({
    url: `/system/post/${id}`
  })
}

// 获取字典类型列表
export function fetchGetDictTypeList(params: Api.SystemManage.DictTypeSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.DictTypeList>({
    url: '/system/dict/type/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

export function fetchGetDictTypeDetail(dictId: number) {
  return request.get<Api.SystemManage.DictTypeListItem>({
    url: `/system/dict/type/${dictId}`
  })
}

export function fetchAddDictType(data: Api.SystemManage.DictTypePayload) {
  return request.post<void>({
    url: '/system/dict/type',
    params: data
  })
}

export function fetchUpdateDictType(data: Api.SystemManage.DictTypePayload) {
  return request.put<void>({
    url: '/system/dict/type',
    params: data
  })
}

export function fetchDeleteDictType(dictId: number | number[]) {
  const id = Array.isArray(dictId) ? dictId.join(',') : dictId
  return request.del<void>({
    url: `/system/dict/type/${id}`
  })
}

export function fetchRefreshDictCache() {
  return request.del<void>({
    url: '/system/dict/type/refreshCache'
  })
}

export function fetchGetDictTypeOptions() {
  return request.get<Api.SystemManage.DictTypeListItem[]>({
    url: '/system/dict/type/optionselect'
  })
}

// 获取字典数据列表
export function fetchGetDictDataList(params: Api.SystemManage.DictDataSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.DictDataList>({
    url: '/system/dict/data/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

export function fetchGetDictDataDetail(dictCode: number) {
  return request.get<Api.SystemManage.DictDataListItem>({
    url: `/system/dict/data/${dictCode}`
  })
}

export function fetchAddDictData(data: Api.SystemManage.DictDataPayload) {
  return request.post<void>({
    url: '/system/dict/data',
    params: data
  })
}

export function fetchUpdateDictData(data: Api.SystemManage.DictDataPayload) {
  return request.put<void>({
    url: '/system/dict/data',
    params: data
  })
}

export function fetchDeleteDictData(dictCode: number | number[]) {
  const id = Array.isArray(dictCode) ? dictCode.join(',') : dictCode
  return request.del<void>({
    url: `/system/dict/data/${id}`
  })
}

// 获取参数配置列表
export function fetchGetConfigList(params: Api.SystemManage.ConfigSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.ConfigList>({
    url: '/system/config/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

export function fetchGetConfigDetail(configId: number) {
  return request.get<Api.SystemManage.ConfigListItem>({
    url: `/system/config/${configId}`
  })
}

export function fetchAddConfig(data: Api.SystemManage.ConfigPayload) {
  return request.post<void>({
    url: '/system/config',
    params: data
  })
}

export function fetchUpdateConfig(data: Api.SystemManage.ConfigPayload) {
  return request.put<void>({
    url: '/system/config',
    params: data
  })
}

export function fetchDeleteConfig(configId: number | number[]) {
  const id = Array.isArray(configId) ? configId.join(',') : configId
  return request.del<void>({
    url: `/system/config/${id}`
  })
}

export function fetchRefreshConfigCache() {
  return request.del<void>({
    url: '/system/config/refreshCache'
  })
}

// 获取通知公告列表
export function fetchGetNoticeList(params: Api.SystemManage.NoticeSearchParams) {
  const { current, size, ...rest } = params
  return request.get<Api.SystemManage.NoticeList>({
    url: '/system/notice/list',
    params: {
      pageNum: current,
      pageSize: size,
      ...rest
    }
  })
}

export function fetchGetNoticeDetail(noticeId: number) {
  return request.get<Api.SystemManage.NoticeListItem>({
    url: `/system/notice/${noticeId}`
  })
}

export function fetchAddNotice(data: Api.SystemManage.NoticePayload) {
  return request.post<void>({
    url: '/system/notice',
    params: data
  })
}

export function fetchUpdateNotice(data: Api.SystemManage.NoticePayload) {
  return request.put<void>({
    url: '/system/notice',
    params: data
  })
}

export function fetchDeleteNotice(noticeId: number | number[]) {
  const id = Array.isArray(noticeId) ? noticeId.join(',') : noticeId
  return request.del<void>({
    url: `/system/notice/${id}`
  })
}
