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
      <ArtTableToolbar
        v-if="showToolbar"
        v-model:columns="columnChecks"
        :loading="loading"
        :show-search-bar="hasSearch ? showSearchBar : undefined"
        v-bind="props.tableToolbarProps"
        @refresh="refreshData"
        @update:show-search-bar="handleSearchBarVisibleChange"
      >
        <template #left>
          <slot name="toolbar-left" v-bind="toolbarSlotScope" />
        </template>

        <template #right>
          <slot name="toolbar-right" v-bind="toolbarSlotScope" />
        </template>
      </ArtTableToolbar>

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
  import { computed, nextTick, ref, watch } from 'vue'
  import { ElCard, type TableProps } from 'element-plus'
  import { useTable } from '@/hooks/core/useTable'
  import type { ApiResponse, TableError } from '@/hooks/core/useTable'
  import type { ProTableColumn } from '@/types/component'
  import {
    buildSearchParams,
    createInitialSearchModel,
    createTableColumns,
    resolveSearchableColumns,
    resolveTableHeaderSlotNames,
    resolveTableSlotNames
  } from './utils'

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
    tableToolbarProps?: Record<string, any>
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

  const props = withDefaults(defineProps<ProTableProps>(), {
    immediate: true,
    toolbar: true,
    card: true,
    showSearch: true,
    searchBarProps: () => ({}),
    tableToolbarProps: () => ({}),
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

  // ProTable 的运行时数据全部从 columns 单向派生，主组件只负责状态编排。
  const sourceColumns = resolveColumns()
  const searchableColumns = resolveSearchableColumns(sourceColumns)
  const tableColumns = createTableColumns(sourceColumns)

  const searchModel = ref<Record<string, any>>(createInitialSearchModel(searchableColumns))

  const currentSearchParams = ref<Record<string, any>>(
    buildSearchParams(searchableColumns, searchModel.value)
  )

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
      columnsSource: () => tableColumns,
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
  const tableSlotNames = computed(() => resolveTableSlotNames(tableColumns))
  const tableHeaderSlotNames = computed(() => resolveTableHeaderSlotNames(tableColumns))
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

    currentSearchParams.value = buildSearchParams(searchableColumns, searchModel.value)
    await rawGetData()
  }

  const getData = async () => {
    await rawGetData()
  }

  const resetSearch = async () => {
    searchModel.value = createInitialSearchModel(searchableColumns)

    currentSearchParams.value = buildSearchParams(searchableColumns, searchModel.value)
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
    searchModel,
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
