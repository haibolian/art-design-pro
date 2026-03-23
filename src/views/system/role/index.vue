<template>
  <div class="art-full-height">
    <RoleSearch v-model="searchForm" @search="handleSearch" @reset="resetSearchParams" />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'system:role:add'" @click="showDialog('add')" v-ripple
              >新增角色</ElButton
            >
            <ElButton
              v-auth="'system:role:remove'"
              :disabled="selectedRows.length === 0"
              @click="deleteRole()"
              v-ripple
            >
              批量删除
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />
    </ElCard>

    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtDictTag from '@/components/core/display/art-dict-tag/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { useAuth } from '@/hooks/core/useAuth'
  import { fetchChangeRoleStatus, fetchDeleteRole, fetchGetRoleList } from '@/api/system-manage'
  import { DICT_TYPE } from '@/types'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import { ElMessageBox, ElSwitch } from 'element-plus'

  defineOptions({ name: 'Role' })

  type RoleListItem = Api.SystemManage.RoleListItem

  const { hasAuth } = useAuth()

  const searchForm = ref({
    roleName: undefined,
    roleKey: undefined,
    status: undefined
  })

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentRoleData = ref<RoleListItem | undefined>(undefined)
  const selectedRows = ref<RoleListItem[]>([])

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetRoleList,
      apiParams: {
        current: 1,
        size: 20,
        ...searchForm.value
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'roleId',
          label: '角色编号',
          width: 100,
          formatter: (row) => row.roleId ?? '-'
        },
        {
          prop: 'roleName',
          label: '角色名称',
          minWidth: 140,
          formatter: (row) => row.roleName || '-'
        },
        {
          prop: 'roleKey',
          label: '权限字符',
          minWidth: 160,
          formatter: (row) => row.roleKey || row.roleCode || '-'
        },
        {
          prop: 'roleSort',
          label: '角色顺序',
          width: 100,
          formatter: (row) => row.roleSort ?? '-'
        },
        {
          prop: 'status',
          label: '状态',
          width: 120,
          formatter: (row) => {
            if (!hasAuth('system:role:edit')) {
              return h(ArtDictTag, {
                dictType: DICT_TYPE.NORMAL_DISABLE,
                value: row.status || '0',
                effect: 'light'
              })
            }

            return h(ElSwitch, {
              modelValue: row.status || '0',
              activeValue: '0',
              inactiveValue: '1',
              disabled: row.roleId === 1,
              'onUpdate:modelValue': (value: string | number | boolean) => {
                void handleStatusChange(row, value as '0' | '1')
              }
            })
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 160,
          formatter: (row) => row.createTime || '-'
        },
        {
          prop: 'operation',
          label: '操作',
          width: 130,
          fixed: 'right',
          formatter: (row) => {
            const actions = []

            if (hasAuth('system:role:edit') && row.roleId !== 1) {
              actions.push(
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => showDialog('edit', row)
                })
              )
            }

            if (hasAuth('system:role:remove') && row.roleId !== 1) {
              actions.push(
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => deleteRole(row)
                })
              )
            }

            if (actions.length === 0) {
              return '-'
            }

            return h('div', actions)
          }
        }
      ]
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  const showDialog = (type: 'add' | 'edit', row?: RoleListItem) => {
    dialogType.value = type
    currentRoleData.value = row
    dialogVisible.value = true
  }

  const deleteRole = async (row?: RoleListItem) => {
    const ids = row?.roleId
      ? [row.roleId]
      : selectedRows.value.map((item) => item.roleId).filter(Boolean)
    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的角色')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确认删除角色编号为 "${ids.join(',')}" 的数据吗？该操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeleteRole(ids as number[])
      ElMessage.success('删除成功')
      await refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const handleStatusChange = async (row: RoleListItem, nextStatus: '0' | '1') => {
    if (!row.roleId) {
      throw new Error('角色ID缺失，无法修改状态')
    }

    const prevStatus = (row.status || '0') as '0' | '1'
    row.status = nextStatus

    const actionText = nextStatus === '0' ? '启用' : '停用'
    try {
      await ElMessageBox.confirm(`确认要${actionText}角色 "${row.roleName}" 吗？`, '状态变更确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchChangeRoleStatus(row.roleId, nextStatus)
      ElMessage.success(`${actionText}成功`)
    } catch (error) {
      row.status = prevStatus
      if (error === 'cancel' || error === 'close') {
        return
      }
      throw error
    }
  }

  const handleDialogSuccess = async () => {
    dialogVisible.value = false
    await refreshData()
  }

  const handleSelectionChange = (selection: RoleListItem[]) => {
    selectedRows.value = selection
  }
</script>
