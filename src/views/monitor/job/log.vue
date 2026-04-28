<template>
  <div class="art-full-height">
    <ProTable
      ref="proTableRef"
      :request="fetchJobLogList"
      :columns="columns"
      :immediate="false"
    >
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton
            v-auth="'monitor:job:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteJobLog()"
            v-ripple
          >
            删除
          </ElButton>
          <ElButton v-auth="'monitor:job:remove'" @click="cleanJobLog" v-ripple>清空</ElButton>
          <ElButton @click="closePage" v-ripple>关闭</ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog v-model="detailVisible" title="调度日志详细" width="720px" align-center destroy-on-close>
      <ElDescriptions v-if="currentRow" :column="2" border>
        <ElDescriptionsItem label="日志序号">{{ currentRow.jobLogId }}</ElDescriptionsItem>
        <ElDescriptionsItem label="任务名称">{{ currentRow.jobName }}</ElDescriptionsItem>
        <ElDescriptionsItem label="任务分组">
          <ArtDictTag :dict-type="DICT_TYPE.JOB_GROUP" :value="currentRow.jobGroup" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="执行时间">{{ currentRow.createTime }}</ElDescriptionsItem>
        <ElDescriptionsItem label="调用方法" :span="2">{{ currentRow.invokeTarget }}</ElDescriptionsItem>
        <ElDescriptionsItem label="日志信息" :span="2">{{ currentRow.jobMessage }}</ElDescriptionsItem>
        <ElDescriptionsItem label="执行状态">
          <ArtDictTag :dict-type="DICT_TYPE.COMMON_STATUS" :value="currentRow.status" />
        </ElDescriptionsItem>
        <ElDescriptionsItem
          v-if="currentRow.status === 1 || currentRow.status === '1'"
          label="异常信息"
          :span="2"
        >
          <pre class="log-pre">{{ currentRow.exceptionInfo }}</pre>
        </ElDescriptionsItem>
      </ElDescriptions>

      <template #footer>
        <ElButton @click="detailVisible = false">关闭</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtDictTag from '@/components/core/display/art-dict-tag/index.vue'
  import { DICT_TYPE } from '@/types'
  import type { ProTableColumn, ProTableExpose } from '@/types/component'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchCleanJobLog,
    fetchDeleteJobLog,
    fetchGetJobDetail,
    fetchGetJobLogList
  } from '@/api/monitor'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'JobLog' })

  type JobLogListItem = Api.Monitor.JobLogListItem

  const route = useRoute()
  const router = useRouter()
  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<JobLogListItem> | null>(null)
  const detailVisible = ref(false)
  const currentRow = ref<JobLogListItem>()
  const jobFilter = reactive<Pick<Api.Monitor.JobLogSearchParams, 'jobName' | 'jobGroup'>>({
    jobName: undefined,
    jobGroup: undefined
  })

  const fetchJobLogList = (params: Api.Monitor.JobLogSearchParams) =>
    fetchGetJobLogList({
      ...jobFilter,
      ...params
    })

  const columns: ProTableColumn<JobLogListItem, Api.Monitor.JobLogSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'jobLogId', label: '日志编号', width: 100 },
    {
      prop: 'jobName',
      label: '任务名称',
      minWidth: 150,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.jobName as string
    },
    {
      prop: 'jobGroup',
      label: '任务组名',
      width: 130,
      dictType: DICT_TYPE.JOB_GROUP,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'invokeTarget',
      label: '调用目标字符串',
      minWidth: 220,
      showOverflowTooltip: true,
      formatter: (row) => row.invokeTarget as string
    },
    {
      prop: 'jobMessage',
      label: '日志信息',
      minWidth: 220,
      showOverflowTooltip: true,
      formatter: (row) => row.jobMessage as string
    },
    {
      prop: 'status',
      label: '执行状态',
      width: 110,
      dictType: DICT_TYPE.COMMON_STATUS,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'createTimeRange',
      label: '执行时间',
      hideInTable: true,
      search: {
        type: 'daterange',
        label: '执行时间',
        props: {
          valueFormat: 'YYYY-MM-DD',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期'
        },
        transform: (value) => {
          const range = value as string[]
          return {
            params: {
              beginTime: range[0],
              endTime: range[1]
            }
          }
        }
      }
    },
    {
      prop: 'createTime',
      label: '执行时间',
      minWidth: 170,
      formatter: (row) => row.createTime as string
    },
    {
      prop: 'operation',
      label: '操作',
      width: 90,
      fixed: 'right',
      align: 'right',
      cellRender: (row) => {
        if (!hasAuth('monitor:job:query')) return ''
        return h('div', { style: 'text-align: right' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => openDetail(row) })
        ])
      }
    }
  ]

  const openDetail = (row: JobLogListItem) => {
    currentRow.value = row
    detailVisible.value = true
  }

  const getSelectedIds = () =>
    (proTableRef.value?.selectedRows ?? [])
      .map((item) => item.jobLogId)
      .filter((jobLogId): jobLogId is number => typeof jobLogId === 'number')

  const deleteJobLog = async () => {
    const ids = getSelectedIds()
    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的调度日志')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除调度日志编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteJobLog(ids)
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const cleanJobLog = async () => {
    try {
      await ElMessageBox.confirm('确认清空所有调度日志数据吗？', '清空确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchCleanJobLog()
      ElMessage.success('清空成功')
      await proTableRef.value?.refreshData()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const closePage = () => {
    router.push({ name: 'Job' })
  }

  const init = async () => {
    if (route.params.jobId !== undefined) {
      const routeJobId = Number(route.params.jobId)
      if (Number.isNaN(routeJobId)) {
        throw new Error('调度日志路由参数 jobId 不是有效数字')
      }
      if (routeJobId === 0) {
        await proTableRef.value?.refreshData()
        return
      }
      const job = await fetchGetJobDetail(routeJobId)
      jobFilter.jobName = job.jobName
      jobFilter.jobGroup = job.jobGroup
    }
    await proTableRef.value?.refreshData()
  }

  onMounted(init)
</script>

<style scoped>
  .log-pre {
    max-height: 220px;
    margin: 0;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: var(--el-font-family);
  }
</style>
