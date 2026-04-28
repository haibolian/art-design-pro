<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetDictTypeList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton v-auth="'system:dict:add'" @click="openDialog('add')" v-ripple>
            新增字典
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
            @click="deleteDictType()"
            v-ripple
          >
            删除
          </ElButton>
          <ElButton v-auth="'system:dict:remove'" @click="refreshCache" v-ripple>
            刷新缓存
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog
      :model-value="dialogVisible"
      :title="dialogMode === 'add' ? '新增字典类型' : '编辑字典类型'"
      width="520px"
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
        label-width="100px"
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
  import { ElButton, ElMessageBox, type FormRules } from 'element-plus'
  import {
    fetchAddDictType,
    fetchDeleteDictType,
    fetchGetDictTypeDetail,
    fetchGetDictTypeList,
    fetchRefreshDictCache,
    fetchUpdateDictType
  } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useDictStore } from '@/store/modules/dict'

  defineOptions({ name: 'Dict' })

  type DictTypeListItem = Api.SystemManage.DictTypeListItem
  type DialogMode = 'add' | 'edit'

  const router = useRouter()
  const route = useRoute()
  const dictStore = useDictStore()
  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<DictTypeListItem> | null>(null)
  const formRef = ref<InstanceType<typeof ArtForm>>()
  const dialogVisible = ref(false)
  const dialogMode = ref<DialogMode>('add')
  const formLoading = ref(false)
  const submitLoading = ref(false)

  const createDefaultForm = (): Api.SystemManage.DictTypePayload => ({
    dictId: undefined,
    dictName: undefined,
    dictType: undefined,
    status: '0',
    remark: undefined
  })

  const form = reactive<Api.SystemManage.DictTypePayload>(createDefaultForm())

  const rules: FormRules<Api.SystemManage.DictTypePayload> = {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'dictName',
      label: '字典名称',
      type: 'input',
      props: {
        placeholder: '请输入字典名称'
      }
    },
    {
      key: 'dictType',
      label: '字典类型',
      type: 'input',
      props: {
        placeholder: '请输入字典类型'
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

  const columns: ProTableColumn<DictTypeListItem, Api.SystemManage.DictTypeSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'dictId', label: '字典编号', width: 100 },
    {
      prop: 'dictName',
      label: '字典名称',
      minWidth: 140,
      search: true,
      formatter: (row) => row.dictName as string
    },
    {
      prop: 'dictType',
      label: '字典类型',
      minWidth: 180,
      search: true,
      cellRender: (row) =>
        h(
          ElButton,
          {
            link: true,
            type: 'primary',
            onClick: () => openDictData(row)
          },
          () => row.dictType
        )
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
        if (hasAuth('system:dict:edit')) {
          actions.push(h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }))
        }
        if (hasAuth('system:dict:remove')) {
          actions.push(h(ArtButtonTable, { type: 'delete', onClick: () => deleteDictType(row) }))
        }
        return actions.length ? h('div', { style: 'text-align: right' }, actions) : '-'
      }
    }
  ]

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.ref?.resetFields()
  }

  const ensureDictDataRoute = () => {
    if (router.hasRoute('DictData')) {
      return
    }

    const parentRouteName = route.matched[0]?.name
    if (!parentRouteName) {
      throw new Error('未找到字典管理父级路由，无法注册字典数据路由')
    }

    router.addRoute(parentRouteName, {
      path: 'dict-data/:dictId',
      name: 'DictData',
      component: () => import('./data/index.vue'),
      meta: {
        title: 'menus.system.dictData',
        isHide: true,
        keepAlive: true,
        roles: ['R_SUPER']
      }
    })
  }

  const openDictData = (row: DictTypeListItem) => {
    if (typeof row.dictId !== 'number') {
      throw new Error('字典ID缺失，无法打开字典数据')
    }
    ensureDictDataRoute()
    router.push({ name: 'DictData', params: { dictId: row.dictId } })
  }

  const openDialog = async (mode: DialogMode, row?: DictTypeListItem) => {
    resetForm()
    dialogMode.value = mode
    dialogVisible.value = true

    if (mode === 'edit') {
      if (typeof row?.dictId !== 'number') {
        throw new Error('编辑字典类型时缺少 dictId')
      }
      formLoading.value = true
      try {
        Object.assign(form, await fetchGetDictTypeDetail(row.dictId))
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
        if (typeof form.dictId !== 'number') {
          throw new Error('更新字典类型时缺少 dictId')
        }
        await fetchUpdateDictType({ ...form })
      } else {
        await fetchAddDictType({ ...form })
      }
      dictStore.clearLocalCache()
      ElMessage.success(dialogMode.value === 'edit' ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await proTableRef.value?.refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteDictType = async (row?: DictTypeListItem) => {
    const ids = row?.dictId
      ? [row.dictId]
      : (proTableRef.value?.selectedRows ?? [])
          .map((item: DictTypeListItem) => item.dictId)
          .filter((dictId): dictId is number => typeof dictId === 'number')

    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的字典类型')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除字典编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteDictType(ids as number[])
      dictStore.clearLocalCache()
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const refreshCache = async () => {
    await fetchRefreshDictCache()
    dictStore.clearLocalCache()
    ElMessage.success('刷新成功')
  }
</script>
