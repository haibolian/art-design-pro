<template>
  <ElDialog
    :title="dialogTitle"
    :model-value="visible"
    width="720px"
    align-center
    destroy-on-close
    @update:model-value="handleVisibleChange"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="formLoading">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="上级菜单" prop="parentId">
            <ElTreeSelect
              v-model="form.parentId"
              :data="menuOptions"
              :props="treeProps"
              value-key="menuId"
              check-strictly
              default-expand-all
              placeholder="请选择上级菜单"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="菜单类型" prop="menuType">
            <ElRadioGroup v-model="form.menuType">
              <ElRadio value="M">目录</ElRadio>
              <ElRadio value="C">菜单</ElRadio>
              <ElRadio value="F">按钮</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType !== 'F'" :span="12">
          <ElFormItem label="菜单图标" prop="icon">
            <ElInput v-model="form.icon" clearable placeholder="请输入图标名称，如 dashboard" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="显示排序" prop="orderNum">
            <ElInputNumber
              v-model="form.orderNum"
              :min="0"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="菜单名称" prop="menuName">
            <ElInput v-model="form.menuName" placeholder="请输入菜单名称" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType === 'C'" :span="12">
          <ElFormItem label="路由名称" prop="routeName">
            <ElInput v-model="form.routeName" clearable placeholder="请输入路由名称" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType !== 'F'" :span="12">
          <ElFormItem label="是否外链" prop="isFrame">
            <ElRadioGroup v-model="form.isFrame">
              <ElRadio value="0">是</ElRadio>
              <ElRadio value="1">否</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType !== 'F'" :span="12">
          <ElFormItem label="路由地址" prop="path">
            <ElInput v-model="form.path" placeholder="请输入路由地址" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType === 'C'" :span="12">
          <ElFormItem label="组件路径" prop="component">
            <ElInput v-model="form.component" placeholder="请输入组件路径（如 system/user/index）" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType !== 'M'" :span="12">
          <ElFormItem label="权限字符" prop="perms">
            <ElInput v-model="form.perms" clearable placeholder="请输入权限字符" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType === 'C'" :span="12">
          <ElFormItem label="路由参数" prop="query">
            <ElInput v-model="form.query" clearable placeholder='请输入路由参数，如 {"id":1}' />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType === 'C'" :span="12">
          <ElFormItem label="是否缓存" prop="isCache">
            <ElRadioGroup v-model="form.isCache">
              <ElRadio value="0">缓存</ElRadio>
              <ElRadio value="1">不缓存</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol v-if="form.menuType !== 'F'" :span="12">
          <ElFormItem label="显示状态" prop="visible">
            <ElRadioGroup v-model="form.visible">
              <ElRadio value="0">显示</ElRadio>
              <ElRadio value="1">隐藏</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="菜单状态" prop="status">
            <ElRadioGroup v-model="form.status">
              <ElRadio value="0">正常</ElRadio>
              <ElRadio value="1">停用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules, FormItemRule } from 'element-plus'
  import { fetchAddMenu, fetchGetMenuDetail, fetchUpdateMenu } from '@/api/system-manage'

  interface MenuTreeOption {
    menuId: number
    menuName: string
    children?: MenuTreeOption[]
  }

  interface MenuFormData {
    menuId?: number
    parentId: number
    menuName: string
    icon: string
    menuType: Api.SystemManage.MenuType
    orderNum: number
    isFrame: '0' | '1'
    isCache: '0' | '1'
    visible: '0' | '1'
    status: '0' | '1'
    path: string
    component: string
    query: string
    perms: string
    routeName: string
  }

  interface Props {
    visible: boolean
    mode: 'add' | 'edit'
    menuId: number | null
    parentId: number
    menuOptions: MenuTreeOption[]
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    mode: 'add',
    menuId: null,
    parentId: 0,
    menuOptions: () => []
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const formLoading = ref(false)
  const submitLoading = ref(false)

  const treeProps = {
    value: 'menuId',
    label: 'menuName',
    children: 'children'
  }

  const createDefaultForm = (): MenuFormData => ({
    menuId: undefined,
    parentId: 0,
    menuName: '',
    icon: '',
    menuType: 'M',
    orderNum: 0,
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    path: '',
    component: '',
    query: '',
    perms: '',
    routeName: ''
  })

  const form = reactive<MenuFormData>(createDefaultForm())

  const validatePath: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
    const current = typeof value === 'string' ? value : ''
    if (form.menuType === 'F') {
      callback()
      return
    }
    if (!current || !current.trim()) {
      callback(new Error('路由地址不能为空'))
      return
    }
    callback()
  }

  const validateComponent: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
    const current = typeof value === 'string' ? value : ''
    if (form.menuType !== 'C') {
      callback()
      return
    }
    if (!current || !current.trim()) {
      callback(new Error('组件路径不能为空'))
      return
    }
    callback()
  }

  const validatePerms: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
    const current = typeof value === 'string' ? value : ''
    if (form.menuType === 'M') {
      callback()
      return
    }
    if (!current || !current.trim()) {
      callback(new Error('权限字符不能为空'))
      return
    }
    callback()
  }

  const rules: FormRules<MenuFormData> = {
    menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    path: [{ validator: validatePath, trigger: 'blur' }],
    component: [{ validator: validateComponent, trigger: 'blur' }],
    perms: [{ validator: validatePerms, trigger: 'blur' }]
  }

  const dialogTitle = computed(() => (props.mode === 'edit' ? '编辑菜单' : '新增菜单'))

  const normalizeText = (value: string): string | undefined => {
    const text = value.trim()
    return text ? text : undefined
  }

  const resetFormData = (): void => {
    Object.assign(form, createDefaultForm())
  }

  const loadEditData = async (menuId: number): Promise<void> => {
    formLoading.value = true
    try {
      const data = await fetchGetMenuDetail(menuId)
      Object.assign(form, {
        menuId: data.menuId,
        parentId: data.parentId ?? 0,
        menuName: data.menuName ?? '',
        icon: data.icon ?? '',
        menuType: data.menuType ?? 'M',
        orderNum: data.orderNum ?? 0,
        isFrame: data.isFrame ?? '1',
        isCache: data.isCache ?? '0',
        visible: data.visible ?? '0',
        status: data.status ?? '0',
        path: data.path ?? '',
        component: data.component ?? '',
        query: data.query ?? '',
        perms: data.perms ?? '',
        routeName: data.routeName ?? ''
      })
    } finally {
      formLoading.value = false
    }
  }

  const initializeForm = async (): Promise<void> => {
    resetFormData()

    if (props.mode === 'add') {
      form.parentId = props.parentId ?? 0
      return
    }

    if (props.menuId === null) {
      throw new Error('编辑菜单时缺少 menuId')
    }

    await loadEditData(props.menuId)
  }

  const buildPayload = (): Api.SystemManage.MenuPayload => {
    const payload: Api.SystemManage.MenuPayload = {
      menuId: form.menuId,
      parentId: form.parentId,
      menuName: form.menuName.trim(),
      icon: form.menuType === 'F' ? undefined : normalizeText(form.icon),
      menuType: form.menuType,
      orderNum: form.orderNum,
      isFrame: form.menuType === 'F' ? '1' : form.isFrame,
      isCache: form.menuType === 'C' ? form.isCache : '1',
      visible: form.menuType === 'F' ? '0' : form.visible,
      status: form.status,
      path: form.menuType === 'F' ? undefined : normalizeText(form.path),
      component: form.menuType === 'C' ? normalizeText(form.component) : undefined,
      query: form.menuType === 'C' ? normalizeText(form.query) : undefined,
      perms: form.menuType === 'M' ? undefined : normalizeText(form.perms),
      routeName: form.menuType === 'C' ? normalizeText(form.routeName) : undefined
    }

    return payload
  }

  const handleSubmit = async (): Promise<void> => {
    if (!formRef.value) {
      return
    }

    await formRef.value.validate()
    submitLoading.value = true

    try {
      const payload = buildPayload()
      if (props.mode === 'edit') {
        if (typeof payload.menuId !== 'number') {
          throw new Error('更新菜单时缺少 menuId')
        }
        await fetchUpdateMenu(payload)
      } else {
        await fetchAddMenu(payload)
      }

      ElMessage.success(props.mode === 'edit' ? '修改成功' : '新增成功')
      emit('success')
      emit('update:visible', false)
    } finally {
      submitLoading.value = false
    }
  }

  const handleCancel = (): void => {
    emit('update:visible', false)
  }

  const handleVisibleChange = (value: boolean): void => {
    emit('update:visible', value)
  }

  const handleClosed = (): void => {
    formRef.value?.resetFields()
    resetFormData()
  }

  watch(
    () => props.visible,
    async (visible) => {
      if (!visible) {
        return
      }
      await initializeForm()
    }
  )

  watch(
    () => form.menuType,
    (menuType) => {
      if (menuType === 'M') {
        form.perms = ''
        form.component = ''
        form.query = ''
        form.routeName = ''
      } else if (menuType === 'F') {
        form.icon = ''
        form.path = ''
        form.component = ''
        form.query = ''
        form.routeName = ''
        form.isFrame = '1'
        form.isCache = '1'
        form.visible = '0'
      }
    }
  )
</script>
