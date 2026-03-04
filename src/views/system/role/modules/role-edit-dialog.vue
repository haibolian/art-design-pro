<template>
  <ElDialog
    :model-value="modelValue"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="640px"
    align-center
    destroy-on-close
    @update:model-value="handleVisibleChange"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="100px" v-loading="formLoading">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称" />
      </ElFormItem>
      <ElFormItem label="权限字符" prop="roleKey">
        <ElInput v-model="form.roleKey" placeholder="请输入权限字符" />
      </ElFormItem>
      <ElFormItem label="角色顺序" prop="roleSort">
        <ElInputNumber v-model="form.roleSort" :min="0" controls-position="right" style="width: 100%" />
      </ElFormItem>
      <ElFormItem label="状态" prop="status">
        <ElRadioGroup v-model="form.status">
          <ElRadio value="0">正常</ElRadio>
          <ElRadio value="1">停用</ElRadio>
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="菜单权限">
        <ElSpace wrap style="margin-bottom: 10px">
          <ElCheckbox
            v-model="menuExpand"
            @change="(value) => handleCheckedTreeExpand(Boolean(value))"
          >
            展开/折叠
          </ElCheckbox>
          <ElCheckbox
            v-model="menuNodeAll"
            @change="(value) => handleCheckedTreeNodeAll(Boolean(value))"
          >
            全选/全不选
          </ElCheckbox>
          <ElCheckbox v-model="form.menuCheckStrictly">父子联动</ElCheckbox>
        </ElSpace>
        <ElTree
          ref="menuRef"
          class="tree-border"
          style="width: 100%"
          :data="menuOptions"
          show-checkbox
          node-key="id"
          :check-strictly="!form.menuCheckStrictly"
          :props="treeProps"
          empty-text="暂无菜单数据"
        />
      </ElFormItem>
      <ElFormItem label="备注">
        <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleCancel">取消</ElButton>
      <ElButton type="primary" :loading="submitLoading" @click="handleSubmit">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import {
    fetchAddRole,
    fetchGetMenuTree,
    fetchGetRoleDetail,
    fetchGetRoleMenuTree,
    fetchUpdateRole
  } from '@/api/system-manage'

  type RoleListItem = Api.SystemManage.RoleListItem

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  interface RoleFormData {
    roleId?: number
    roleName: string
    roleKey: string
    roleSort: number
    status: '0' | '1'
    menuCheckStrictly: boolean
    menuIds: number[]
    remark: string
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const menuRef = ref()
  const formLoading = ref(false)
  const submitLoading = ref(false)
  const menuOptions = ref<Api.SystemManage.TreeSelectNode[]>([])
  const menuExpand = ref(false)
  const menuNodeAll = ref(false)

  const treeProps = {
    label: 'label',
    children: 'children'
  }

  const createDefaultForm = (): RoleFormData => ({
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    menuCheckStrictly: true,
    menuIds: [],
    remark: ''
  })

  const form = reactive<RoleFormData>(createDefaultForm())

  const rules: FormRules<RoleFormData> = {
    roleName: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
  }

  const resetFormData = (): void => {
    Object.assign(form, createDefaultForm())
    menuExpand.value = false
    menuNodeAll.value = false
    menuOptions.value = []
  }

  const setCheckedMenuKeys = async (checkedKeys: number[]): Promise<void> => {
    await nextTick()
    if (!menuRef.value) return
    menuRef.value.setCheckedKeys([])
    checkedKeys.forEach((key) => {
      menuRef.value.setChecked(key, true, false)
    })
  }

  const initAddForm = async () => {
    menuOptions.value = await fetchGetMenuTree()
  }

  const initEditForm = async (roleId: number) => {
    const [roleDetail, roleMenu] = await Promise.all([
      fetchGetRoleDetail(roleId),
      fetchGetRoleMenuTree(roleId)
    ])

    Object.assign(form, {
      roleId: roleDetail.roleId,
      roleName: roleDetail.roleName || '',
      roleKey: roleDetail.roleKey || roleDetail.roleCode || '',
      roleSort: Number(roleDetail.roleSort ?? 0),
      status: (roleDetail.status || '0') as '0' | '1',
      menuCheckStrictly: roleDetail.menuCheckStrictly ?? true,
      remark: roleDetail.remark || ''
    })

    menuOptions.value = roleMenu.menus || []
    await setCheckedMenuKeys(roleMenu.checkedKeys || [])
  }

  const initForm = async () => {
    formLoading.value = true
    try {
      resetFormData()
      if (props.dialogType === 'add') {
        await initAddForm()
        return
      }

      const roleId = props.roleData?.roleId
      if (!roleId) {
        throw new Error('编辑角色时缺少 roleId')
      }
      await initEditForm(roleId)
    } finally {
      formLoading.value = false
    }
  }

  const getAllCheckedMenuKeys = (): number[] => {
    if (!menuRef.value) return []
    const checkedKeys = menuRef.value.getCheckedKeys() as number[]
    const halfCheckedKeys = menuRef.value.getHalfCheckedKeys() as number[]
    return [...new Set([...checkedKeys, ...halfCheckedKeys])]
  }

  const buildPayload = (): Api.SystemManage.RolePayload => {
    const payload: Api.SystemManage.RolePayload = {
      roleId: form.roleId,
      roleName: form.roleName.trim(),
      roleKey: form.roleKey.trim(),
      roleSort: form.roleSort,
      status: form.status,
      remark: form.remark.trim() || undefined,
      menuCheckStrictly: form.menuCheckStrictly,
      menuIds: getAllCheckedMenuKeys()
    }

    if (props.dialogType === 'edit' && typeof payload.roleId !== 'number') {
      throw new Error('更新角色时缺少 roleId')
    }

    return payload
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true
    try {
      const payload = buildPayload()
      if (props.dialogType === 'add') {
        await fetchAddRole(payload)
      } else {
        await fetchUpdateRole(payload)
      }
      ElMessage.success(props.dialogType === 'add' ? '新增成功' : '修改成功')
      emit('success')
      emit('update:modelValue', false)
    } finally {
      submitLoading.value = false
    }
  }

  const handleCheckedTreeExpand = (value: boolean) => {
    if (!menuRef.value) return
    const nodeMap = menuRef.value.store?.nodesMap || {}
    Object.values(nodeMap).forEach((node: any) => {
      node.expanded = value
    })
  }

  const handleCheckedTreeNodeAll = (value: boolean) => {
    if (!menuRef.value) return
    menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
  }

  const handleCancel = () => {
    emit('update:modelValue', false)
  }

  const handleVisibleChange = (value: boolean) => {
    emit('update:modelValue', value)
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    resetFormData()
  }

  watch(
    () => props.modelValue,
    async (visible) => {
      if (!visible) return
      await initForm()
    }
  )
</script>
