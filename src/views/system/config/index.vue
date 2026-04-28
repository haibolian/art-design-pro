<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetConfigList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton v-auth="'system:config:add'" @click="openDialog('add')" v-ripple>
            新增参数
          </ElButton>
          <ElButton
            v-auth="'system:config:edit'"
            :disabled="selectedRows.length !== 1"
            @click="openDialog('edit', selectedRows[0])"
            v-ripple
          >
            修改
          </ElButton>
          <ElButton
            v-auth="'system:config:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteConfig()"
            v-ripple
          >
            删除
          </ElButton>
          <ElButton v-auth="'system:config:remove'" @click="refreshCache" v-ripple>
            刷新缓存
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog
      :model-value="dialogVisible"
      :title="dialogMode === 'add' ? '新增参数' : '编辑参数'"
      width="540px"
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
        :span="24"
        :show-reset="false"
        :show-submit="false"
        label-width="90px"
        v-loading="formLoading"
      />

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
  import { DICT_TYPE } from '@/types'
  import type { ProTableColumn, ProTableExpose } from '@/types/component'
  import { ElMessageBox, type FormRules } from 'element-plus'
  import {
    fetchAddConfig,
    fetchDeleteConfig,
    fetchGetConfigDetail,
    fetchGetConfigList,
    fetchRefreshConfigCache,
    fetchUpdateConfig
  } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Config' })

  type ConfigListItem = Api.SystemManage.ConfigListItem
  type DialogMode = 'add' | 'edit'

  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<ConfigListItem> | null>(null)
  const formRef = ref<InstanceType<typeof ArtForm>>()
  const dialogVisible = ref(false)
  const dialogMode = ref<DialogMode>('add')
  const formLoading = ref(false)
  const submitLoading = ref(false)

  const createDefaultForm = (): Api.SystemManage.ConfigPayload => ({
    configId: undefined,
    configName: undefined,
    configKey: undefined,
    configValue: undefined,
    configType: 'Y',
    remark: undefined
  })

  const form = reactive<Api.SystemManage.ConfigPayload>(createDefaultForm())

  const rules: FormRules<Api.SystemManage.ConfigPayload> = {
    configName: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
    configKey: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
    configValue: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'configName',
      label: '参数名称',
      type: 'input',
      props: {
        placeholder: '请输入参数名称'
      }
    },
    {
      key: 'configKey',
      label: '参数键名',
      type: 'input',
      props: {
        placeholder: '请输入参数键名'
      }
    },
    {
      key: 'configValue',
      label: '参数键值',
      type: 'input',
      props: {
        type: 'textarea',
        rows: 3,
        placeholder: '请输入参数键值'
      }
    },
    {
      key: 'configType',
      label: '系统内置',
      type: 'dict-radio-group',
      props: {
        dictType: DICT_TYPE.YES_NO
      }
    },
    {
      key: 'remark',
      label: '备注',
      type: 'input',
      props: {
        type: 'textarea',
        rows: 3,
        placeholder: '请输入内容'
      }
    }
  ])

  const columns: ProTableColumn<ConfigListItem, Api.SystemManage.ConfigSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'configId', label: '参数主键', width: 100 },
    {
      prop: 'configName',
      label: '参数名称',
      minWidth: 150,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.configName as string
    },
    {
      prop: 'configKey',
      label: '参数键名',
      minWidth: 180,
      search: true,
      showOverflowTooltip: true,
      formatter: (row) => row.configKey as string
    },
    {
      prop: 'configValue',
      label: '参数键值',
      minWidth: 180,
      showOverflowTooltip: true,
      formatter: (row) => row.configValue as string
    },
    {
      prop: 'configType',
      label: '系统内置',
      width: 120,
      dictType: DICT_TYPE.YES_NO,
      valueType: 'dict-tag',
      search: true
    },
    {
      prop: 'createTimeRange',
      label: '创建时间',
      hideInTable: true,
      search: {
        type: 'daterange',
        label: '创建时间',
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
      prop: 'remark',
      label: '备注',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row) => row.remark as string
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
        if (hasAuth('system:config:edit')) {
          actions.push(h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }))
        }
        if (hasAuth('system:config:remove')) {
          actions.push(h(ArtButtonTable, { type: 'delete', onClick: () => deleteConfig(row) }))
        }
        return actions.length ? h('div', { style: 'text-align: right' }, actions) : '-'
      }
    }
  ]

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.ref?.resetFields()
  }

  const openDialog = async (mode: DialogMode, row?: ConfigListItem) => {
    resetForm()
    dialogMode.value = mode
    dialogVisible.value = true

    if (mode === 'edit') {
      if (typeof row?.configId !== 'number') {
        throw new Error('编辑参数时缺少 configId')
      }
      formLoading.value = true
      try {
        Object.assign(form, await fetchGetConfigDetail(row.configId))
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
        if (typeof form.configId !== 'number') {
          throw new Error('更新参数时缺少 configId')
        }
        await fetchUpdateConfig({ ...form })
      } else {
        await fetchAddConfig({ ...form })
      }
      ElMessage.success(dialogMode.value === 'edit' ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await proTableRef.value?.refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteConfig = async (row?: ConfigListItem) => {
    const ids = row?.configId
      ? [row.configId]
      : (proTableRef.value?.selectedRows ?? [])
          .map((item: ConfigListItem) => item.configId)
          .filter((configId): configId is number => typeof configId === 'number')

    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的参数')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除参数编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteConfig(ids as number[])
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const refreshCache = async () => {
    await fetchRefreshConfigCache()
    ElMessage.success('刷新缓存成功')
  }
</script>
