/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { username: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      username: string
      password: string
      code?: string
      uuid?: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
    }

    /** 验证码响应 */
    interface CaptchaResponse {
      captchaEnabled: boolean
      img: string
      uuid: string
    }

    /** 若依用户信息 */
    interface UserProfile {
      userId: number
      userName: string
      nickName?: string
      email?: string
      avatar?: string
      [key: string]: any
    }

    /** 获取用户信息响应 */
    interface GetInfoResponse {
      user: UserProfile
      roles: string[]
      permissions: string[]
      isDefaultModifyPwd?: boolean
      isPasswordExpired?: boolean
    }

    /** 用户信息 */
    interface UserInfo {
      roles: string[]
      permissions: string[]
      userId: number
      userName: string
      nickName?: string
      email?: string
      avatar?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 树形节点 */
    interface TreeSelectNode {
      id: number | string
      label: string
      disabled?: boolean
      children?: TreeSelectNode[]
      [key: string]: any
    }

    /** 部门信息 */
    interface DeptInfo {
      deptId?: number
      deptName?: string
      [key: string]: any
    }

    /** 岗位信息 */
    interface PostItem {
      postId?: number
      postName?: string
      status?: '0' | '1'
      [key: string]: any
    }

    /** 角色选项 */
    interface RoleOption {
      roleId?: number
      roleName?: string
      roleKey?: string
      roleSort?: number
      status?: '0' | '1'
      [key: string]: any
    }

    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem> & {
      rows?: UserListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 用户列表项 */
    interface UserListItem {
      userId?: number
      id?: number
      avatar?: string
      status?: '0' | '1'
      userName?: string
      nickName?: string
      userGender?: string
      sex?: '0' | '1' | '2'
      userPhone?: string
      phonenumber?: string
      userEmail?: string
      email?: string
      userRoles?: string[]
      deptId?: number
      dept?: DeptInfo
      postIds?: number[]
      roleIds?: number[]
      password?: string
      remark?: string
      createBy?: string
      createTime?: string
      updateBy?: string
      updateTime?: string
      [key: string]: any
    }

    /** 用户搜索参数 */
    interface UserSearchParams extends Partial<Api.Common.CommonSearchParams> {
      userName?: string
      phonenumber?: string
      status?: '0' | '1'
      deptId?: number
      beginTime?: string
      endTime?: string
      [key: string]: any
    }

    /** 用户新增/编辑参数 */
    type UserPayload = Partial<UserListItem>

    /** 用户详情响应 */
    interface UserDetailResponse {
      data?: UserListItem
      roleIds?: number[]
      postIds?: number[]
      roles?: RoleOption[]
      posts?: PostItem[]
      [key: string]: any
    }

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem> & {
      rows?: RoleListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 角色列表项 */
    interface RoleListItem {
      roleId?: number
      roleName?: string
      roleCode?: string
      roleKey?: string
      roleSort?: number
      description?: string
      enabled?: boolean
      status?: '0' | '1'
      dataScope?: '1' | '2' | '3' | '4' | '5'
      menuCheckStrictly?: boolean
      deptCheckStrictly?: boolean
      menuIds?: number[]
      deptIds?: number[]
      remark?: string
      createTime?: string
      [key: string]: any
    }

    /** 角色搜索参数 */
    interface RoleSearchParams extends Partial<Api.Common.CommonSearchParams> {
      roleName?: string
      roleKey?: string
      status?: '0' | '1'
      beginTime?: string
      endTime?: string
      [key: string]: any
    }

    /** 角色新增/编辑参数 */
    type RolePayload = Partial<RoleListItem>

    /** 角色菜单树响应 */
    interface RoleMenuTreeResponse {
      checkedKeys: number[]
      menus: TreeSelectNode[]
      [key: string]: any
    }

    /** 菜单查询参数 */
    interface MenuQueryParams {
      menuName?: string
      status?: '0' | '1'
    }

    /** 菜单类型 */
    type MenuType = 'M' | 'C' | 'F'

    /** 菜单列表项 */
    interface MenuListItem {
      menuId?: number
      parentId?: number
      menuName?: string
      orderNum?: number
      path?: string
      component?: string
      query?: string
      routeName?: string
      perms?: string
      icon?: string
      isFrame?: '0' | '1'
      isCache?: '0' | '1'
      menuType?: MenuType
      visible?: '0' | '1'
      status?: '0' | '1'
      createTime?: string
      children?: MenuListItem[]
      [key: string]: any
    }

    /** 菜单新增/编辑参数 */
    type MenuPayload = Partial<MenuListItem>
  }
}
