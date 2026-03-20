<template>
  <div class="art-dict-field">
    <ElCheckboxGroup v-model="modelValue" v-bind="attrs">
      <ElCheckbox
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.status === '1'"
      >
        {{ option.label }}
      </ElCheckbox>
    </ElCheckboxGroup>

    <div v-if="loading" class="art-dict-field__status">字典加载中...</div>
    <div v-if="error" class="art-dict-field__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
  import { useAttrs } from 'vue'
  import { useDict } from '@/hooks'
  import type { DictType } from '@/types'

  defineOptions({
    name: 'ArtDictCheckboxGroup',
    inheritAttrs: false
  })

  interface DictCheckboxGroupProps {
    dictType: DictType
  }

  type CheckboxModelValue = Array<string | number>

  const props = defineProps<DictCheckboxGroupProps>()
  const modelValue = defineModel<CheckboxModelValue>({ default: [] })
  const attrs = useAttrs()
  const { options, loading, error } = useDict(() => props.dictType)
</script>

<style scoped lang="scss">
  .art-dict-field {
    width: 100%;
  }

  .art-dict-field__status,
  .art-dict-field__error {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
  }

  .art-dict-field__status {
    color: var(--el-text-color-secondary);
  }

  .art-dict-field__error {
    color: var(--el-color-danger);
  }
</style>
