<template>
  <div class="dept-page art-full-height">
    <ArtSearchBar
      v-model="searchForm"
      :items="searchItems"
      :showExpand="false"
      @reset="handleReset"
      @search="loadDeptList"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableToolbar
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="loadDeptList"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'system:dept:add'" @click="openAddDialog()" v-ripple>
              新增部门
            </ElButton>
            <ElButton @click="toggleExpand" v-ripple>{{ isExpanded ? '收起' : '展开' }}</ElButton>
          </ElSpace>
        </template>
      </ArtTableToolbar>

      <ArtTable
        :key="tableKey"
        rowKey="deptId"
        :loading="loading"
        :data="deptList"
        :columns="columns"
        :stripe="false"
        :default-expand-all="isExpanded"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      />
    </ElCard>

    <ElDialog
      :model-value="dialogVisible"
      :title="dialogMode === 'add' ? '新增部门' : '编辑部门'"
      width="620px"
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
  import ArtDictTag from '@/components/core/display/art-dict-tag/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { useAuth } from '@/hooks/core/useAuth'
  import { DICT_TYPE } from '@/types'
  import { ElMessageBox, type FormRules } from 'element-plus'
  import {
    fetchAddDept,
    fetchDeleteDept,
    fetchGetDeptDetail,
    fetchGetDeptList,
    fetchGetDeptListExcludeChild,
    fetchUpdateDept
  } from '@/api/system-manage'

  defineOptions({ name: 'Dept' })

  type DeptListItem = Api.SystemManage.DeptListItem
  type DialogMode = 'add' | 'edit'

  const { hasAuth } = useAuth()

  const loading = ref(false)
  const formLoading = ref(false)
  const submitLoading = ref(false)
  const dialogVisible = ref(false)
  const dialogMode = ref<DialogMode>('add')
  const tableKey = ref(0)
  const isExpanded = ref(true)
  const deptList = ref<DeptListItem[]>([])
  const deptOptions = ref<DeptListItem[]>([])
  const formRef = ref<InstanceType<typeof ArtForm>>()

  const searchForm = reactive<Api.SystemManage.DeptQueryParams>({
    deptName: undefined,
    status: undefined
  })

  const createDefaultForm = (): Api.SystemManage.DeptPayload => ({
    deptId: undefined,
    parentId: undefined,
    deptName: undefined,
    orderNum: 0,
    leader: undefined,
    phone: undefined,
    email: undefined,
    status: '0'
  })

  const form = reactive<Api.SystemManage.DeptPayload>(createDefaultForm())

  const treeProps = {
    value: 'deptId',
    label: 'deptName',
    children: 'children'
  }

  const searchItems = computed(() => [
    {
      label: '部门名称',
      key: 'deptName',
      type: 'input',
      props: { clearable: true, placeholder: '请输入部门名称' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'dict-select',
      props: { dictType: DICT_TYPE.NORMAL_DISABLE, clearable: true, placeholder: '请选择状态' }
    }
  ])

  const rules: FormRules<Api.SystemManage.DeptPayload> = {
    parentId: [{ required: true, message: '上级部门不能为空', trigger: 'change' }],
    deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phone: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'parentId',
      label: '上级部门',
      type: 'treeselect',
      span: 24,
      hidden: form.parentId === 0,
      props: {
        data: deptOptions.value,
        props: treeProps,
        valueKey: 'deptId',
        checkStrictly: true,
        defaultExpandAll: true,
        placeholder: '请选择上级部门'
      }
    },
    {
      key: 'deptName',
      label: '部门名称',
      type: 'input',
      props: {
        placeholder: '请输入部门名称'
      }
    },
    {
      key: 'orderNum',
      label: '显示排序',
      type: 'number',
      props: {
        min: 0,
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'leader',
      label: '负责人',
      type: 'input',
      props: {
        maxlength: 20,
        placeholder: '请输入负责人'
      }
    },
    {
      key: 'phone',
      label: '联系电话',
      type: 'input',
      props: {
        maxlength: 11,
        placeholder: '请输入联系电话'
      }
    },
    {
      key: 'email',
      label: '邮箱',
      type: 'input',
      props: {
        maxlength: 50,
        placeholder: '请输入邮箱'
      }
    },
    {
      key: 'status',
      label: '部门状态',
      type: 'dict-radio-group',
      props: {
        dictType: DICT_TYPE.NORMAL_DISABLE
      }
    }
  ])

  const { columnChecks, columns } = useTableColumns<DeptListItem>(() => [
    {
      prop: 'deptName',
      label: '部门名称',
      minWidth: 240,
      formatter: (row) => row.deptName as string
    },
    {
      prop: 'orderNum',
      label: '排序',
      width: 120,
      formatter: (row) => (row.orderNum !== undefined ? String(row.orderNum) : '-')
    },
    {
      prop: 'status',
      label: '状态',
      width: 120,
      cellRender: (row) =>
        h(ArtDictTag, {
          dictType: DICT_TYPE.NORMAL_DISABLE,
          value: row.status
        })
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
      width: 180,
      fixed: 'right',
      align: 'right',
      cellRender: (row) => {
        const actions = []

        if (hasAuth('system:dept:edit')) {
          actions.push(h(ArtButtonTable, { type: 'edit', onClick: () => openEditDialog(row) }))
        }
        if (hasAuth('system:dept:add')) {
          actions.push(h(ArtButtonTable, { type: 'add', onClick: () => openAddDialog(row) }))
        }
        if (hasAuth('system:dept:remove') && row.parentId !== 0) {
          actions.push(h(ArtButtonTable, { type: 'delete', onClick: () => deleteDept(row) }))
        }

        return actions.length ? h('div', { style: 'text-align: right' }, actions) : '-'
      }
    }
  ])

  const assertDeptList = (list: DeptListItem[]): DeptListItem[] => {
    if (!Array.isArray(list)) {
      throw new Error('部门列表接口返回值不符合约定：应为数组')
    }
    return list
  }

  const buildDeptTree = (list: DeptListItem[]): DeptListItem[] => {
    const nodeMap = new Map<number, DeptListItem>()
    const roots: DeptListItem[] = []

    list.forEach((item) => {
      if (typeof item.deptId !== 'number') {
        throw new Error('部门列表接口返回值不符合约定：deptId 必须为数字')
      }
      nodeMap.set(item.deptId, { ...item, children: [] })
    })

    list.forEach((item) => {
      const node = nodeMap.get(item.deptId!)
      const parentId = item.parentId
      if (typeof parentId === 'number' && parentId !== 0 && nodeMap.has(parentId)) {
        nodeMap.get(parentId)!.children!.push(node!)
      } else {
        roots.push(node!)
      }
    })

    return roots
  }

  const loadDeptList = async () => {
    loading.value = true
    try {
      const list = assertDeptList(await fetchGetDeptList({ ...searchForm }))
      deptList.value = buildDeptTree(list)
    } finally {
      loading.value = false
    }
  }

  const loadDeptOptions = async (excludeDeptId?: number) => {
    const list =
      typeof excludeDeptId === 'number'
        ? await fetchGetDeptListExcludeChild(excludeDeptId)
        : await fetchGetDeptList()
    deptOptions.value = buildDeptTree(assertDeptList(list))
  }

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.ref?.resetFields()
  }

  const openAddDialog = async (row?: DeptListItem) => {
    resetForm()
    dialogMode.value = 'add'
    form.parentId = row?.deptId
    await loadDeptOptions()
    dialogVisible.value = true
  }

  const openEditDialog = async (row: DeptListItem) => {
    if (typeof row.deptId !== 'number') {
      throw new Error('部门ID缺失，无法编辑')
    }

    resetForm()
    dialogMode.value = 'edit'
    dialogVisible.value = true
    formLoading.value = true
    try {
      const [detail] = await Promise.all([fetchGetDeptDetail(row.deptId), loadDeptOptions(row.deptId)])
      Object.assign(form, detail)
    } finally {
      formLoading.value = false
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return
    await formRef.value.validate()

    submitLoading.value = true
    try {
      if (dialogMode.value === 'edit') {
        if (typeof form.deptId !== 'number') {
          throw new Error('更新部门时缺少 deptId')
        }
        await fetchUpdateDept({ ...form })
      } else {
        await fetchAddDept({ ...form })
      }
      ElMessage.success(dialogMode.value === 'edit' ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await loadDeptList()
    } finally {
      submitLoading.value = false
    }
  }

  const deleteDept = async (row: DeptListItem) => {
    if (typeof row.deptId !== 'number') {
      throw new Error('部门ID缺失，无法删除')
    }

    try {
      await ElMessageBox.confirm(`确认删除名称为 "${row.deptName}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteDept(row.deptId)
      ElMessage.success('删除成功')
      await loadDeptList()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }

  const handleReset = async () => {
    Object.assign(searchForm, {
      deptName: undefined,
      status: undefined
    })
    await loadDeptList()
  }

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    tableKey.value += 1
  }

  onMounted(() => {
    loadDeptList()
  })
</script>
