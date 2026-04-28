import request from '@/utils/http'

const joinIds = (ids: number | number[]) => (Array.isArray(ids) ? ids.join(',') : ids)

// 登录日志
export function fetchGetLogininforList(params: Api.Monitor.LogininforSearchParams) {
  return request.get<Api.Monitor.LogininforList>({
    url: '/monitor/logininfor/list',
    params
  })
}

export function fetchDeleteLogininfor(infoId: number | number[]) {
  return request.del<void>({
    url: `/monitor/logininfor/${joinIds(infoId)}`
  })
}

export function fetchCleanLogininfor() {
  return request.del<void>({
    url: '/monitor/logininfor/clean'
  })
}

export function fetchUnlockLogininfor(userName: string) {
  return request.get<void>({
    url: `/monitor/logininfor/unlock/${userName}`
  })
}

// 操作日志
export function fetchGetOperlogList(params: Api.Monitor.OperlogSearchParams) {
  return request.get<Api.Monitor.OperlogList>({
    url: '/monitor/operlog/list',
    params
  })
}

export function fetchDeleteOperlog(operId: number | number[]) {
  return request.del<void>({
    url: `/monitor/operlog/${joinIds(operId)}`
  })
}

export function fetchCleanOperlog() {
  return request.del<void>({
    url: '/monitor/operlog/clean'
  })
}

// 在线用户
export function fetchGetOnlineList(params: Api.Monitor.OnlineSearchParams) {
  return request.get<Api.Monitor.OnlineList>({
    url: '/monitor/online/list',
    params
  })
}

export function fetchForceLogout(tokenId: string) {
  return request.del<void>({
    url: `/monitor/online/${tokenId}`
  })
}

// 定时任务
export function fetchGetJobList(params: Api.Monitor.JobSearchParams) {
  return request.get<Api.Monitor.JobList>({
    url: '/monitor/job/list',
    params
  })
}

export function fetchGetJobDetail(jobId: number) {
  return request.get<Api.Monitor.JobListItem>({
    url: `/monitor/job/${jobId}`
  })
}

export function fetchAddJob(data: Api.Monitor.JobPayload) {
  return request.post<void>({
    url: '/monitor/job',
    params: data
  })
}

export function fetchUpdateJob(data: Api.Monitor.JobPayload) {
  return request.put<void>({
    url: '/monitor/job',
    params: data
  })
}

export function fetchDeleteJob(jobId: number | number[]) {
  return request.del<void>({
    url: `/monitor/job/${joinIds(jobId)}`
  })
}

export function fetchChangeJobStatus(jobId: number, status: '0' | '1') {
  return request.put<void>({
    url: '/monitor/job/changeStatus',
    params: { jobId, status }
  })
}

export function fetchRunJob(jobId: number, jobGroup: string) {
  return request.put<void>({
    url: '/monitor/job/run',
    params: { jobId, jobGroup }
  })
}

// 调度日志
export function fetchGetJobLogList(params: Api.Monitor.JobLogSearchParams) {
  return request.get<Api.Monitor.JobLogList>({
    url: '/monitor/jobLog/list',
    params
  })
}

export function fetchDeleteJobLog(jobLogId: number | number[]) {
  return request.del<void>({
    url: `/monitor/jobLog/${joinIds(jobLogId)}`
  })
}

export function fetchCleanJobLog() {
  return request.del<void>({
    url: '/monitor/jobLog/clean'
  })
}

// 服务器监控
export function fetchGetServer() {
  return request.get<Api.Monitor.ServerInfo>({
    url: '/monitor/server'
  })
}

// 缓存监控
export function fetchGetCache() {
  return request.get<Api.Monitor.CacheInfo>({
    url: '/monitor/cache'
  })
}

export function fetchListCacheName() {
  return request.get<Api.Monitor.SysCache[]>({
    url: '/monitor/cache/getNames'
  })
}

export function fetchListCacheKey(cacheName: string) {
  return request.get<string[]>({
    url: `/monitor/cache/getKeys/${cacheName}`
  })
}

export function fetchGetCacheValue(cacheName: string, cacheKey: string) {
  return request.get<Api.Monitor.SysCache>({
    url: `/monitor/cache/getValue/${cacheName}/${cacheKey}`
  })
}

export function fetchClearCacheName(cacheName: string) {
  return request.del<void>({
    url: `/monitor/cache/clearCacheName/${cacheName}`
  })
}

export function fetchClearCacheKey(cacheKey: string) {
  return request.del<void>({
    url: `/monitor/cache/clearCacheKey/${cacheKey}`
  })
}

export function fetchClearCacheAll() {
  return request.del<void>({
    url: '/monitor/cache/clearCacheAll'
  })
}
