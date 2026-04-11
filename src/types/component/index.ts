/**
 * 组件类型定义模块
 *
 * 提供项目组件的类型定义
 *
 * ## 主要功能
 *
 * - 搜索组件类型定义
 * - 表格列配置类型
 * - 分页配置类型
 * - 表单规则类型
 * - 对话框配置类型
 *
 * ## 使用场景
 *
 * - 组件 Props 类型约束
 * - 组件配置类型定义
 * - 组件事件参数类型
 *
 * @module types/component/index
 * @author Art Design Pro Team
 */

import type { TableColumnCtx } from 'element-plus'
import type { Component, Ref } from 'vue'

// 搜索组件类型
export type SearchComponentType =
  | 'input'
  | 'inputTag'
  | 'number'
  | 'select'
  | 'switch'
  | 'checkbox'
  | 'checkboxgroup'
  | 'radiogroup'
  | 'dict-select'
  | 'dict-radio-group'
  | 'dict-checkbox-group'
  | 'date'
  | 'daterange'
  | 'datetime'
  | 'datetimerange'
  | 'month'
  | 'monthrange'
  | 'year'
  | 'yearrange'
  | 'week'
  | 'time'
  | 'timepicker'
  | 'timerange'
  | 'timeselect'
  | 'cascader'
  | 'treeselect'
  | 'rate'
  | 'slider'

// 搜索框值变化参数
export interface SearchChangeParams {
  prop: string
  val: unknown
}

// 搜索表单项配置
export interface SearchFormItem {
  /** 表单项的唯一标识 */
  key: string
  /** 表单项的标签文本或自定义渲染函数 */
  label?: string | (() => any) | Component
  /** 表单项标签的宽度，会覆盖 Form 的 labelWidth */
  labelWidth?: string | number
  /** 表单项类型，支持预定义的组件类型 */
  type?: SearchComponentType | string
  /** 自定义渲染函数或组件，用于渲染自定义组件（优先级高于 type） */
  render?: (() => any) | Component
  /** 是否隐藏该表单项 */
  hidden?: boolean
  /** 表单项占据的列宽，基于24格栅格系统 */
  span?: number
  /** 选项数据，用于 select、checkbox-group、radio-group 等 */
  options?: Record<string, any>[]
  /** 传递给表单项组件的属性 */
  props?: Record<string, any>
  /** 表单项的插槽配置 */
  slots?: Record<string, (() => any) | undefined>
  /** 表单项的占位符文本 */
  placeholder?: string
  /** 更多属性配置请参考 ElementPlus 官方文档 */
  [key: string]: any
}

type TableRowData = Record<PropertyKey, any>

export type TableFormatter<T = any> = TableColumnCtx<T & TableRowData>['formatter']
export type TableCellRender<T = any> = TableFormatter<T>

interface BaseColumnOption {
  // 列类型
  type?: 'selection' | 'expand' | 'index' | 'globalIndex'
  // 列属性名
  prop?: string
  // 列标题
  label?: string
  // 列宽度
  width?: string | number
  // 最小列宽度
  minWidth?: string | number
  // 固定列
  fixed?: boolean | 'left' | 'right'
  // 是否可排序
  sortable?: boolean | 'custom'
  // 过滤器选项
  filters?: any[]
  // 过滤方法
  filterMethod?: (value: any, row: any) => boolean
  // 过滤器位置
  filterPlacement?: string
  // 是否禁用
  disabled?: boolean
  // 是否显示列
  visible?: boolean
  // 是否使用表头插槽
  useHeaderSlot?: boolean
  // 表头插槽名称（默认为 `${prop}-header`）
  headerSlotName?: string
  // 其他属性
  [key: string]: any
}

type NormalColumnType = Exclude<BaseColumnOption['type'], 'expand'>

type NormalSlotColumnOption<T = any> = BaseColumnOption & {
  type?: NormalColumnType
  // 是否使用插槽渲染内容
  useSlot: true
  // 插槽名称（默认为 prop 值）
  slotName?: string
  // Element Plus 原生 formatter
  formatter?: TableFormatter<T>
  cellRender?: never
  component?: never
}

type NormalFormatterColumnOption<T = any> = BaseColumnOption & {
  type?: NormalColumnType
  useSlot?: false | undefined
  slotName?: never
  // Element Plus 原生 formatter
  formatter?: TableFormatter<T>
  cellRender?: never
  component?: never
}

type NormalCellRenderColumnOption<T = any> = BaseColumnOption & {
  type?: NormalColumnType
  useSlot?: false | undefined
  slotName?: never
  formatter?: never
  // ArtTable 单元格自定义渲染
  cellRender: TableCellRender<T>
  component?: never
}

type ExpandSlotColumnOption = BaseColumnOption & {
  type: 'expand'
  useSlot: true
  slotName?: string
  formatter?: never
  cellRender?: never
  component?: never
}

type ExpandComponentColumnOption = BaseColumnOption & {
  type: 'expand'
  useSlot?: false | undefined
  slotName?: never
  formatter?: never
  cellRender?: never
  component: Component
}

// 表格列配置接口
export type ColumnOption<T = any> =
  | NormalSlotColumnOption<T>
  | NormalFormatterColumnOption<T>
  | NormalCellRenderColumnOption<T>
  | ExpandSlotColumnOption
  | ExpandComponentColumnOption

export interface ProTableSearchConfig<TParams = Record<string, any>> {
  /** 搜索字段名，默认使用列 prop */
  key?: string
  /** 搜索项类型 */
  type?: SearchFormItem['type']
  /** 搜索项标题，默认使用列 label */
  label?: SearchFormItem['label']
  /** 搜索项排序 */
  order?: number
  /** 搜索项宽度 */
  span?: number
  /** 搜索项组件 Props */
  props?: Record<string, any>
  /** 自定义搜索项渲染 */
  render?: SearchFormItem['render']
  /** 搜索项插槽 */
  slots?: SearchFormItem['slots']
  /** 搜索项默认值 */
  defaultValue?: unknown
  /** 将搜索值转换为请求参数 */
  transform?: (value: unknown) => Partial<TParams>
}

export interface ProTableColumnExtension<TParams = Record<string, any>> {
  /** 是否在表格中隐藏该列 */
  hideInTable?: boolean
  /** 是否在搜索区中隐藏该列 */
  hideInSearch?: boolean
  /** 搜索项配置 */
  search?: boolean | ProTableSearchConfig<TParams>
}

export type ProTableColumn<T = any, TParams = Record<string, any>> = ColumnOption<T> &
  ProTableColumnExtension<TParams>

export interface ProTableExpose<TRecord = any> {
  data: Ref<TRecord[]>
  loading: Readonly<Ref<boolean>>
  pagination: Readonly<Api.Common.PaginationParams>
  searchModel: Record<string, any>
  selectedRows: Ref<TRecord[]>
  getData: () => Promise<void>
  refreshData: () => Promise<void>
  refreshCreate: () => Promise<void>
  refreshUpdate: () => Promise<void>
  refreshRemove: () => Promise<void>
  resetSearch: () => Promise<void>
  clearSelection: () => void
  tableRef: any
}

// 分页配置
export interface PaginationConfig {
  // 当前页
  currentPage: number
  // 每页条数
  pageSize: number
  // 总条数
  total: number
  // 每页显示个数选择器的选项
  pageSizes?: number[]
  // 组件布局
  layout?: string
  // 是否为小型分页
  small?: boolean
}

// 表单规则
export interface FormRule {
  // 是否必填
  required?: boolean
  // 错误提示信息
  message?: string
  // 触发方式
  trigger?: string | string[]
  // 最小长度
  min?: number
  // 最大长度
  max?: number
  // 正则表达式
  pattern?: RegExp
  // 自定义验证函数
  validator?: (rule: any, value: any, callback: any) => void
}

// 对话框配置
export interface DialogConfig {
  // 标题
  title: string
  // 是否显示
  visible: boolean
  // 宽度
  width?: string | number
  // 是否可以通过点击 modal 关闭
  closeOnClickModal?: boolean
  // 是否可以通过按下 ESC 关闭
  closeOnPressEscape?: boolean
  // 是否显示关闭按钮
  showClose?: boolean
  // 是否在 Dialog 出现时将 body 滚动锁定
  lockScroll?: boolean
  // 是否显示遮罩层
  modal?: boolean
  // 自定义类名
  customClass?: string
}
