<template>
  <div class="cache-page" v-loading="loading">
    <ElRow :gutter="16">
      <ElCol :span="24">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:database-2-line" />
              <span>基本信息</span>
            </div>
          </template>
          <ElDescriptions :column="4" border>
            <ElDescriptionsItem label="Redis版本">{{ cache.info?.redis_version }}</ElDescriptionsItem>
            <ElDescriptionsItem label="运行模式">
              {{ formatRedisMode(cache.info?.redis_mode) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="端口">{{ cache.info?.tcp_port }}</ElDescriptionsItem>
            <ElDescriptionsItem label="客户端数">{{ cache.info?.connected_clients }}</ElDescriptionsItem>
            <ElDescriptionsItem label="运行时间(天)">
              {{ cache.info?.uptime_in_days }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="使用内存">{{ cache.info?.used_memory_human }}</ElDescriptionsItem>
            <ElDescriptionsItem label="使用CPU">
              {{ formatCpu(cache.info?.used_cpu_user_children) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="内存配置">{{ cache.info?.maxmemory_human }}</ElDescriptionsItem>
            <ElDescriptionsItem label="AOF是否开启">
              {{ formatEnabled(cache.info?.aof_enabled) }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="RDB是否成功">
              {{ cache.info?.rdb_last_bgsave_status }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="Key数量">{{ cache.dbSize }}</ElDescriptionsItem>
            <ElDescriptionsItem label="网络入口/出口">
              {{ cache.info?.instantaneous_input_kbps }}kps /
              {{ cache.info?.instantaneous_output_kbps }}kps
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:pie-chart-line" />
              <span>命令统计</span>
            </div>
          </template>
          <div ref="commandChartRef" class="chart-box" />
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:bar-chart-2-line" />
              <span>内存信息</span>
            </div>
          </template>
          <div ref="memoryChartRef" class="chart-box" />
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { echarts, type EChartsOption } from '@/plugins/echarts'
  import { fetchGetCache } from '@/api/monitor'

  defineOptions({ name: 'Cache' })

  const loading = ref(false)
  const cache = ref<Api.Monitor.CacheInfo>({})
  const commandChartRef = ref<HTMLDivElement>()
  const memoryChartRef = ref<HTMLDivElement>()
  let commandChart: echarts.ECharts | undefined
  let memoryChart: echarts.ECharts | undefined

  const formatRedisMode = (value?: string) => {
    if (value === 'standalone') return '单机'
    if (value === 'cluster') return '集群'
    return value
  }

  const formatEnabled = (value?: string) => {
    if (value === '0') return '否'
    if (value === '1') return '是'
    return value
  }

  const formatCpu = (value?: string) => (value !== undefined ? Number.parseFloat(value).toFixed(2) : value)

  const renderCharts = async () => {
    if (!cache.value.info) {
      throw new Error('缓存监控接口缺少 info')
    }
    if (!Array.isArray(cache.value.commandStats)) {
      throw new Error('缓存监控接口缺少 commandStats')
    }
    await nextTick()
    if (!commandChartRef.value || !memoryChartRef.value) {
      throw new Error('缓存监控图表容器未挂载')
    }

    commandChart?.dispose()
    memoryChart?.dispose()
    commandChart = echarts.init(commandChartRef.value)
    memoryChart = echarts.init(memoryChartRef.value)

    commandChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          name: '命令',
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['50%', '45%'],
          data: cache.value.commandStats
        }
      ]
    } satisfies EChartsOption)

    const usedMemory = cache.value.info.used_memory_human
    memoryChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 24, top: 32, bottom: 40 },
      xAxis: { type: 'category', data: ['当前内存'] },
      yAxis: { type: 'value' },
      series: [
        {
          name: usedMemory,
          type: 'bar',
          barWidth: 48,
          data: [Number.parseFloat(usedMemory)]
        }
      ]
    } satisfies EChartsOption)
  }

  const handleResize = () => {
    commandChart?.resize()
    memoryChart?.resize()
  }

  const loadCache = async () => {
    loading.value = true
    try {
      cache.value = await fetchGetCache()
      await renderCharts()
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    loadCache()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    commandChart?.dispose()
    memoryChart?.dispose()
  })
</script>

<style scoped>
  .cache-page {
    padding: 16px;
  }

  .monitor-card {
    margin-bottom: 16px;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }

  .chart-box {
    width: 100%;
    height: 360px;
  }
</style>
