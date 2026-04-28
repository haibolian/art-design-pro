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
    /** 若依实体基类 */
    interface BaseEntity {
      searchValue?: string
      createBy?: string
      createTime?: string
      updateBy?: string
      updateTime?: string
      remark?: string
      params?: Record<string, any>
    }

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

    /** 部门查询参数 */
    interface DeptQueryParams {
      deptName?: string
      status?: '0' | '1'
    }

    /** 部门信息 */
    interface DeptListItem extends BaseEntity {
      deptId?: number
      parentId?: number
      ancestors?: string
      deptName?: string
      orderNum?: number
      leader?: string
      phone?: string
      email?: string
      status?: '0' | '1'
      children?: DeptListItem[]
      [key: string]: any
    }

    /** 部门新增/编辑参数 */
    type DeptPayload = Partial<DeptListItem>

    /** 岗位分页查询参数 */
    interface PostSearchParams extends Partial<Api.Common.CommonSearchParams> {
      postCode?: string
      postName?: string
      status?: '0' | '1'
    }

    /** 岗位列表 */
    type PostList = Api.Common.PaginatedResponse<PostListItem> & {
      rows?: PostListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 岗位信息 */
    interface PostListItem extends BaseEntity {
      postId?: number
      postCode?: string
      postName?: string
      postSort?: number
      status?: '0' | '1'
      [key: string]: any
    }

    /** 岗位新增/编辑参数 */
    type PostPayload = Partial<PostListItem>

    /** 字典类型分页查询参数 */
    interface DictTypeSearchParams extends Partial<Api.Common.CommonSearchParams> {
      dictName?: string
      dictType?: string
      status?: '0' | '1'
      params?: {
        beginTime?: string
        endTime?: string
      }
    }

    /** 字典类型列表 */
    type DictTypeList = Api.Common.PaginatedResponse<DictTypeListItem> & {
      rows?: DictTypeListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 字典类型信息 */
    interface DictTypeListItem extends BaseEntity {
      dictId?: number
      dictName?: string
      dictType?: string
      status?: '0' | '1'
      [key: string]: any
    }

    type DictTypePayload = Partial<DictTypeListItem>

    /** 字典数据分页查询参数 */
    interface DictDataSearchParams extends Partial<Api.Common.CommonSearchParams> {
      dictType?: string
      dictLabel?: string
      status?: '0' | '1'
    }

    /** 字典数据列表 */
    type DictDataList = Api.Common.PaginatedResponse<DictDataListItem> & {
      rows?: DictDataListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 字典数据信息 */
    interface DictDataListItem extends BaseEntity {
      dictCode?: number
      dictLabel?: string
      dictValue?: string
      dictType?: string
      cssClass?: string
      listClass?: string
      dictSort?: number
      isDefault?: 'Y' | 'N'
      status?: '0' | '1'
      [key: string]: any
    }

    type DictDataPayload = Partial<DictDataListItem>

    /** 参数配置分页查询参数 */
    interface ConfigSearchParams extends Partial<Api.Common.CommonSearchParams> {
      configName?: string
      configKey?: string
      configType?: 'Y' | 'N'
      params?: {
        beginTime?: string
        endTime?: string
      }
    }

    /** 参数配置列表 */
    type ConfigList = Api.Common.PaginatedResponse<ConfigListItem> & {
      rows?: ConfigListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 参数配置信息 */
    interface ConfigListItem extends BaseEntity {
      configId?: number
      configName?: string
      configKey?: string
      configValue?: string
      configType?: 'Y' | 'N'
      [key: string]: any
    }

    type ConfigPayload = Partial<ConfigListItem>

    /** 通知公告分页查询参数 */
    interface NoticeSearchParams extends Partial<Api.Common.CommonSearchParams> {
      noticeTitle?: string
      createBy?: string
      noticeType?: '1' | '2'
    }

    /** 通知公告列表 */
    type NoticeList = Api.Common.PaginatedResponse<NoticeListItem> & {
      rows?: NoticeListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    /** 通知公告信息 */
    interface NoticeListItem extends BaseEntity {
      noticeId?: number
      noticeTitle?: string
      noticeType?: '1' | '2'
      noticeContent?: string
      status?: '0' | '1'
      [key: string]: any
    }

    type NoticePayload = Partial<NoticeListItem>
  }

  /** 系统监控类型 */
  namespace Monitor {
    /** 若依实体基类 */
    interface BaseEntity {
      searchValue?: string
      createBy?: string
      createTime?: string
      updateBy?: string
      updateTime?: string
      remark?: string
      params?: Record<string, any>
    }

    interface PageSearchParams extends Partial<Api.Common.CommonSearchParams> {
      pageNum?: number
      pageSize?: number
      orderByColumn?: string
      isAsc?: string
    }

    interface LogininforSearchParams extends PageSearchParams {
      ipaddr?: string
      userName?: string
      status?: '0' | '1'
      params?: {
        beginTime?: string
        endTime?: string
      }
    }

    type LogininforList = Api.Common.PaginatedResponse<LogininforListItem> & {
      rows?: LogininforListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    interface LogininforListItem extends BaseEntity {
      infoId?: number
      userName?: string
      ipaddr?: string
      loginLocation?: string
      browser?: string
      os?: string
      msg?: string
      loginTime?: string
      status?: '0' | '1'
      [key: string]: any
    }

    interface OperlogSearchParams extends PageSearchParams {
      operIp?: string
      title?: string
      operName?: string
      businessType?: number | string
      status?: '0' | '1'
      params?: {
        beginTime?: string
        endTime?: string
      }
    }

    type OperlogList = Api.Common.PaginatedResponse<OperlogListItem> & {
      rows?: OperlogListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    interface OperlogListItem extends BaseEntity {
      operId?: number
      title?: string
      businessType?: number | string
      method?: string
      requestMethod?: string
      operatorType?: number | string
      operName?: string
      deptName?: string
      operUrl?: string
      operIp?: string
      operLocation?: string
      operParam?: string
      jsonResult?: string
      errorMsg?: string
      operTime?: string
      costTime?: number
      status?: '0' | '1' | number
      [key: string]: any
    }

    interface OnlineSearchParams {
      ipaddr?: string
      userName?: string
    }

    type OnlineList = Api.Common.PaginatedResponse<OnlineListItem> & {
      rows?: OnlineListItem[]
      total: number
    }

    interface OnlineListItem {
      tokenId?: string
      deptName?: string
      userName?: string
      ipaddr?: string
      loginLocation?: string
      browser?: string
      os?: string
      loginTime?: string
      [key: string]: any
    }

    interface JobSearchParams extends PageSearchParams {
      jobName?: string
      jobGroup?: string
      status?: '0' | '1'
    }

    type JobList = Api.Common.PaginatedResponse<JobListItem> & {
      rows?: JobListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    interface JobListItem extends BaseEntity {
      jobId?: number
      jobName?: string
      jobGroup?: string
      invokeTarget?: string
      cronExpression?: string
      nextValidTime?: string
      misfirePolicy?: '0' | '1' | '2' | '3'
      concurrent?: '0' | '1'
      status?: '0' | '1'
      [key: string]: any
    }

    type JobPayload = Partial<JobListItem>

    interface JobLogSearchParams extends PageSearchParams {
      jobName?: string
      jobGroup?: string
      status?: '0' | '1'
      params?: {
        beginTime?: string
        endTime?: string
      }
    }

    type JobLogList = Api.Common.PaginatedResponse<JobLogListItem> & {
      rows?: JobLogListItem[]
      total: number
      pageNum?: number
      pageSize?: number
    }

    interface JobLogListItem extends BaseEntity {
      jobLogId?: number
      jobName?: string
      jobGroup?: string
      invokeTarget?: string
      jobMessage?: string
      exceptionInfo?: string
      status?: '0' | '1' | number
      [key: string]: any
    }

    interface ServerInfo {
      cpu?: {
        cpuNum?: number
        used?: number
        sys?: number
        free?: number
      }
      mem?: {
        total?: number
        used?: number
        free?: number
        usage?: number
      }
      jvm?: {
        total?: number
        used?: number
        free?: number
        usage?: number
        name?: string
        version?: string
        home?: string
        startTime?: string
        runTime?: string
        inputArgs?: string
      }
      sys?: {
        computerName?: string
        computerIp?: string
        osName?: string
        osArch?: string
        userDir?: string
      }
      sysFiles?: Array<{
        dirName?: string
        sysTypeName?: string
        typeName?: string
        total?: string
        free?: string
        used?: string
        usage?: number
      }>
      [key: string]: any
    }

    interface CacheInfo {
      info?: Record<string, string>
      dbSize?: number
      commandStats?: Array<{
        name?: string
        value?: number
      }>
      [key: string]: any
    }

    interface SysCache {
      cacheName?: string
      cacheKey?: string
      cacheValue?: string
      remark?: string
      [key: string]: any
    }
  }
}
