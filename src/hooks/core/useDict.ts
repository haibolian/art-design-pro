import { computed, onMounted } from 'vue'
import { useDictStore } from '@/store/modules/dict'
import type { DictOption, DictType, DictValue } from '@/types'

function normalizeTypes(dictTypes: DictType[]): string[] {
  if (!Array.isArray(dictTypes) || dictTypes.length === 0) {
    throw new Error('[useDict] 至少需要传入一个 dictType')
  }

  const normalized = dictTypes.map((dictType) => {
    const type = String(dictType || '').trim()
    if (!type) {
      throw new Error('[useDict] dictType 不能为空')
    }
    return type
  })

  return Array.from(new Set(normalized))
}

export function useDict(dictTypes: DictType[]) {
  const dictStore = useDictStore()
  const resolvedTypes = normalizeTypes(dictTypes)

  const dicts = computed<Record<string, DictOption[]>>(() => {
    return Object.fromEntries(
      resolvedTypes.map((dictType) => [dictType, dictStore.getOptions(dictType)])
    )
  })

  const loadingMap = computed<Record<string, boolean>>(() => {
    return Object.fromEntries(
      resolvedTypes.map((dictType) => [dictType, dictStore.isLoading(dictType)])
    )
  })

  const errorMap = computed<Record<string, string | null>>(() => {
    return Object.fromEntries(
      resolvedTypes.map((dictType) => [dictType, dictStore.getError(dictType)])
    )
  })

  const loading = computed(() => resolvedTypes.some((dictType) => dictStore.isLoading(dictType)))
  const ready = computed(() => resolvedTypes.every((dictType) => dictStore.hasLoaded(dictType)))

  const ensure = async () => dictStore.ensureMany(resolvedTypes)

  const getOptions = (dictType: DictType): DictOption[] => dictStore.getOptions(dictType)

  const getLabel = (dictType: DictType, value: DictValue): string | undefined => {
    return dictStore.getLabel(dictType, value)
  }

  const clearLocalCache = () => {
    dictStore.clearLocalCache()
  }

  onMounted(() => {
    void ensure()
  })

  return {
    dicts,
    loading,
    ready,
    loadingMap,
    errorMap,
    ensure,
    getOptions,
    getLabel,
    clearLocalCache
  }
}
