<template>
  <ElDialog
    :model-value="visible"
    :title="dialogTitle"
    width="720px"
    align-center
    destroy-on-close
    @update:model-value="handleVisibleChange"
    @closed="handleClosed"
  >
    <ElForm ref="formRef" :model="form" :rules="rules" label-width="90px" v-loading="formLoading">
      <ElRow :gutter="16">
        <ElCol :span="12">
          <ElFormItem label="用户昵称" prop="nickName">
            <ElInput v-model="form.nickName" placeholder="请输入用户昵称" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="归属部门" prop="deptId">
            <ElTreeSelect
              v-model="form.deptId"
              :data="deptOptions"
              :props="treeProps"
              value-key="id"
              check-strictly
              clearable
              default-expand-all
              placeholder="请选择归属部门"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="手机号码" prop="phonenumber">
            <ElInput v-model="form.phonenumber" maxlength="11" placeholder="请输入手机号码" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="邮箱" prop="email">
            <ElInput v-model="form.email" placeholder="请输入邮箱" />
          </ElFormItem>
        </ElCol>

        <ElCol v-if="type === 'add'" :span="12">
          <ElFormItem label="用户名称" prop="userName">
            <ElInput v-model="form.userName" maxlength="30" placeholder="请输入用户名称" />
          </ElFormItem>
        </ElCol>
        <ElCol v-if="type === 'add'" :span="12">
          <ElFormItem label="用户密码" prop="password">
            <ElInput
              v-model="form.password"
              type="password"
              show-password
              maxlength="20"
              placeholder="请输入用户密码"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="用户性别" prop="sex">
            <ElSelect v-model="form.sex" placeholder="请选择">
              <ElOption label="男" value="0" />
              <ElOption label="女" value="1" />
              <ElOption label="未知" value="2" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElRadioGroup v-model="form.status">
              <ElRadio value="0">正常</ElRadio>
              <ElRadio value="1">停用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="岗位" prop="postIds">
            <ElSelect v-model="form.postIds" multiple collapse-tags placeholder="请选择岗位">
              <ElOption
                v-for="item in validPostOptions"
                :key="item.postId"
                :label="item.postName || ''"
                :value="item.postId"
                :disabled="item.status === '1'"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="角色" prop="roleIds">
            <ElSelect v-model="form.roleIds" multiple collapse-tags placeholder="请选择角色">
              <ElOption
                v-for="item in validRoleOptions"
                :key="item.roleId"
                :label="item.roleName || ''"
                :value="item.roleId"
                :disabled="item.status === '1'"
              />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="备注" prop="remark">
            <ElInput v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
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
  import type { FormInstance, FormItemRule, FormRules } from 'element-plus'
  import {
    fetchAddUser,
    fetchGetDeptTree,
    fetchGetUserDetail,
    fetchUpdateUser
  } from '@/api/system-manage'

  interface Props {
    visible: boolean
    type: 'add' | 'edit'
    userId?: number | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  interface UserFormData {
    userId?: number
    deptId?: number
    userName: string
    nickName: string
    password: string
    phonenumber: string
    email: string
    sex: '0' | '1' | '2'
    status: '0' | '1'
    postIds: number[]
    roleIds: number[]
    remark: string
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    type: 'add',
    userId: null
  })
  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const formLoading = ref(false)
  const submitLoading = ref(false)
  const deptOptions = ref<Api.SystemManage.TreeSelectNode[]>([])
  const postOptions = ref<Api.SystemManage.PostItem[]>([])
  const roleOptions = ref<Api.SystemManage.RoleOption[]>([])

  const treeProps = {
    value: 'id',
    label: 'label',
    children: 'children'
  }

  const validPostOptions = computed(() =>
    postOptions.value.filter(
      (item): item is Api.SystemManage.PostItem & { postId: number } =>
        typeof item.postId === 'number'
    )
  )

  const validRoleOptions = computed(() =>
    roleOptions.value.filter(
      (item): item is Api.SystemManage.RoleOption & { roleId: number } =>
        typeof item.roleId === 'number'
    )
  )

  const createDefaultForm = (): UserFormData => ({
    userId: undefined,
    deptId: undefined,
    userName: '',
    nickName: '',
    password: '',
    phonenumber: '',
    email: '',
    sex: '0',
    status: '0',
    postIds: [],
    roleIds: [],
    remark: ''
  })

  const form = reactive<UserFormData>(createDefaultForm())

  const validateUserName: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
    if (props.type !== 'add') {
      callback()
      return
    }
    const current = typeof value === 'string' ? value.trim() : ''
    if (!current) {
      callback(new Error('用户名称不能为空'))
      return
    }
    callback()
  }

  const validatePassword: NonNullable<FormItemRule['validator']> = (_rule, value, callback) => {
    if (props.type !== 'add') {
      callback()
      return
    }
    const current = typeof value === 'string' ? value : ''
    if (!current) {
      callback(new Error('用户密码不能为空'))
      return
    }
    if (current.length < 5 || current.length > 20) {
      callback(new Error('用户密码长度必须介于 5 和 20 之间'))
      return
    }
    callback()
  }

  const rules: FormRules<UserFormData> = {
    userName: [{ validator: validateUserName, trigger: 'blur' }],
    nickName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    email: [{ type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
    phonenumber: [
      {
        pattern: /^1[3-9]\d{9}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  }

  const dialogTitle = computed(() => (props.type === 'add' ? '新增用户' : '编辑用户'))

  const normalizeText = (value: string): string | undefined => {
    const text = value.trim()
    return text ? text : undefined
  }

  const resetFormData = () => {
    Object.assign(form, createDefaultForm())
  }

  const loadBaseOptions = async () => {
    const [deptTree, userMeta] = await Promise.all([fetchGetDeptTree(), fetchGetUserDetail()])
    deptOptions.value = deptTree || []
    postOptions.value = userMeta.posts || []
    roleOptions.value = userMeta.roles || []
  }

  const loadEditData = async (userId: number) => {
    const userDetail = await fetchGetUserDetail(userId)
    postOptions.value = userDetail.posts || postOptions.value
    roleOptions.value = userDetail.roles || roleOptions.value

    const user = userDetail.data || {}
    Object.assign(form, {
      userId: user.userId,
      deptId: user.deptId,
      userName: user.userName || '',
      nickName: user.nickName || '',
      password: '',
      phonenumber: user.phonenumber || user.userPhone || '',
      email: user.email || user.userEmail || '',
      sex: (user.sex || '0') as '0' | '1' | '2',
      status: (user.status || '0') as '0' | '1',
      postIds: Array.isArray(userDetail.postIds) ? userDetail.postIds : [],
      roleIds: Array.isArray(userDetail.roleIds) ? userDetail.roleIds : [],
      remark: user.remark || ''
    })
  }

  const initForm = async () => {
    formLoading.value = true
    try {
      resetFormData()
      await loadBaseOptions()

      if (props.type === 'edit') {
        if (typeof props.userId !== 'number') {
          throw new Error('编辑用户时缺少 userId')
        }
        await loadEditData(props.userId)
      }
    } finally {
      formLoading.value = false
    }
  }

  const buildPayload = (): Api.SystemManage.UserPayload => {
    const payload: Api.SystemManage.UserPayload = {
      userId: form.userId,
      deptId: form.deptId,
      userName: normalizeText(form.userName),
      nickName: form.nickName.trim(),
      password: props.type === 'add' ? form.password : undefined,
      phonenumber: normalizeText(form.phonenumber),
      email: normalizeText(form.email),
      sex: form.sex,
      status: form.status,
      postIds: form.postIds,
      roleIds: form.roleIds,
      remark: normalizeText(form.remark)
    }

    if (props.type === 'edit' && typeof form.userId !== 'number') {
      throw new Error('更新用户时缺少 userId')
    }

    return payload
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate()
    submitLoading.value = true
    try {
      const payload = buildPayload()
      if (props.type === 'add') {
        await fetchAddUser(payload)
      } else {
        await fetchUpdateUser(payload)
      }
      ElMessage.success(props.type === 'add' ? '新增成功' : '修改成功')
      emit('success')
      emit('update:visible', false)
    } finally {
      submitLoading.value = false
    }
  }

  const handleCancel = () => {
    emit('update:visible', false)
  }

  const handleVisibleChange = (value: boolean) => {
    emit('update:visible', value)
  }

  const handleClosed = () => {
    formRef.value?.resetFields()
    resetFormData()
  }

  watch(
    () => props.visible,
    async (visible) => {
      if (!visible) return
      await initForm()
    }
  )
</script>
