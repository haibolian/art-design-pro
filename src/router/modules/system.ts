import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:user-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'User',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'role',
      name: 'Role',
      component: '/system/role',
      meta: {
        title: 'menus.system.role',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'dept',
      name: 'Dept',
      component: '/system/dept',
      meta: {
        title: 'menus.system.dept',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'post',
      name: 'Post',
      component: '/system/post',
      meta: {
        title: 'menus.system.post',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    },
    {
      path: 'menu',
      name: 'Menus',
      component: '/system/menu',
      meta: {
        title: 'menus.system.menu',
        keepAlive: true,
        roles: ['R_SUPER'],
        authList: [
          { title: '新增', authMark: 'add' },
          { title: '编辑', authMark: 'edit' },
          { title: '删除', authMark: 'delete' }
        ]
      }
    },
    {
      path: 'dict',
      name: 'Dict',
      component: '/system/dict',
      meta: {
        title: 'menus.system.dict',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'dict-data/:dictId',
      name: 'DictData',
      component: '/system/dict/data',
      meta: {
        title: 'menus.system.dictData',
        isHide: true,
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'config',
      name: 'Config',
      component: '/system/config',
      meta: {
        title: 'menus.system.config',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'notice',
      name: 'Notice',
      component: '/system/notice',
      meta: {
        title: 'menus.system.notice',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    }
  ]
}
