<template>
  <div class="art-dict-field">
    <ElSelect v-model="modelValue" v-bind="attrs" :loading="loading">
      <ElOption
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :value="option.value"
        :disabled="option.status === '1'"
      />

      <template v-for="(_, slotName) in slots" :key="slotName" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps || {}" />
      </template>
    </ElSelect>

    <div v-if="error" class="art-dict-field__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
  import { useAttrs } from 'vue'
  import { useDict } from '@/hooks'
  import type { DictType } from '@/types'

  defineOptions({
    name: 'ArtDictSelect',
    inheritAttrs: false
  })

  interface DictSelectProps {
    dictType: DictType
  }

  type SelectModelValue = string | number | boolean | undefined | Array<string | number>

  const props = defineProps<DictSelectProps>()
  const modelValue = defineModel<SelectModelValue>()
  const attrs = useAttrs()
  const slots = useSlots()
  const { options, loading, error } = useDict(() => props.dictType)
</script>

<style scoped lang="scss">
  .art-dict-field {
    width: 100%;
  }

  .art-dict-field__error {
    margin-top: 4px;
    color: var(--el-color-danger);
    font-size: 12px;
    line-height: 1.4;
  }
</style>
