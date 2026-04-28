/**
 * 字典类型定义
 */

/** 常用字典类型常量 */
export const DICT_TYPE = {
  NORMAL_DISABLE: 'sys_normal_disable',
  COMMON_STATUS: 'sys_common_status',
  USER_SEX: 'sys_user_sex',
  SHOW_HIDE: 'sys_show_hide',
  YES_NO: 'sys_yes_no',
  NOTICE_TYPE: 'sys_notice_type',
  NOTICE_STATUS: 'sys_notice_status',
  OPER_TYPE: 'sys_oper_type',
  JOB_GROUP: 'sys_job_group',
  JOB_STATUS: 'sys_job_status'
} as const

/** 项目内置字典类型 */
export type BuiltinDictType = (typeof DICT_TYPE)[keyof typeof DICT_TYPE]

/** 字典类型（内置 + 自定义） */
export type DictType = BuiltinDictType | (string & {})

/** 字典值类型 */
export type DictValue = string | number | boolean | null | undefined

/** 后端字典数据结构（若依） */
export interface DictDataItem {
  dictCode?: number
  dictSort?: number
  dictLabel: string
  dictValue: string
  dictType?: string
  cssClass?: string
  listClass?: string
  isDefault?: 'Y' | 'N'
  status?: '0' | '1'
  remark?: string
  [key: string]: unknown
}

/** 前端统一字典选项结构 */
export interface DictOption {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
  status?: '0' | '1'
  raw: DictDataItem
}
