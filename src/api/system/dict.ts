import request from '@/utils/http'
import type { DictDataItem, DictType } from '@/types'

/**
 * 根据字典类型获取字典数据
 */
export function fetchGetDictDataByType(dictType: DictType) {
  const type = String(dictType || '').trim()
  if (!type) {
    throw new Error('[DictAPI] dictType 不能为空')
  }

  return request.get<DictDataItem[]>({
    url: `/system/dict/data/type/${encodeURIComponent(type)}`
  })
}
