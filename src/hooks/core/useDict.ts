import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useDictStore } from '@/store/modules/dict'
import type { DictOption, DictType, DictValue } from '@/types'

function normalizeType(dictType: DictType): string {
  const normalized = String(dictType || '').trim()
  if (!normalized) {
    throw new Error('[useDict] dictType 不能为空')
  }
  return normalized
}

export function useDict(dictType: MaybeRefOrGetter<DictType>) {
  const dictStore = useDictStore()
  const resolvedType = computed(() => normalizeType(toValue(dictType)))

  const options = computed<DictOption[]>(() => dictStore.getOptions(resolvedType.value))
  const loading = computed(() => dictStore.isLoading(resolvedType.value))
  const error = computed(() => dictStore.getError(resolvedType.value))
  const ready = computed(() => dictStore.hasLoaded(resolvedType.value))

  const ensure = async () => dictStore.ensure(resolvedType.value)

  const getOption = (value: DictValue): DictOption | undefined => {
    return dictStore.getOption(resolvedType.value, value)
  }

  const getLabel = (value: DictValue): string | undefined => {
    return dictStore.getLabel(resolvedType.value, value)
  }

  const clearLocalCache = () => {
    dictStore.clearLocalCache()
  }

  watch(
    resolvedType,
    async (currentDictType) => {
      await dictStore.ensure(currentDictType)
    },
    { immediate: true }
  )

  return {
    options,
    loading,
    error,
    ready,
    ensure,
    getOption,
    getLabel,
    clearLocalCache
  }
}
