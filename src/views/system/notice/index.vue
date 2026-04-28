<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetNoticeList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton v-auth="'system:notice:add'" @click="openDialog('add')" v-ripple>
            新增公告
          </ElButton>
          <ElButton
            v-auth="'system:notice:edit'"
            :disabled="selectedRows.length !== 1"
            @click="openDialog('edit', selectedRows[0])"
            v-ripple
          >
            修改
          </ElButton>
          <ElButton
            v-auth="'system:notice:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteNotice()"
            v-ripple
          >
            删除
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog
      :model-value="dialogVisible"
      :title="dialogMode === 'add' ? '新增公告' : '编辑公告'"
      width="820px"
      align-center
      destroy-on-close
      @update:model-value="dialogVisible = $event"
      @closed="resetForm"
    >
      <ArtForm
        ref="formRef"
        v-model="form"
        :items="formItems"
        :rules="rules"
        :span="12"
        :show-reset="false"
        :show-submit="false"
        label-width="90px"
        v-loading="formLoading"
      >
        <template #noticeContent>
          <ArtWangEditor v-model="noticeContentModel" height="260px" mode="simple" />
        </template>
      </ArtForm>

      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import ArtWangEditor from '@/components/core/forms/art-wang-editor/index.vue'
  import { DICT_TYPE } from '@/types'
  import type { ProTableColumn, ProTableExpose } from '@/types/component'
  import { ElMessageBox, type FormRules } from 'element-plus'
  import {
    fetchAddNotice,
    fetchDeleteNotice,
    fetchGetNoticeDetail,
    fetchGetNoticeList,
    fetchUpdateNotice
  } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Notice' })

  type NoticeListItem = Api.SystemManage.NoticeListItem
  type DialogMode = 'add' | 'edit'

  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<NoticeListItem> | null>(null)
  const formRef = ref<InstanceType<typeof ArtForm>>()
  const dialogVisible = ref(false)
  const dialogMode = ref<DialogMode>('add')
  const formLoading = ref(false)
  const submitLoading = ref(false)

  const createDefaultForm = (): Api.SystemManage.NoticePayload => ({
    noticeId: undefined,
    noticeTitle: undefined,
    noticeType: undefined,
    noticeContent: '',
    status: '0'
  })

  const form = reactive<Api.SystemManage.NoticePayload>(createDefaultForm())

  const noticeContentModel = computed({
    get: () => form.noticeContent as string,
    set: (value: string) => {
      form.noticeContent = value
    }
  })

  const rules: FormRules<Api.SystemManage.NoticePayload> = {
    noticeTitle: [{ required: true, message: '公告标题不能为空', trigger: 'blur' }],
    noticeType: [{ required: true, message: '公告类型不能为空', trigger: 'change' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'noticeTitle',
      label: '公告标题',
      type: 'input',
      props: {
        placeholder: '请输入公告标题'
      }
    },
    {
      key: 'noticeType',
      label: '公告类型',
      type: 'dict-select',
      props: {
        dictType: DICT_TYPE.NOTICE_TYPE,
        placeholder: '请选择公告类型'
      }
    },
    {
      key: 'status',
      label: '状态',
      type: 'dict-radio-group',
      span: 24,
      props: {
        dictType: DICT_TYPE.NOTICE_STATUS
      }
    },
    {
      key: 'noticeContent',
      label: '内容',
      type: 'input',
      span: 24
    }
  ])

  const columns: ProTableColumn<NoticeListItem, Api.SystemManage.NoticeSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    {
      prop: 'noticeTitle',
      label: '公告标题',
      minWidth: 180,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.noticeTitle as string
    },
    {
      prop: 'noticeType',
      label: '公告类型',
      width: 120,
      dictType: DICT_TYPE.NOTICE_TYPE,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'status',
      label: '状态',
      width: 110,
      dictType: DICT_TYPE.NOTICE_STATUS,
      valueType: 'dict-tag'
    },
    {
      prop: 'createBy',
      label: '创建者',
      width: 120,
      search: true,
      formatter: (row) => row.createBy as string
    },
    {
      prop: 'createTime',
      label: '创建时间',
      minWidth: 170,
      formatter: (row) => row.createTime as string
    },
    {
      prop: 'operation',
      label: '操作',
      width: 120,
      fixed: 'right',
      align: 'right',
      cellRender: (row) => {
        const actions = []
        if (hasAuth('system:notice:edit')) {
          actions.push(h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }))
        }
        if (hasAuth('system:notice:remove')) {
          actions.push(h(ArtButtonTable, { type: 'delete', onClick: () => deleteNotice(row) }))
        }
        return actions.length ? h('div', { style: 'text-align: right' }, actions) : '-'
      }
    }
  ]

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.ref?.resetFields()
  }

  const openDialog = async (mode: DialogMode, row?: NoticeListItem) => {
    resetForm()
    dialogMode.value = mode
    dialogVisible.value = true

    if (mode === 'edit') {
      if (typeof row?.noticeId !== 'number') {
        throw new Error('编辑公告时缺少 noticeId')
      }
      formLoading.value = true
      try {
        Object.assign(form, await fetchGetNoticeDetail(row.noticeId))
      } finally {
        formLoading.value = false
      }
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate()
    submitLoading.value = true
    try {
      if (dialogMode.value === 'edit') {
        if (typeof form.noticeId !== 'number') {
          throw new Error('更新公告时缺少 noticeId')
        }
        await fetchUpdateNotice({ ...form })
      } else {
        await fetchAddNotice({ ...form })
      }
      ElMessage.success(dialogMode.value === 'edit' ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await proTableRef.value?.refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteNotice = async (row?: NoticeListItem) => {
    const ids = row?.noticeId
      ? [row.noticeId]
      : (proTableRef.value?.selectedRows ?? [])
          .map((item: NoticeListItem) => item.noticeId)
          .filter((noticeId): noticeId is number => typeof noticeId === 'number')

    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的公告')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除公告编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteNotice(ids as number[])
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }
</script>
