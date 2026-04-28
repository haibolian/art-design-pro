<template>
  <div class="online-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :showExpand="false"
      @reset="handleReset"
      @search="loadOnlineList"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableToolbar :loading="loading" v-model:columns="columnChecks" @refresh="loadOnlineList" />

      <ArtTable
        :loading="loading"
        :data="pagedList"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import type { SearchFormItem } from '@/types/component'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchForceLogout, fetchGetOnlineList } from '@/api/monitor'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Online' })

  type OnlineListItem = Api.Monitor.OnlineListItem

  const { hasAuth } = useAuth()
  const loading = ref(false)
  const onlineList = ref<OnlineListItem[]>([])
  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const searchForm = reactive<Api.Monitor.OnlineSearchParams>({
    ipaddr: undefined,
    userName: undefined
  })

  const searchItems: SearchFormItem[] = [
    {
      key: 'ipaddr',
      label: '登录地址',
      type: 'input',
      props: { placeholder: '请输入登录地址', clearable: true }
    },
    {
      key: 'userName',
      label: '用户名称',
      type: 'input',
      props: { placeholder: '请输入用户名称', clearable: true }
    }
  ]

  const { columnChecks, columns } = useTableColumns<OnlineListItem>(() => [
    { type: 'globalIndex', width: 70, label: '序号' },
    {
      prop: 'tokenId',
      label: '会话编号',
      minWidth: 220,
      showOverflowTooltip: true,
      formatter: (row) => row.tokenId as string
    },
    {
      prop: 'userName',
      label: '登录名称',
      minWidth: 130,
      showOverflowTooltip: true,
      formatter: (row) => row.userName as string
    },
    {
      prop: 'deptName',
      label: '所属部门',
      minWidth: 130,
      showOverflowTooltip: true,
      formatter: (row) => row.deptName as string
    },
    {
      prop: 'ipaddr',
      label: '主机',
      minWidth: 140,
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
      prop: 'loginTime',
      label: '登录时间',
      minWidth: 170,
      formatter: (row) => row.loginTime as string
    },
    {
      prop: 'operation',
      label: '操作',
      width: 90,
      fixed: 'right',
      align: 'right',
      cellRender: (row) => {
        if (!hasAuth('monitor:online:forceLogout')) return ''
        return h('div', { style: 'text-align: right' }, [
          h(ArtButtonTable, {
            type: 'delete',
            onClick: () => forceLogout(row)
          })
        ])
      }
    }
  ])

  const pagedList = computed(() => {
    const start = (pagination.current - 1) * pagination.size
    return onlineList.value.slice(start, start + pagination.size)
  })

  const loadOnlineList = async () => {
    loading.value = true
    try {
      const response = await fetchGetOnlineList({ ...searchForm })
      if (!Array.isArray(response.rows)) {
        throw new Error('在线用户列表接口缺少 rows')
      }
      onlineList.value = response.rows
      pagination.total = response.total
      pagination.current = 1
    } finally {
      loading.value = false
    }
  }

  const handleReset = async () => {
    Object.assign(searchForm, {
      ipaddr: undefined,
      userName: undefined
    })
    await loadOnlineList()
  }

  const handleSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
  }

  const forceLogout = async (row: OnlineListItem) => {
    if (!row.tokenId) {
      throw new Error('强退用户时缺少 tokenId')
    }

    try {
      await ElMessageBox.confirm(`确认强退名称为 "${row.userName}" 的用户吗？`, '强退确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchForceLogout(row.tokenId)
      ElMessage.success('强退成功')
      await loadOnlineList()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  loadOnlineList()
</script>
