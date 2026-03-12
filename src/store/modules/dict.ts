import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StorageConfig } from '@/utils/storage'
import { fetchGetDictDataByType } from '@/api/system/dict'
import type { DictDataItem, DictOption, DictType, DictValue } from '@/types'

const inFlightRequests = new Map<string, Promise<DictOption[]>>()

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

function normalizeDictType(dictType: DictType): string {
  const normalized = String(dictType || '').trim()
  if (!normalized) {
    throw new Error('[DictStore] dictType 不能为空')
  }
  return normalized
}

function normalizeDictItem(dictType: string, item: DictDataItem): DictOption {
  if (item.dictLabel === undefined || item.dictLabel === null) {
    throw new Error(`[DictStore] 字典 ${dictType} 的 dictLabel 不能为空`)
  }

  if (item.dictValue === undefined || item.dictValue === null) {
    throw new Error(`[DictStore] 字典 ${dictType} 的 dictValue 不能为空`)
  }

  return {
    label: String(item.dictLabel),
    value: String(item.dictValue),
    elTagType: item.listClass,
    elTagClass: item.cssClass,
    status: item.status,
    raw: item
  }
}

export const useDictStore = defineStore(
  'dictStore',
  () => {
    const cacheMap = ref<Record<string, DictOption[]>>({})
    const loadingMap = ref<Record<string, boolean>>({})
    const errorMap = ref<Record<string, string | null>>({})

    const hasLoaded = (dictType: DictType): boolean => {
      const type = normalizeDictType(dictType)
      return Object.prototype.hasOwnProperty.call(cacheMap.value, type)
    }

    const isLoading = (dictType: DictType): boolean => {
      const type = normalizeDictType(dictType)
      return Boolean(loadingMap.value[type])
    }

    const getError = (dictType: DictType): string | null => {
      const type = normalizeDictType(dictType)
      return errorMap.value[type] ?? null
    }

    const getOptions = (dictType: DictType): DictOption[] => {
      const type = normalizeDictType(dictType)
      return cacheMap.value[type] ?? []
    }

    const getOption = (dictType: DictType, value: DictValue): DictOption | undefined => {
      if (value === null || value === undefined) {
        return undefined
      }

      const targetValue = String(value)
      return getOptions(dictType).find((option) => option.value === targetValue)
    }

    const getLabel = (dictType: DictType, value: DictValue): string | undefined => {
      return getOption(dictType, value)?.label
    }

    const fetchAndCache = async (dictType: string): Promise<DictOption[]> => {
      loadingMap.value[dictType] = true
      errorMap.value[dictType] = null

      try {
        const dictData = await fetchGetDictDataByType(dictType)
        const options = dictData.map((item) => normalizeDictItem(dictType, item))
        cacheMap.value[dictType] = options
        return options
      } catch (error) {
        errorMap.value[dictType] = getErrorMessage(error)
        throw error
      } finally {
        loadingMap.value[dictType] = false
      }
    }

    const ensure = async (dictType: DictType): Promise<DictOption[]> => {
      const type = normalizeDictType(dictType)

      if (hasLoaded(type)) {
        return getOptions(type)
      }

      const inFlight = inFlightRequests.get(type)
      if (inFlight) {
        return inFlight
      }

      const requestPromise = fetchAndCache(type).finally(() => {
        inFlightRequests.delete(type)
      })

      inFlightRequests.set(type, requestPromise)
      return requestPromise
    }

    const ensureMany = async (dictTypes: DictType[]): Promise<Record<string, DictOption[]>> => {
      if (!Array.isArray(dictTypes) || dictTypes.length === 0) {
        throw new Error('[DictStore] ensureMany 需要至少一个 dictType')
      }

      const uniqueTypes = Array.from(
        new Set(dictTypes.map((dictType) => normalizeDictType(dictType)))
      )
      const results = await Promise.all(
        uniqueTypes.map(async (dictType) => {
          const dictOptions = await ensure(dictType)
          return [dictType, dictOptions] as const
        })
      )

      return Object.fromEntries(results)
    }

    const invalidate = (dictType: DictType): void => {
      const type = normalizeDictType(dictType)
      delete cacheMap.value[type]
      delete loadingMap.value[type]
      delete errorMap.value[type]
      inFlightRequests.delete(type)
    }

    const clearLocalCache = (): void => {
      cacheMap.value = {}
      loadingMap.value = {}
      errorMap.value = {}
      inFlightRequests.clear()

      const storageKeys = Object.keys(localStorage)
      const matchers = [
        StorageConfig.createKeyPattern('dict'),
        StorageConfig.createKeyPattern('dictStore')
      ]

      storageKeys.forEach((key) => {
        if (matchers.some((pattern) => pattern.test(key))) {
          localStorage.removeItem(key)
        }
      })

      localStorage.removeItem('dict')
      localStorage.removeItem('dictStore')
    }

    return {
      cacheMap,
      loadingMap,
      errorMap,
      hasLoaded,
      isLoading,
      getError,
      getOptions,
      getOption,
      getLabel,
      ensure,
      ensureMany,
      invalidate,
      clearLocalCache
    }
  },
  {
    persist: {
      key: 'dict',
      storage: localStorage,
      pick: ['cacheMap']
    }
  }
)
