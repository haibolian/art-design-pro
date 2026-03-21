<template>
  <span v-if="renderItems.length" class="art-dict-tag">
    <template v-for="(item, index) in renderItems" :key="item.key">
      <span
        v-if="item.renderMode === 'text'"
        class="art-dict-tag__text"
        :class="item.className"
        :style="item.style"
        :title="item.title"
      >
        {{ item.label }}
      </span>
      <ElTag
        v-else
        disable-transitions
        class="art-dict-tag__tag"
        :class="item.className"
        :type="item.tagType"
        :effect="item.tagEffect"
        :title="item.title"
      >
        {{ item.label }}
      </ElTag>

      <span v-if="index < renderItems.length - 1" class="art-dict-tag__separator">
        {{ separator }}
      </span>
    </template>
  </span>
</template>

<script setup lang="ts">
  import { useDict } from '@/hooks'
  import type { CSSProperties } from 'vue'
  import type { DictOption, DictType, DictValue } from '@/types'

  const EL_TAG_TYPES = ['primary', 'success', 'info', 'warning', 'danger'] as const
  const EL_TAG_EFFECTS = ['dark', 'light', 'plain'] as const

  type ElTagTheme = (typeof EL_TAG_TYPES)[number]
  type DictTagType = 'default' | ElTagTheme
  type ElTagEffect = (typeof EL_TAG_EFFECTS)[number]
  type DictTagEffect = 'none' | ElTagEffect

  interface DictTagRenderItem {
    key: string
    label: string
    className?: string
    renderMode: 'text' | 'tag'
    style?: CSSProperties
    tagType?: ElTagTheme
    tagEffect?: ElTagEffect
    title?: string
  }

  interface DictTagProps {
    dictType: DictType
    value: DictValue | DictValue[] | string
    type?: DictTagType
    effect?: DictTagEffect
    separator?: string
  }

  const props = withDefaults(defineProps<DictTagProps>(), {
    effect: 'none',
    separator: ','
  })

  const { options, error, ready } = useDict(() => props.dictType)

  function isElTagTheme(value: string | undefined): value is ElTagTheme {
    return EL_TAG_TYPES.includes(value as ElTagTheme)
  }

  function isElTagEffect(value: string | undefined): value is ElTagEffect {
    return EL_TAG_EFFECTS.includes(value as ElTagEffect)
  }

  function normalizeInputValues(value: DictTagProps['value'], separator: string): string[] {
    if (value === null || value === undefined || value === '') {
      return []
    }

    if (Array.isArray(value)) {
      return value
        .filter((item) => item !== null && item !== undefined && item !== '')
        .map((item) => String(item))
    }

    if (typeof value === 'string') {
      return value
        .split(separator)
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return [String(value)]
  }

  function resolveOptionLabel(option: DictOption | undefined, rawValue: string): string {
    return option?.label ?? rawValue
  }

  function resolveDictTheme(option: DictOption | undefined): ElTagTheme | undefined {
    if (isElTagTheme(option?.elTagType)) {
      return option.elTagType
    }

    return undefined
  }

  function normalizeExplicitType(value: string | undefined): DictTagType | undefined {
    if (value === 'default') {
      return 'default'
    }

    if (isElTagTheme(value)) {
      return value
    }

    return undefined
  }

  function normalizeEffect(value: string | undefined): DictTagEffect {
    if (value === 'none') {
      return 'none'
    }

    if (isElTagEffect(value)) {
      return value
    }

    return 'none'
  }

  function resolveTagTheme(
    option: DictOption | undefined,
    overrideType: string | undefined
  ): DictTagType {
    return normalizeExplicitType(overrideType) ?? resolveDictTheme(option) ?? 'default'
  }

  function getTextStyle(theme: DictTagType): CSSProperties | undefined {
    switch (theme) {
      case 'primary':
        return { color: 'var(--el-color-primary)' }
      case 'success':
        return { color: 'var(--el-color-success)' }
      case 'info':
        return { color: 'var(--el-color-info)' }
      case 'warning':
        return { color: 'var(--el-color-warning)' }
      case 'danger':
        return { color: 'var(--el-color-danger)' }
      default:
        return undefined
    }
  }

  const normalizedValues = computed(() => normalizeInputValues(props.value, props.separator))
  const optionsMap = computed(() => new Map(options.value.map((item) => [item.value, item])))
  const resolvedEffect = computed(() => normalizeEffect(props.effect))

  const renderItems = computed<DictTagRenderItem[]>(() => {
    if (normalizedValues.value.length === 0) {
      return []
    }

    if (!ready.value && !error.value) {
      return []
    }

    const errorTitle = error.value || undefined

    return normalizedValues.value.map((rawValue, index) => {
      const option = optionsMap.value.get(rawValue)
      const label = resolveOptionLabel(option, rawValue)
      const className = option?.elTagClass
      const resolvedType = resolveTagTheme(option, props.type)
      const effect = resolvedEffect.value
      const title = !option && errorTitle ? errorTitle : undefined

      if (resolvedType === 'default' || effect === 'none') {
        return {
          key: `${rawValue}-${index}`,
          label,
          className,
          renderMode: 'text',
          style: getTextStyle(resolvedType),
          title
        }
      }

      return {
        key: `${rawValue}-${index}`,
        label,
        className,
        renderMode: 'tag',
        tagType: resolvedType,
        tagEffect: effect,
        title
      }
    })
  })
</script>

<style scoped lang="scss">
  .art-dict-tag {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0;
  }

  .art-dict-tag__text,
  .art-dict-tag__separator {
    font-size: inherit;
    line-height: inherit;
  }

  .art-dict-tag__text {
    color: var(--el-text-color-regular);
  }

  .art-dict-tag__tag {
    vertical-align: middle;
  }

  .art-dict-tag__separator {
    margin: 0 4px;
    color: var(--el-text-color-secondary);
  }
</style>
