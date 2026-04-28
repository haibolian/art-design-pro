<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetLogininforList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton
            v-auth="'monitor:logininfor:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteLogininfor()"
            v-ripple
          >
            删除
          </ElButton>
          <ElButton v-auth="'monitor:logininfor:remove'" @click="cleanLogininfor" v-ripple>
            清空
          </ElButton>
          <ElButton
            v-auth="'monitor:logininfor:unlock'"
            :disabled="selectedRows.length !== 1"
            @click="unlockLogininfor(selectedRows[0])"
            v-ripple
          >
            解锁
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { DICT_TYPE } from '@/types'
  import type { ProTableColumn, ProTableExpose } from '@/types/component'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchCleanLogininfor,
    fetchDeleteLogininfor,
    fetchGetLogininforList,
    fetchUnlockLogininfor
  } from '@/api/monitor'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Logininfor' })

  type LogininforListItem = Api.Monitor.LogininforListItem

  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<LogininforListItem> | null>(null)

  const columns: ProTableColumn<LogininforListItem, Api.Monitor.LogininforSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'infoId', label: '访问编号', width: 100 },
    {
      prop: 'userName',
      label: '用户名称',
      minWidth: 140,
      search: true,
      sortable: 'custom',
      showOverflowTooltip: true,
      formatter: (row) => row.userName as string
    },
    {
      prop: 'ipaddr',
      label: '登录地址',
      minWidth: 140,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.ipaddr as string
    },
    {
      prop: 'loginLocation',
      label: '登录地点',
      minWidth: 140,
      showOverflowTooltip: true,
      formatter: (row) => row.loginLocation as string
    },
    {
      prop: 'os',
      label: '操作系统',
      minWidth: 140,
      showOverflowTooltip: true,
      formatter: (row) => row.os as string
    },
    {
      prop: 'browser',
      label: '浏览器',
      minWidth: 140,
      showOverflowTooltip: true,
      formatter: (row) => row.browser as string
    },
    {
      prop: 'status',
      label: '登录状态',
      width: 110,
      dictType: DICT_TYPE.COMMON_STATUS,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'loginTimeRange',
      label: '登录时间',
      hideInTable: true,
      search: {
        type: 'daterange',
        label: '登录时间',
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
      prop: 'msg',
      label: '描述',
      minWidth: 180,
      showOverflowTooltip: true,
      formatter: (row) => row.msg as string
    },
    {
      prop: 'loginTime',
      label: '访问时间',
      minWidth: 170,
      sortable: 'custom',
      formatter: (row) => row.loginTime as string
    },
    {
      prop: 'operation',
      label: '操作',
      width: 90,
      fixed: 'right',
      align: 'right',
      cellRender: (row) => {
        if (!hasAuth('monitor:logininfor:remove')) return ''
        return h('div', { style: 'text-align: right' }, [
          h(ArtButtonTable, { type: 'delete', onClick: () => deleteLogininfor(row) })
        ])
      }
    }
  ]

  const getSelectedIds = () =>
    (proTableRef.value?.selectedRows ?? [])
      .map((item) => item.infoId)
      .filter((infoId): infoId is number => typeof infoId === 'number')

  const deleteLogininfor = async (row?: LogininforListItem) => {
    const ids = row?.infoId ? [row.infoId] : getSelectedIds()
    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的登录日志')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除访问编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteLogininfor(ids)
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const cleanLogininfor = async () => {
    try {
      await ElMessageBox.confirm('确认清空所有登录日志数据吗？', '清空确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchCleanLogininfor()
      ElMessage.success('清空成功')
      await proTableRef.value?.refreshData()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const unlockLogininfor = async (row?: LogininforListItem) => {
    if (!row?.userName) {
      throw new Error('解锁用户时缺少 userName')
    }

    try {
      await ElMessageBox.confirm(`确认解锁用户 "${row.userName}" 吗？`, '解锁确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchUnlockLogininfor(row.userName)
      ElMessage.success(`用户 ${row.userName} 解锁成功`)
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }
</script>
