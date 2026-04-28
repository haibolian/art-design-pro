<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="requestDictDataList" :columns="columns" :immediate="false">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton v-auth="'system:dict:add'" @click="openDialog('add')" v-ripple>
            新增字典数据
          </ElButton>
          <ElButton
            v-auth="'system:dict:edit'"
            :disabled="selectedRows.length !== 1"
            @click="openDialog('edit', selectedRows[0])"
            v-ripple
          >
            修改
          </ElButton>
          <ElButton
            v-auth="'system:dict:remove'"
            :disabled="selectedRows.length === 0"
            @click="deleteDictData()"
            v-ripple
          >
            删除
          </ElButton>
          <ElButton @click="router.push({ name: 'Dict' })" v-ripple>关闭</ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog
      :model-value="dialogVisible"
      :title="dialogMode === 'add' ? '新增字典数据' : '编辑字典数据'"
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
  import { ElMessageBox, ElTag, type FormRules } from 'element-plus'
  import {
    fetchAddDictData,
    fetchDeleteDictData,
    fetchGetDictDataDetail,
    fetchGetDictDataList,
    fetchGetDictTypeDetail,
    fetchUpdateDictData
  } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useDictStore } from '@/store/modules/dict'

  defineOptions({ name: 'DictData' })

  type DictDataListItem = Api.SystemManage.DictDataListItem
  type DialogMode = 'add' | 'edit'

  const route = useRoute()
  const router = useRouter()
  const dictStore = useDictStore()
  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<DictDataListItem> | null>(null)
  const formRef = ref<InstanceType<typeof ArtForm>>()
  const currentDictType = ref<string>()
  const dialogVisible = ref(false)
  const dialogMode = ref<DialogMode>('add')
  const formLoading = ref(false)
  const submitLoading = ref(false)

  const listClassOptions = [
    { value: 'default', label: '默认(default)' },
    { value: 'primary', label: '主要(primary)' },
    { value: 'success', label: '成功(success)' },
    { value: 'info', label: '信息(info)' },
    { value: 'warning', label: '警告(warning)' },
    { value: 'danger', label: '危险(danger)' }
  ]

  const createDefaultForm = (): Api.SystemManage.DictDataPayload => ({
    dictCode: undefined,
    dictLabel: undefined,
    dictValue: undefined,
    dictType: currentDictType.value,
    cssClass: undefined,
    listClass: 'default',
    dictSort: 0,
    status: '0',
    remark: undefined
  })

  const form = reactive<Api.SystemManage.DictDataPayload>(createDefaultForm())

  const rules: FormRules<Api.SystemManage.DictDataPayload> = {
    dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
    dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
    dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'dictType',
      label: '字典类型',
      type: 'input',
      props: {
        disabled: true
      }
    },
    {
      key: 'dictLabel',
      label: '数据标签',
      type: 'input',
      props: {
        placeholder: '请输入数据标签'
      }
    },
    {
      key: 'dictValue',
      label: '数据键值',
      type: 'input',
      props: {
        placeholder: '请输入数据键值'
      }
    },
    {
      key: 'cssClass',
      label: '样式属性',
      type: 'input',
      props: {
        placeholder: '请输入样式属性'
      }
    },
    {
      key: 'dictSort',
      label: '显示排序',
      type: 'number',
      props: {
        min: 0,
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'listClass',
      label: '回显样式',
      type: 'select',
      props: {
        placeholder: '请选择回显样式',
        options: listClassOptions
      }
    },
    {
      key: 'status',
      label: '状态',
      type: 'dict-radio-group',
      props: {
        dictType: DICT_TYPE.NORMAL_DISABLE
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

  const columns: ProTableColumn<DictDataListItem, Api.SystemManage.DictDataSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'dictCode', label: '字典编码', width: 100 },
    {
      prop: 'dictLabel',
      label: '字典标签',
      minWidth: 140,
      search: true,
      cellRender: (row) => {
        if (!row.listClass || row.listClass === 'default') {
          return h('span', row.dictLabel as any)
        }
        return h(ElTag, { type: row.listClass as any }, () => row.dictLabel)
      }
    },
    {
      prop: 'dictValue',
      label: '字典键值',
      minWidth: 120,
      formatter: (row) => row.dictValue as string
    },
    {
      prop: 'dictSort',
      label: '字典排序',
      width: 100,
      formatter: (row) => (row.dictSort !== undefined ? String(row.dictSort) : '-')
    },
    {
      prop: 'status',
      label: '状态',
      width: 110,
      dictType: DICT_TYPE.NORMAL_DISABLE,
      valueType: 'dict-tag',
      search: true
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
        if (hasAuth('system:dict:edit')) {
          actions.push(h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }))
        }
        if (hasAuth('system:dict:remove')) {
          actions.push(h(ArtButtonTable, { type: 'delete', onClick: () => deleteDictData(row) }))
        }
        return actions.length ? h('div', { style: 'text-align: right' }, actions) : '-'
      }
    }
  ]

  const requestDictDataList = (params: Api.SystemManage.DictDataSearchParams) => {
    if (!currentDictType.value) {
      throw new Error('字典类型缺失，无法查询字典数据')
    }
    return fetchGetDictDataList({
      ...params,
      dictType: currentDictType.value
    })
  }

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.ref?.resetFields()
  }

  const invalidateCurrentDict = () => {
    if (!currentDictType.value) {
      throw new Error('字典类型缺失，无法刷新字典缓存')
    }
    dictStore.invalidate(currentDictType.value)
  }

  const openDialog = async (mode: DialogMode, row?: DictDataListItem) => {
    resetForm()
    dialogMode.value = mode
    dialogVisible.value = true

    if (mode === 'edit') {
      if (typeof row?.dictCode !== 'number') {
        throw new Error('编辑字典数据时缺少 dictCode')
      }
      formLoading.value = true
      try {
        Object.assign(form, await fetchGetDictDataDetail(row.dictCode))
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
        if (typeof form.dictCode !== 'number') {
          throw new Error('更新字典数据时缺少 dictCode')
        }
        await fetchUpdateDictData({ ...form })
      } else {
        await fetchAddDictData({ ...form })
      }
      invalidateCurrentDict()
      ElMessage.success(dialogMode.value === 'edit' ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await proTableRef.value?.refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteDictData = async (row?: DictDataListItem) => {
    const ids = row?.dictCode
      ? [row.dictCode]
      : (proTableRef.value?.selectedRows ?? [])
          .map((item: DictDataListItem) => item.dictCode)
          .filter((dictCode): dictCode is number => typeof dictCode === 'number')

    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的字典数据')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除字典编码为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteDictData(ids as number[])
      invalidateCurrentDict()
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const initPage = async () => {
    const dictId = Number(route.params.dictId)
    if (!Number.isFinite(dictId)) {
      throw new Error('路由参数 dictId 不符合约定')
    }
    const detail = await fetchGetDictTypeDetail(dictId)
    currentDictType.value = detail.dictType
    await proTableRef.value?.getData()
  }

  onMounted(() => {
    initPage()
  })
</script>
