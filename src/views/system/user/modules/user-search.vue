<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :showExpand="false"
    @reset="handleReset"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
  import { DICT_TYPE } from '@/types'

  interface Props {
    modelValue: Record<string, any>
  }

  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  const searchBarRef = ref()

  const formData = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const formItems = computed(() => [
    {
      label: '用户名称',
      key: 'userName',
      type: 'input',
      props: {
        clearable: true,
        placeholder: '请输入用户名称'
      }
    },
    {
      label: '手机号码',
      key: 'phonenumber',
      type: 'input',
      props: {
        clearable: true,
        placeholder: '请输入手机号码',
        maxlength: 11
      }
    },
    {
      label: '状态',
      key: 'status',
      type: 'dict-select',
      props: {
        dictType: DICT_TYPE.NORMAL_DISABLE,
        clearable: true,
        placeholder: '请选择状态'
      }
    }
  ])

  const handleReset = () => {
    emit('reset')
  }

  const handleSearch = async () => {
    await searchBarRef.value?.validate?.()
    emit('search', formData.value)
  }
</script>
