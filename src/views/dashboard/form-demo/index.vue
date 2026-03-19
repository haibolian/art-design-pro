<template>
  <ElCard shadow="never">
    <template #header>
      <span class="font-bold">基础表单</span>
    </template>

    <ArtForm
      ref="artFormRef"
      v-model="form"
      :items="formItems"
      :span="12"
      label-width="90px"
      @reset="onReset"
      @submit="submit"
    />
  </ElCard>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import ArtForm, { type FormItem } from '@/components/core/forms/art-form/index.vue'
  import { useForm, type FormInstanceLike } from '@/hooks/core/useForm'

  defineOptions({ name: 'FormDemo' })

  interface DemoForm {
    name: string
    type: string
    enabled: boolean
    remark: string
  }

  const artFormRef = useTemplateRef<FormInstanceLike>('artFormRef')
  const submitResult = ref('')

  const formItems: FormItem[] = [
    {
      key: 'name',
      label: '名称',
      type: 'input',
      placeholder: '请输入名称'
    },
    {
      key: 'type',
      label: '类型',
      type: 'select',
      placeholder: '请选择类型',
      options: [
        { label: '设计', value: 'design' },
        { label: '开发', value: 'develop' }
      ]
    },
    {
      key: 'enabled',
      label: '启用',
      type: 'switch'
    },
    {
      key: 'remark',
      label: '备注',
      type: 'input',
      span: 24,
      props: {
        type: 'textarea',
        rows: 4,
        placeholder: '请输入备注'
      }
    }
  ]

  const { form, submit, reset } = useForm<DemoForm>({
    initialValues: {
      name: '',
      type: '',
      enabled: true,
      remark: ''
    },
    formRef: artFormRef,
    onSubmit: async (values) => {
      submitResult.value = `提交数据：${JSON.stringify(values)}`
      ElMessage.success('提交成功')
    }
  })

  const onReset = () => {
    reset()
    submitResult.value = ''
  }
</script>

<style scoped>
  .form-demo-page {
    padding: 16px;
  }
</style>
