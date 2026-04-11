<template>
  <div class="user-page art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetUserList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton v-auth="'system:user:add'" @click="showDialog('add')" v-ripple
            >新增用户</ElButton
          >
          <ElButton
            v-auth="'system:user:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteUser()"
            v-ripple
          >
            批量删除
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <UserDialog
      v-model:visible="dialogVisible"
      :type="dialogType"
      :user-id="currentUserId"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import ArtDictTag from '@/components/core/display/art-dict-tag/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useAuth } from '@/hooks/core/useAuth'
  import {
    fetchChangeUserStatus,
    fetchDeleteUser,
    fetchGetUserList,
    fetchResetUserPwd
  } from '@/api/system-manage'
  import type { ProTableColumn, ProTableExpose } from '@/types/component'
  import { DICT_TYPE } from '@/types'
  import UserDialog from './modules/user-dialog.vue'
  import { ElMessageBox, ElSwitch } from 'element-plus'

  defineOptions({ name: 'User' })

  type UserListItem = Api.SystemManage.UserListItem
  type DialogType = 'add' | 'edit'

  const { hasAuth } = useAuth()

  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentUserId = ref<number | null>(null)
  const proTableRef = ref<ProTableExpose<UserListItem> | null>(null)

  const columns: ProTableColumn<UserListItem, Api.SystemManage.UserSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    {
      prop: 'userName',
      label: '用户名称',
      minWidth: 140,
      search: {
        type: 'input',
        props: {
          clearable: true,
          placeholder: '请输入用户名称'
        }
      },
      formatter: (row) => row.userName || '-'
    },
    {
      prop: 'nickName',
      label: '用户昵称',
      minWidth: 140,
      formatter: (row) => row.nickName || '-'
    },
    {
      prop: 'dept',
      label: '部门',
      minWidth: 160,
      formatter: (row) => row.dept?.deptName || '-'
    },
    {
      prop: 'phonenumber',
      label: '手机号码',
      minWidth: 130,
      search: {
        type: 'input',
        props: {
          clearable: true,
          placeholder: '请输入手机号码',
          maxlength: 11
        }
      },
      formatter: (row) => row.phonenumber || row.userPhone || '-'
    },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      search: {
        type: 'dict-select',
        props: {
          dictType: DICT_TYPE.NORMAL_DISABLE,
          clearable: true,
          placeholder: '请选择状态'
        }
      },
      cellRender: (row) => {
        if (!hasAuth('system:user:edit')) {
          return h(ArtDictTag, {
            dictType: DICT_TYPE.NORMAL_DISABLE,
            value: row.status || '0'
          })
        }

        return h(ElSwitch, {
          modelValue: row.status || '0',
          activeValue: '0',
          inactiveValue: '1',
          disabled: row.userId === 1,
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
      width: 160,
      fixed: 'right',
      cellRender: (row) => {
        const actions = []

        if (hasAuth('system:user:edit') && row.userId !== 1) {
          actions.push(
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => showDialog('edit', row)
            })
          )
        }

        if (hasAuth('system:user:remove') && row.userId !== 1) {
          actions.push(
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => deleteUser(row)
            })
          )
        }

        if (hasAuth('system:user:resetPwd') && row.userId !== 1) {
          actions.push(
            h(ArtButtonTable, {
              type: 'view',
              icon: 'ri:key-line',
              iconClass: 'bg-warning/12 text-warning',
              onClick: () => resetPassword(row)
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

  const showDialog = (type: DialogType, row?: UserListItem): void => {
    dialogType.value = type
    currentUserId.value = row?.userId ?? null
    dialogVisible.value = true
  }

  const deleteUser = async (row?: UserListItem): Promise<void> => {
    const ids = row?.userId
      ? [row.userId]
      : (proTableRef.value?.selectedRows ?? [])
          .map((item: UserListItem) => item.userId)
          .filter(Boolean)

    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的用户')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确认删除用户编号为 "${ids.join(',')}" 的数据吗？该操作不可恢复。`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      await fetchDeleteUser(ids as number[])
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const handleStatusChange = async (row: UserListItem, nextStatus: '0' | '1') => {
    if (!row.userId) {
      throw new Error('用户ID缺失，无法修改状态')
    }

    const prevStatus = (row.status || '0') as '0' | '1'
    row.status = nextStatus

    const actionText = nextStatus === '0' ? '启用' : '停用'
    try {
      await ElMessageBox.confirm(`确认要${actionText}用户 "${row.userName}" 吗？`, '状态变更确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchChangeUserStatus(row.userId, nextStatus)
      ElMessage.success(`${actionText}成功`)
    } catch (error) {
      row.status = prevStatus
      if (error === 'cancel' || error === 'close') {
        return
      }
      throw error
    }
  }

  const resetPassword = async (row: UserListItem) => {
    if (!row.userId) {
      throw new Error('用户ID缺失，无法重置密码')
    }

    try {
      const { value } = await ElMessageBox.prompt(
        `请输入用户 "${row.userName}" 的新密码`,
        '重置密码',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          closeOnClickModal: false,
          inputPattern: /^.{5,20}$/,
          inputErrorMessage: '用户密码长度必须介于 5 和 20 之间',
          inputValidator: (password: string) => {
            if (/<|>|"|'|\||\\/.test(password)) {
              return '不能包含非法字符：< > " \' \\ |'
            }
            return true
          }
        }
      )

      await fetchResetUserPwd(row.userId, value)
      ElMessage.success(`重置成功，新密码为：${value}`)
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return
      }
      throw error
    }
  }

  const handleDialogSuccess = async () => {
    dialogVisible.value = false
    currentUserId.value = null
    await proTableRef.value?.refreshData()
  }
</script>
