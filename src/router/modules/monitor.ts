import { AppRouteRecord } from '@/types/router'

export const monitorRoutes: AppRouteRecord = {
  path: '/monitor',
  name: 'Monitor',
  component: '/index/index',
  meta: {
    title: 'menus.monitor.title',
    icon: 'ri:dashboard-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'logininfor',
      name: 'Logininfor',
      component: '/monitor/logininfor',
      meta: {
        title: 'menus.monitor.logininfor',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'operlog',
      name: 'Operlog',
      component: '/monitor/operlog',
      meta: {
        title: 'menus.monitor.operlog',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'online',
      name: 'Online',
      component: '/monitor/online',
      meta: {
        title: 'menus.monitor.online',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'job',
      name: 'Job',
      component: '/monitor/job',
      meta: {
        title: 'menus.monitor.job',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'job-log/:jobId?',
      name: 'JobLog',
      component: '/monitor/job/log',
      meta: {
        title: 'menus.monitor.jobLog',
        isHide: true,
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'server',
      name: 'Server',
      component: '/monitor/server',
      meta: {
        title: 'menus.monitor.server',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'cache',
      name: 'Cache',
      component: '/monitor/cache',
      meta: {
        title: 'menus.monitor.cache',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'cache-list',
      name: 'CacheList',
      component: '/monitor/cache/list',
      meta: {
        title: 'menus.monitor.cacheList',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    },
    {
      path: 'druid',
      name: 'Druid',
      component: '/monitor/druid',
      meta: {
        title: 'menus.monitor.druid',
        keepAlive: true,
        roles: ['R_SUPER', 'R_ADMIN']
      }
    }
  ]
}
