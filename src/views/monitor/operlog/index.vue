<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetOperlogList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton
            v-auth="'monitor:operlog:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteOperlog()"
            v-ripple
          >
            删除
          </ElButton>
          <ElButton v-auth="'monitor:operlog:remove'" @click="cleanOperlog" v-ripple>
            清空
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog
      v-model="detailVisible"
      title="操作日志详细"
      width="820px"
      align-center
      destroy-on-close
    >
      <ElDescriptions v-if="currentRow" :column="2" border>
        <ElDescriptionsItem label="系统模块">
          <ElSpace>
            <span>{{ currentRow.title }}</span>
            <ArtDictTag :dict-type="DICT_TYPE.OPER_TYPE" :value="currentRow.businessType" />
          </ElSpace>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="登录信息">
          {{ currentRow.operName }} / {{ currentRow.operIp }} / {{ currentRow.operLocation }}
        </ElDescriptionsItem>
        <ElDescriptionsItem label="请求地址">{{ currentRow.operUrl }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求方式">{{ currentRow.requestMethod }}</ElDescriptionsItem>
        <ElDescriptionsItem label="操作方法" :span="2">{{ currentRow.method }}</ElDescriptionsItem>
        <ElDescriptionsItem label="请求参数" :span="2">
          <pre class="log-pre">{{ currentRow.operParam }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="返回参数" :span="2">
          <pre class="log-pre">{{ currentRow.jsonResult }}</pre>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="操作状态">
          <ArtDictTag :dict-type="DICT_TYPE.COMMON_STATUS" :value="currentRow.status" />
        </ElDescriptionsItem>
        <ElDescriptionsItem label="消耗时间">{{ currentRow.costTime }}毫秒</ElDescriptionsItem>
        <ElDescriptionsItem label="操作时间">{{ currentRow.operTime }}</ElDescriptionsItem>
        <ElDescriptionsItem v-if="currentRow.status === 1 || currentRow.status === '1'" label="异常信息">
          {{ currentRow.errorMsg }}
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
  import { fetchCleanOperlog, fetchDeleteOperlog, fetchGetOperlogList } from '@/api/monitor'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Operlog' })

  type OperlogListItem = Api.Monitor.OperlogListItem

  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<OperlogListItem> | null>(null)
  const detailVisible = ref(false)
  const currentRow = ref<OperlogListItem>()

  const columns: ProTableColumn<OperlogListItem, Api.Monitor.OperlogSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'operId', label: '日志编号', width: 100 },
    {
      prop: 'title',
      label: '系统模块',
      minWidth: 140,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.title as string
    },
    {
      prop: 'businessType',
      label: '操作类型',
      width: 120,
      dictType: DICT_TYPE.OPER_TYPE,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'operName',
      label: '操作人员',
      minWidth: 130,
      search: true,
      sortable: 'custom',
      showOverflowTooltip: true,
      formatter: (row) => row.operName as string
    },
    {
      prop: 'operIp',
      label: '操作地址',
      minWidth: 140,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.operIp as string
    },
    {
      prop: 'status',
      label: '操作状态',
      width: 110,
      dictType: DICT_TYPE.COMMON_STATUS,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'operTimeRange',
      label: '操作时间',
      hideInTable: true,
      search: {
        type: 'daterange',
        label: '操作时间',
        props: {
          valueFormat: 'YYYY-MM-DD HH:mm:ss',
          startPlaceholder: '开始日期',
          endPlaceholder: '结束日期',
          defaultTime: [
            new Date(2000, 1, 1, 0, 0, 0),
            new Date(2000, 1, 1, 23, 59, 59)
          ]
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
      prop: 'operTime',
      label: '操作日期',
      minWidth: 170,
      sortable: 'custom',
      formatter: (row) => row.operTime as string
    },
    {
      prop: 'costTime',
      label: '消耗时间',
      width: 110,
      sortable: 'custom',
      formatter: (row) => `${row.costTime}毫秒`
    },
    {
      prop: 'operation',
      label: '操作',
      width: 90,
      fixed: 'right',
      align: 'right',
      cellRender: (row) => {
        if (!hasAuth('monitor:operlog:query')) return ''
        return h('div', { style: 'text-align: right' }, [
          h(ArtButtonTable, { type: 'view', onClick: () => openDetail(row) })
        ])
      }
    }
  ]

  const openDetail = (row: OperlogListItem) => {
    currentRow.value = row
    detailVisible.value = true
  }

  const getSelectedIds = () =>
    (proTableRef.value?.selectedRows ?? [])
      .map((item) => item.operId)
      .filter((operId): operId is number => typeof operId === 'number')

  const deleteOperlog = async () => {
    const ids = getSelectedIds()
    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的操作日志')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除日志编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteOperlog(ids)
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const cleanOperlog = async () => {
    try {
      await ElMessageBox.confirm('确认清空所有操作日志数据吗？', '清空确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchCleanOperlog()
      ElMessage.success('清空成功')
      await proTableRef.value?.refreshData()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }
</script>

<style scoped>
  .log-pre {
    max-height: 180px;
    margin: 0;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: var(--el-font-family);
  }
</style>
