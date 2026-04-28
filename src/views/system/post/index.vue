<template>
  <div class="art-full-height">
    <ProTable ref="proTableRef" :request="fetchGetPostList" :columns="columns">
      <template #toolbar-left="{ selectedRows }">
        <ElSpace wrap>
          <ElButton v-auth="'system:post:add'" @click="openDialog('add')" v-ripple>
            新增岗位
          </ElButton>
          <ElButton
            v-auth="'system:post:edit'"
            :disabled="selectedRows.length !== 1"
            @click="openDialog('edit', selectedRows[0])"
            v-ripple
          >
            修改
          </ElButton>
          <ElButton
            v-auth="'system:post:remove'"
            :disabled="selectedRows.length === 0"
            @click="deletePost()"
            v-ripple
          >
            删除
          </ElButton>
        </ElSpace>
      </template>
    </ProTable>

    <ElDialog
      :model-value="dialogVisible"
      :title="dialogMode === 'add' ? '新增岗位' : '编辑岗位'"
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
        :show-reset="false"
        :show-submit="false"
        :span="24"
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
    fetchAddPost,
    fetchDeletePost,
    fetchGetPostDetail,
    fetchGetPostList,
    fetchUpdatePost
  } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Post' })

  type PostListItem = Api.SystemManage.PostListItem
  type DialogMode = 'add' | 'edit'

  const { hasAuth } = useAuth()
  const proTableRef = ref<ProTableExpose<PostListItem> | null>(null)
  const formRef = ref<InstanceType<typeof ArtForm>>()
  const dialogVisible = ref(false)
  const dialogMode = ref<DialogMode>('add')
  const formLoading = ref(false)
  const submitLoading = ref(false)

  const createDefaultForm = (): Api.SystemManage.PostPayload => ({
    postId: undefined,
    postCode: undefined,
    postName: undefined,
    postSort: 0,
    status: '0',
    remark: undefined
  })

  const form = reactive<Api.SystemManage.PostPayload>(createDefaultForm())

  const rules: FormRules<Api.SystemManage.PostPayload> = {
    postName: [{ required: true, message: '岗位名称不能为空', trigger: 'blur' }],
    postCode: [{ required: true, message: '岗位编码不能为空', trigger: 'blur' }],
    postSort: [{ required: true, message: '岗位顺序不能为空', trigger: 'blur' }]
  }

  const formItems = computed<FormItem[]>(() => [
    {
      key: 'postName',
      label: '岗位名称',
      type: 'input',
      props: {
        placeholder: '请输入岗位名称'
      }
    },
    {
      key: 'postCode',
      label: '岗位编码',
      type: 'input',
      props: {
        placeholder: '请输入岗位编码'
      }
    },
    {
      key: 'postSort',
      label: '岗位顺序',
      type: 'number',
      props: {
        min: 0,
        controlsPosition: 'right',
        style: { width: '100%' }
      }
    },
    {
      key: 'status',
      label: '岗位状态',
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

  const columns: ProTableColumn<PostListItem, Api.SystemManage.PostSearchParams>[] = [
    { type: 'selection' },
    { type: 'index', width: 60, label: '序号' },
    { prop: 'postId', label: '岗位编号', width: 100 },
    {
      prop: 'postCode',
      label: '岗位编码',
      minWidth: 140,
      search: true,
      formatter: (row) => row.postCode as string
    },
    {
      prop: 'postName',
      label: '岗位名称',
      minWidth: 140,
      search: true,
      formatter: (row) => row.postName as string
    },
    {
      prop: 'postSort',
      label: '岗位排序',
      width: 100,
      formatter: (row) => (row.postSort !== undefined ? String(row.postSort) : '-')
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
        if (hasAuth('system:post:edit')) {
          actions.push(h(ArtButtonTable, { type: 'edit', onClick: () => openDialog('edit', row) }))
        }
        if (hasAuth('system:post:remove')) {
          actions.push(h(ArtButtonTable, { type: 'delete', onClick: () => deletePost(row) }))
        }
        return actions.length ? h('div', { style: 'text-align: right' }, actions) : '-'
      }
    }
  ]

  const resetForm = () => {
    Object.assign(form, createDefaultForm())
    formRef.value?.ref?.resetFields()
  }

  const openDialog = async (mode: DialogMode, row?: PostListItem) => {
    resetForm()
    dialogMode.value = mode
    dialogVisible.value = true

    if (mode === 'edit') {
      if (typeof row?.postId !== 'number') {
        throw new Error('编辑岗位时缺少 postId')
      }
      formLoading.value = true
      try {
        Object.assign(form, await fetchGetPostDetail(row.postId))
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
        if (typeof form.postId !== 'number') {
          throw new Error('更新岗位时缺少 postId')
        }
        await fetchUpdatePost({ ...form })
      } else {
        await fetchAddPost({ ...form })
      }
      ElMessage.success(dialogMode.value === 'edit' ? '修改成功' : '新增成功')
      dialogVisible.value = false
      await proTableRef.value?.refreshData()
    } finally {
      submitLoading.value = false
    }
  }

  const deletePost = async (row?: PostListItem) => {
    const ids = row?.postId
      ? [row.postId]
      : (proTableRef.value?.selectedRows ?? [])
          .map((item: PostListItem) => item.postId)
          .filter((postId): postId is number => typeof postId === 'number')

    if (ids.length === 0) {
      ElMessage.warning('请先选择需要删除的岗位')
      return
    }

    try {
      await ElMessageBox.confirm(`确认删除岗位编号为 "${ids.join(',')}" 的数据吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeletePost(ids as number[])
      ElMessage.success('删除成功')
      await proTableRef.value?.refreshRemove()
    } catch (error) {
      if (error === 'cancel' || error === 'close') return
      throw error
    }
  }
</script>
