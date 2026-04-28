<template>
  <div class="server-page" v-loading="loading">
    <ElRow :gutter="16">
      <ElCol :xs="24" :lg="12">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:cpu-line" />
              <span>CPU</span>
            </div>
          </template>
          <ElTable :data="cpuRows" border>
            <ElTableColumn prop="label" label="属性" />
            <ElTableColumn prop="value" label="值" />
          </ElTable>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="12">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:database-2-line" />
              <span>内存</span>
            </div>
          </template>
          <ElTable :data="memoryRows" border>
            <ElTableColumn prop="label" label="属性" />
            <ElTableColumn prop="memory" label="内存" />
            <ElTableColumn prop="jvm" label="JVM" />
          </ElTable>
        </ElCard>
      </ElCol>

      <ElCol :span="24">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:server-line" />
              <span>服务器信息</span>
            </div>
          </template>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="服务器名称">
              {{ server.sys?.computerName }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="操作系统">{{ server.sys?.osName }}</ElDescriptionsItem>
            <ElDescriptionsItem label="服务器IP">{{ server.sys?.computerIp }}</ElDescriptionsItem>
            <ElDescriptionsItem label="系统架构">{{ server.sys?.osArch }}</ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :span="24">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:cup-line" />
              <span>Java 虚拟机信息</span>
            </div>
          </template>
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="Java 名称">{{ server.jvm?.name }}</ElDescriptionsItem>
            <ElDescriptionsItem label="Java 版本">{{ server.jvm?.version }}</ElDescriptionsItem>
            <ElDescriptionsItem label="启动时间">{{ server.jvm?.startTime }}</ElDescriptionsItem>
            <ElDescriptionsItem label="运行时长">{{ server.jvm?.runTime }}</ElDescriptionsItem>
            <ElDescriptionsItem label="安装路径" :span="2">{{ server.jvm?.home }}</ElDescriptionsItem>
            <ElDescriptionsItem label="项目路径" :span="2">{{ server.sys?.userDir }}</ElDescriptionsItem>
            <ElDescriptionsItem label="运行参数" :span="2">
              {{ server.jvm?.inputArgs }}
            </ElDescriptionsItem>
          </ElDescriptions>
        </ElCard>
      </ElCol>

      <ElCol :span="24">
        <ElCard class="monitor-card" shadow="never">
          <template #header>
            <div class="card-title">
              <ArtSvgIcon icon="ri:hard-drive-3-line" />
              <span>磁盘状态</span>
            </div>
          </template>
          <ElTable :data="server.sysFiles" border>
            <ElTableColumn prop="dirName" label="盘符路径" min-width="140" show-overflow-tooltip />
            <ElTableColumn prop="sysTypeName" label="文件系统" min-width="120" />
            <ElTableColumn prop="typeName" label="盘符类型" min-width="120" />
            <ElTableColumn prop="total" label="总大小" min-width="100" />
            <ElTableColumn prop="free" label="可用大小" min-width="100" />
            <ElTableColumn prop="used" label="已用大小" min-width="100" />
            <ElTableColumn prop="usage" label="已用百分比" min-width="110">
              <template #default="{ row }">
                <span :class="{ danger: row.usage > 80 }">{{ row.usage }}%</span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetServer } from '@/api/monitor'

  defineOptions({ name: 'Server' })

  const loading = ref(false)
  const server = ref<Api.Monitor.ServerInfo>({})

  const cpuRows = computed(() => [
    { label: '核心数', value: server.value.cpu?.cpuNum },
    { label: '用户使用率', value: server.value.cpu?.used !== undefined ? `${server.value.cpu.used}%` : undefined },
    { label: '系统使用率', value: server.value.cpu?.sys !== undefined ? `${server.value.cpu.sys}%` : undefined },
    { label: '当前空闲率', value: server.value.cpu?.free !== undefined ? `${server.value.cpu.free}%` : undefined }
  ])

  const memoryRows = computed(() => [
    {
      label: '总内存',
      memory: server.value.mem?.total !== undefined ? `${server.value.mem.total}G` : undefined,
      jvm: server.value.jvm?.total !== undefined ? `${server.value.jvm.total}M` : undefined
    },
    {
      label: '已用内存',
      memory: server.value.mem?.used !== undefined ? `${server.value.mem.used}G` : undefined,
      jvm: server.value.jvm?.used !== undefined ? `${server.value.jvm.used}M` : undefined
    },
    {
      label: '剩余内存',
      memory: server.value.mem?.free !== undefined ? `${server.value.mem.free}G` : undefined,
      jvm: server.value.jvm?.free !== undefined ? `${server.value.jvm.free}M` : undefined
    },
    {
      label: '使用率',
      memory: server.value.mem?.usage !== undefined ? `${server.value.mem.usage}%` : undefined,
      jvm: server.value.jvm?.usage !== undefined ? `${server.value.jvm.usage}%` : undefined
    }
  ])

  const loadServer = async () => {
    loading.value = true
    try {
      server.value = await fetchGetServer()
    } finally {
      loading.value = false
    }
  }

  loadServer()
</script>

<style scoped>
  .server-page {
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

  .danger {
    color: var(--el-color-danger);
    font-weight: 600;
  }
</style>
