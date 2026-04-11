<template>
  <div class="art-pro-table">
    <ArtSearchBar
      v-if="hasSearch"
      v-show="showSearchBar"
      ref="searchBarRef"
      v-model="searchModel"
      :items="searchBarItems"
      v-bind="mergedSearchBarProps"
      @search="handleSearch"
      @reset="resetSearch"
    >
      <template v-for="item in searchBarItems" :key="item.key" #[item.key]="slotScope">
        <slot :name="item.key" v-bind="slotScope" />
      </template>
    </ArtSearchBar>

    <component :is="props.card ? ElCard : 'div'" class="art-table-card" v-bind="cardWrapperProps">
      <ArtTableHeader
        v-if="showToolbar"
        v-model:columns="columnChecks"
        :loading="loading"
        :show-search-bar="hasSearch ? showSearchBar : undefined"
        v-bind="props.tableHeaderProps"
        @refresh="refreshData"
        @update:show-search-bar="handleSearchBarVisibleChange"
      >
        <template #left>
          <slot name="toolbar-left" v-bind="toolbarSlotScope" />
        </template>

        <template #right>
          <slot name="toolbar-right" v-bind="toolbarSlotScope" />
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        v-bind="mergedTableProps"
        :loading="loading"
        :data="tableData"
        :columns="columns"
        :pagination="pagination"
        :pagination-options="props.paginationOptions"
        :show-table-header="showToolbar"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template v-for="slotName in tableSlotNames" :key="slotName" #[slotName]="slotScope">
          <slot :name="slotName" v-bind="slotScope" />
        </template>

        <template v-for="slotName in tableHeaderSlotNames" :key="slotName" #[slotName]="slotScope">
          <slot :name="slotName" v-bind="slotScope" />
        </template>

        <template v-if="$slots.default" #default>
          <slot />
        </template>
      </ArtTable>
    </component>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref, watch } from 'vue'
  import { ElCard, type TableProps } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import type { ApiResponse, TableError } from '@/hooks/core/useTable'
  import type {
    ColumnOption,
    ProTableColumn,
    ProTableSearchConfig,
    SearchFormItem
  } from '@/types/component'

  defineOptions({ name: 'ProTable' })

  interface ProTableProps {
    request: (params: Record<string, any>) => Promise<any>
    columns: ProTableColumn[] | (() => ProTableColumn[])
    rowKey?: string
    immediate?: boolean
    toolbar?: boolean
    card?: boolean
    showSearch?: boolean
    searchBarProps?: Record<string, any>
    tableHeaderProps?: Record<string, any>
    tableProps?: Partial<TableProps<Record<string, any>>>
    paginationOptions?: Record<string, any>
    useTableOptions?: {
      apiParams?: Record<string, any>
      excludeParams?: string[]
      paginationKey?: {
        current?: string
        size?: string
      }
      debounceTime?: number
      responseAdapter?: (response: any) => ApiResponse<any>
      dataTransformer?: (data: any[]) => any[]
      onSuccess?: (data: any[], response: ApiResponse<any>) => void
      onError?: (error: TableError) => void
      enableLog?: boolean
    }
  }

  interface SearchableColumnMeta {
    column: ProTableColumn
    config: ProTableSearchConfig
    searchKey: string
    item: SearchFormItem
    order: number
  }

  const props = withDefaults(defineProps<ProTableProps>(), {
    immediate: true,
    toolbar: true,
    card: true,
    showSearch: true,
    searchBarProps: () => ({}),
    tableHeaderProps: () => ({}),
    tableProps: () => ({}),
    paginationOptions: () => ({}),
    useTableOptions: () => ({})
  })

  const searchBarRef = ref<{ validate?: () => Promise<unknown> } | null>(null)
  const tableRef = ref<any>(null)
  const selectedRows = ref<any[]>([])

  const resolveColumns = () => {
    const source = typeof props.columns === 'function' ? props.columns() : props.columns
    return source.map((column) => ({ ...column }))
  }

  const sourceColumns = resolveColumns()

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

  const getSearchConfig = (column: ProTableColumn) => {
    if (!column.search || column.hideInSearch) {
      return null
    }

    return column.search === true ? {} : column.search
  }

  const getSearchKey = (column: ProTableColumn, config: ProTableSearchConfig) => {
    return config.key || column.prop
  }

  const cloneValue = <T,>(value: T): T => {
    if (value == null || typeof value !== 'object') {
      return value
    }

    if (typeof structuredClone === 'function') {
      return structuredClone(value)
    }

    return JSON.parse(JSON.stringify(value)) as T
  }

  const getDefaultSearchValue = (config: ProTableSearchConfig) => {
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

  const searchableColumns = sourceColumns.reduce<SearchableColumnMeta[]>((items, column, index) => {
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
      item: {
        key: searchKey,
        label: config.label || column.label || searchKey,
        type: config.type || 'input',
        span: config.span,
        render: config.render,
        props: config.props,
        slots: config.slots
      },
      order: config.order ?? index
    })

    return items
  }, [])

  searchableColumns.sort((a, b) => a.order - b.order)

  const tableColumnsSource = () =>
    sourceColumns
      .filter((column) => !column.hideInTable)
      .map((column) => {
        const nextColumn = { ...column } as Record<string, any>
        delete nextColumn.hideInSearch
        delete nextColumn.hideInTable
        delete nextColumn.search
        return nextColumn as ColumnOption
      })

  const createInitialSearchModel = () => {
    return searchableColumns.reduce<Record<string, any>>((model, { config, searchKey }) => {
      model[searchKey] = getDefaultSearchValue(config)
      return model
    }, {})
  }

  const searchModelState = reactive<Record<string, any>>(createInitialSearchModel())
  const searchModel = computed({
    get: () => searchModelState,
    set: (value: Record<string, any>) => {
      Object.keys(searchModelState).forEach((key) => {
        searchModelState[key] = value?.[key]
      })
    }
  })

  const isSearchValueEmpty = (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return true
    }

    return Array.isArray(value) && value.length === 0
  }

  const buildSearchParams = () => {
    return searchableColumns.reduce<Record<string, any>>((params, { config, searchKey }) => {
      const value = searchModelState[searchKey]

      if (isSearchValueEmpty(value)) {
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

  const currentSearchParams = ref<Record<string, any>>(buildSearchParams())

  const requestProxy = (params: Record<string, any>) => {
    return props.request({
      ...currentSearchParams.value,
      ...params
    })
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData: rawGetData,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: requestProxy,
      apiParams: props.useTableOptions.apiParams,
      excludeParams: props.useTableOptions.excludeParams,
      immediate: props.immediate,
      columnsSource: tableColumnsSource,
      paginationKey: props.useTableOptions.paginationKey
    },
    transform: {
      dataTransformer: props.useTableOptions.dataTransformer,
      responseAdapter: props.useTableOptions.responseAdapter
    },
    performance: {
      debounceTime: props.useTableOptions.debounceTime
    },
    hooks: {
      onSuccess: props.useTableOptions.onSuccess,
      onError: props.useTableOptions.onError
    },
    debug: {
      enableLog: props.useTableOptions.enableLog
    }
  })

  const mergedSearchBarProps = computed(() => ({
    showExpand: false,
    ...props.searchBarProps
  }))

  const mergedTableProps = computed(() => ({
    ...props.tableProps,
    ...(props.rowKey ? { rowKey: props.rowKey } : {})
  }))

  const showToolbar = computed(() => props.toolbar)
  const hasSearch = computed(() => props.showSearch && searchableColumns.length > 0)
  const showSearchBar = ref(hasSearch.value)

  const searchBarItems = computed(() => searchableColumns.map(({ item }) => item))
  const tableData = computed(() => data.value as Record<string, any>[])
  const tableSlotNames = computed(() =>
    tableColumnsSource()
      .filter((column) => column.useSlot && (column.slotName || column.prop || column.type))
      .map((column) => String(column.slotName || column.prop || column.type))
  )
  const tableHeaderSlotNames = computed(() =>
    tableColumnsSource()
      .filter((column) => column.useHeaderSlot && column.prop)
      .map((column) => String(column.headerSlotName || `${column.prop}-header`))
  )
  const cardWrapperProps = computed(() => (props.card ? { shadow: 'never' } : {}))

  const clearSelection = () => {
    selectedRows.value = []
    nextTick(() => {
      tableRef.value?.elTableRef?.clearSelection?.()
      tableRef.value?.elTableRef?.value?.clearSelection?.()
    })
  }

  watch(
    data,
    () => {
      clearSelection()
    },
    { flush: 'post' }
  )

  const handleSelectionChange = (rows: any[]) => {
    selectedRows.value = rows
  }

  const handleSearchBarVisibleChange = (visible: boolean) => {
    showSearchBar.value = visible
  }

  const handleSearch = async () => {
    try {
      await searchBarRef.value?.validate?.()
    } catch {
      return
    }

    currentSearchParams.value = buildSearchParams()
    await rawGetData()
  }

  const getData = async () => {
    await rawGetData()
  }

  const resetSearch = async () => {
    const nextModel = createInitialSearchModel()
    Object.keys(searchModelState).forEach((key) => {
      searchModelState[key] = nextModel[key]
    })

    currentSearchParams.value = buildSearchParams()
    await rawGetData()
  }

  const toolbarSlotScope = computed(() => ({
    selectedRows: selectedRows.value,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove,
    resetSearch,
    clearSelection
  }))

  defineExpose({
    data,
    loading,
    pagination,
    searchModel: searchModelState,
    selectedRows,
    getData,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove,
    resetSearch,
    clearSelection,
    tableRef
  })
</script>

<style scoped>
  .art-pro-table {
    height: 100%;
  }
</style>
