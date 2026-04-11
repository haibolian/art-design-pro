<template>
  <div class="menu-page art-full-height">
    <ArtSearchBar
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
    />

    <ElCard class="art-table-card" shadow="never">
      <ArtTableToolbar
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-auth="'system:menu:add'" @click="handleAddRoot" v-ripple>新增菜单</ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableToolbar>

      <ArtTable
        :key="tableKey"
        ref="tableRef"
        rowKey="menuId"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpanded"
      />

      <MenuDialog
        v-model:visible="dialogVisible"
        :mode="dialogMode"
        :menu-id="currentMenuId"
        :parent-id="currentParentId"
        :menu-options="menuOptions"
        @success="handleDialogSuccess"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { fetchDeleteMenu, fetchGetMenuList } from '@/api/system-manage'
  import { useAuth } from '@/hooks/core/useAuth'
  import MenuDialog from './modules/menu-dialog.vue'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'Menus' })

  type MenuListItem = Api.SystemManage.MenuListItem
  type MenuType = Api.SystemManage.MenuType
  type TagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'

  interface MenuSearchState {
    menuName: string
    status: '' | '0' | '1'
  }

  interface MenuTreeOption {
    menuId: number
    menuName: string
    children?: MenuTreeOption[]
  }

  const { hasAuth } = useAuth()

  const loading = ref(false)
  const tableRef = ref()
  const tableKey = ref(0)
  const isExpanded = ref(false)

  const dialogVisible = ref(false)
  const dialogMode = ref<'add' | 'edit'>('add')
  const currentMenuId = ref<number | null>(null)
  const currentParentId = ref(0)

  const initialSearchState: MenuSearchState = {
    menuName: '',
    status: ''
  }

  const formFilters = reactive<MenuSearchState>({ ...initialSearchState })
  const tableData = ref<MenuListItem[]>([])
  const menuOptions = ref<MenuTreeOption[]>([])

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'menuName',
      type: 'input',
      props: { clearable: true, placeholder: '请输入菜单名称' }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: {
        clearable: true,
        placeholder: '请选择状态',
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' }
        ]
      }
    }
  ])

  const MENU_TYPE_META: Record<MenuType, { text: string; type: TagType }> = {
    M: { text: '目录', type: 'info' },
    C: { text: '菜单', type: 'primary' },
    F: { text: '按钮', type: 'warning' }
  }

  const STATUS_META: Record<'0' | '1', { text: string; type: TagType }> = {
    '0': { text: '正常', type: 'success' },
    '1': { text: '停用', type: 'danger' }
  }

  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'menuName',
      label: '菜单名称',
      minWidth: 160,
      formatter: (row: MenuListItem) => row.menuName || '-'
    },
    {
      prop: 'menuType',
      label: '类型',
      width: 90,
      cellRender: (row: MenuListItem) => {
        const menuType = (row.menuType || 'M') as MenuType
        const meta = MENU_TYPE_META[menuType] || MENU_TYPE_META.M
        return h(ElTag, { type: meta.type }, () => meta.text)
      }
    },
    {
      prop: 'icon',
      label: '图标',
      minWidth: 120,
      formatter: (row: MenuListItem) => row.icon || '-'
    },
    {
      prop: 'orderNum',
      label: '排序',
      width: 80,
      formatter: (row: MenuListItem) => `${row.orderNum ?? 0}`
    },
    {
      prop: 'perms',
      label: '权限标识',
      minWidth: 180,
      showOverflowTooltip: true,
      formatter: (row: MenuListItem) => row.perms || '-'
    },
    {
      prop: 'component',
      label: '组件路径',
      minWidth: 160,
      showOverflowTooltip: true,
      formatter: (row: MenuListItem) => row.component || '-'
    },
    {
      prop: 'status',
      label: '状态',
      width: 90,
      cellRender: (row: MenuListItem) => {
        const status = (row.status || '0') as '0' | '1'
        const meta = STATUS_META[status] || STATUS_META['0']
        return h(ElTag, { type: meta.type }, () => meta.text)
      }
    },
    {
      prop: 'createTime',
      label: '创建时间',
      minWidth: 160,
      formatter: (row: MenuListItem) => row.createTime || '-'
    },
    {
      prop: 'operation',
      label: '操作',
      width: 200,
      fixed: 'right',
      align: 'right',
      cellRender: (row: MenuListItem) => {
        const actions = []

        if (hasAuth('system:menu:add') && row.menuType !== 'F') {
          actions.push(
            h(ArtButtonTable, {
              type: 'add',
              title: '新增',
              onClick: () => handleAddChild(row)
            })
          )
        }

        if (hasAuth('system:menu:edit')) {
          actions.push(
            h(ArtButtonTable, {
              type: 'edit',
              onClick: () => handleEdit(row)
            })
          )
        }

        if (hasAuth('system:menu:remove')) {
          actions.push(
            h(ArtButtonTable, {
              type: 'delete',
              onClick: () => handleDelete(row)
            })
          )
        }

        if (actions.length === 0) {
          return '-'
        }

        return h('div', { style: 'text-align: right' }, actions)
      }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  const normalizeSearchParams = (): Api.SystemManage.MenuQueryParams => {
    const menuName = formFilters.menuName.trim()
    const status = formFilters.status
    const params: Api.SystemManage.MenuQueryParams = {}

    if (menuName) {
      params.menuName = menuName
    }
    if (status) {
      params.status = status
    }

    return params
  }

  const getMenuList = async (): Promise<void> => {
    loading.value = true
    try {
      const list = await fetchGetMenuList(normalizeSearchParams())
      const normalizedList = normalizeMenuData(list)
      tableData.value = normalizedList
      menuOptions.value = buildMenuOptions(normalizedList)
    } catch (error) {
      throw error instanceof Error ? error : new Error('获取菜单失败')
    } finally {
      loading.value = false
    }
  }

  const normalizeMenuData = (list: MenuListItem[]): MenuListItem[] => {
    if (!Array.isArray(list)) {
      return []
    }

    const hasChildren = list.some(
      (item) => Array.isArray(item.children) && item.children.length > 0
    )
    if (hasChildren) {
      return list
    }

    return buildMenuTree(list)
  }

  const buildMenuTree = (list: MenuListItem[]): MenuListItem[] => {
    const nodeMap = new Map<number, MenuListItem>()
    const roots: MenuListItem[] = []

    list.forEach((item) => {
      if (typeof item.menuId !== 'number') {
        return
      }
      nodeMap.set(item.menuId, {
        ...item,
        children: []
      })
    })

    list.forEach((item) => {
      if (typeof item.menuId !== 'number') {
        return
      }

      const node = nodeMap.get(item.menuId)
      if (!node) {
        return
      }

      const parentId = Number(item.parentId ?? 0)
      if (parentId > 0 && nodeMap.has(parentId)) {
        const parentNode = nodeMap.get(parentId)!
        parentNode.children = parentNode.children || []
        parentNode.children.push(node)
      } else {
        roots.push(node)
      }
    })

    return roots
  }

  const buildMenuOptions = (menuList: MenuListItem[]): MenuTreeOption[] => {
    const root: MenuTreeOption = {
      menuId: 0,
      menuName: '主类目',
      children: menuList.map(convertToTreeOption)
    }
    return [root]
  }

  const convertToTreeOption = (item: MenuListItem): MenuTreeOption => {
    return {
      menuId: item.menuId ?? 0,
      menuName: item.menuName || '未命名菜单',
      children: (item.children || []).map(convertToTreeOption)
    }
  }

  const openDialog = (mode: 'add' | 'edit', menuId: number | null, parentId: number): void => {
    dialogMode.value = mode
    currentMenuId.value = menuId
    currentParentId.value = parentId
    dialogVisible.value = true
  }

  const handleAddRoot = (): void => {
    openDialog('add', null, 0)
  }

  const handleAddChild = (row: MenuListItem): void => {
    openDialog('add', null, row.menuId ?? 0)
  }

  const handleEdit = (row: MenuListItem): void => {
    if (typeof row.menuId !== 'number') {
      throw new Error('菜单ID缺失，无法编辑')
    }
    openDialog('edit', row.menuId, row.parentId ?? 0)
  }

  const handleDelete = async (row: MenuListItem): Promise<void> => {
    if (typeof row.menuId !== 'number') {
      throw new Error('菜单ID缺失，无法删除')
    }

    try {
      await ElMessageBox.confirm(`确认删除菜单 "${row.menuName}" 吗？`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteMenu(row.menuId)
      ElMessage.success('删除成功')
      await getMenuList()
    } catch (error) {
      if (error === 'cancel' || error === 'close') {
        return
      }
      throw error
    }
  }

  const handleDialogSuccess = async (): Promise<void> => {
    dialogVisible.value = false
    await getMenuList()
  }

  const handleReset = async (): Promise<void> => {
    Object.assign(formFilters, { ...initialSearchState })
    await getMenuList()
  }

  const handleSearch = async (): Promise<void> => {
    await getMenuList()
  }

  const handleRefresh = async (): Promise<void> => {
    await getMenuList()
  }

  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    tableKey.value += 1
  }
</script>
