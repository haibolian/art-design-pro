import { h } from 'vue'
import ArtDictTag from '@/components/core/display/art-dict-tag/index.vue'
import type {
  ColumnOption,
  ProTableColumn,
  ProTableSearchConfig,
  SearchFormItem
} from '@/types/component'

/**
 * ProTable 把 columns 视为唯一配置源，并从中派生出：
 * 1. 搜索项元数据
 * 2. 真实传给 ArtTable 的列配置
 * 3. 搜索模型提交时的请求参数
 */
export interface SearchableColumnMeta {
  column: ProTableColumn
  config: ProTableSearchConfig
  searchKey: string
  item: SearchFormItem
  order: number
}

const MULTI_VALUE_TYPES = new Set([
  'checkboxgroup',
  'dict-checkbox-group',
  'inputTag',
  'daterange',
  'datetimerange',
  'monthrange',
  'yearrange',
  'timerange',
  'cascader'
])

const DICT_SEARCH_TYPES = new Set(['dict-select', 'dict-radio-group', 'dict-checkbox-group'])

export const cloneValue = <T>(value: T): T => {
  if (value == null || typeof value !== 'object') {
    return value
  }

  if (typeof structuredClone === 'function') {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

const getSearchConfig = (column: ProTableColumn) => {
  if (!column.search || column.hideInSearch) {
    return null
  }

  return column.search === true ? {} : column.search
}

const getSearchKey = (column: ProTableColumn, config: ProTableSearchConfig) => {
  return config.key || column.prop
}

const getSearchType = (column: ProTableColumn, config: ProTableSearchConfig) => {
  if (config.type) {
    return config.type
  }

  if (column.dictType) {
    return 'dict-select'
  }

  return 'input'
}

const createSearchItem = (
  column: ProTableColumn,
  config: ProTableSearchConfig,
  searchKey: string
): SearchFormItem => {
  const searchType = getSearchType(column, config)
  const searchProps: Record<string, any> = {
    ...(config.props || {}),
    clearable: config.props?.clearable ?? true
  }

  if (
    column.dictType &&
    DICT_SEARCH_TYPES.has(String(searchType)) &&
    searchProps.dictType === undefined
  ) {
    searchProps.dictType = column.dictType
  }

  return {
    key: searchKey,
    label: config.label || column.label || searchKey,
    type: searchType,
    span: config.span,
    render: config.render,
    props: searchProps,
    slots: config.slots
  }
}

export const getDefaultSearchValue = (config: ProTableSearchConfig) => {
  if (config.defaultValue !== undefined) {
    return cloneValue(config.defaultValue)
  }

  const searchType = config.type
  const isMultiSelect = !!config.props?.multiple
  if (isMultiSelect || (searchType && MULTI_VALUE_TYPES.has(searchType))) {
    return []
  }

  return undefined
}

export const resolveSearchableColumns = (columns: ProTableColumn[]) => {
  const searchableColumns = columns.reduce<SearchableColumnMeta[]>((items, column, index) => {
    const config = getSearchConfig(column)
    if (!config) {
      return items
    }

    const searchKey = getSearchKey(column, config)
    if (!searchKey) {
      console.warn('[ProTable] searchable column requires `prop` or `search.key`.', column)
      return items
    }

    items.push({
      column,
      config,
      searchKey,
      item: createSearchItem(column, config, searchKey),
      order: config.order ?? index
    })

    return items
  }, [])

  searchableColumns.sort((a, b) => a.order - b.order)
  return searchableColumns
}

const resolveDictTagValue = (column: ProTableColumn, row: Record<string, any>) => {
  const customValue = column.dictTag?.value

  if (typeof customValue === 'function') {
    return customValue(row)
  }

  if (customValue !== undefined) {
    return customValue
  }

  return column.prop ? row[column.prop] : undefined
}

const createDictTagCellRender = (column: ProTableColumn) => {
  if (!column.dictType) {
    console.warn('[ProTable] `valueType: "dict-tag"` requires `dictType`.', column)
    return undefined
  }

  const dictType = column.dictType
  const dictTagConfig = column.dictTag

  return (row: Record<string, any>) => {
    const dictTagProps: Record<string, unknown> = {
      dictType,
      value: resolveDictTagValue(column, row)
    }

    if (dictTagConfig?.type !== undefined) {
      dictTagProps.type = dictTagConfig.type
    }
    if (dictTagConfig?.effect !== undefined) {
      dictTagProps.effect = dictTagConfig.effect
    }
    if (dictTagConfig?.separator !== undefined) {
      dictTagProps.separator = dictTagConfig.separator
    }

    return h(ArtDictTag, dictTagProps as any)
  }
}

export const createTableColumns = (columns: ProTableColumn[]): ColumnOption[] => {
  return columns
    .filter((column) => !column.hideInTable)
    .map((column) => {
      const nextColumn = { ...column } as Record<string, any>

      if (!nextColumn.useSlot && !nextColumn.cellRender && nextColumn.valueType === 'dict-tag') {
        nextColumn.cellRender = createDictTagCellRender(column)
      }

      delete nextColumn.hideInSearch
      delete nextColumn.hideInTable
      delete nextColumn.search
      delete nextColumn.valueType
      delete nextColumn.dictType
      delete nextColumn.dictTag
      return nextColumn as ColumnOption
    })
}

export const createInitialSearchModel = (searchableColumns: SearchableColumnMeta[]) => {
  return searchableColumns.reduce<Record<string, any>>((model, { config, searchKey }) => {
    model[searchKey] = getDefaultSearchValue(config)
    return model
  }, {})
}

export const buildSearchParams = (
  searchableColumns: SearchableColumnMeta[],
  searchModel: Record<string, any>
) => {
  return searchableColumns.reduce<Record<string, any>>((params, { config, searchKey }) => {
    const value = searchModel[searchKey]

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return params
    }

    if (config.transform) {
      return {
        ...params,
        ...config.transform(cloneValue(value))
      }
    }

    params[searchKey] = cloneValue(value)
    return params
  }, {})
}

export const resolveTableSlotNames = (columns: ColumnOption[]) => {
  return columns
    .filter((column) => column.useSlot && (column.slotName || column.prop || column.type))
    .map((column) => String(column.slotName || column.prop || column.type))
}

export const resolveTableHeaderSlotNames = (columns: ColumnOption[]) => {
  return columns
    .filter((column) => column.useHeaderSlot && column.prop)
    .map((column) => String(column.headerSlotName || `${column.prop}-header`))
}
