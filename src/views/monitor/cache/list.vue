<template>
  <div class="cache-list-page" v-loading="loading">
    <ElRow :gutter="16">
      <ElCol :xs="24" :lg="8">
        <ElCard class="cache-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <ArtSvgIcon icon="ri:archive-line" />
                <span>缓存列表</span>
              </div>
              <ElButton text type="primary" @click="loadCacheNames">刷新</ElButton>
            </div>
          </template>
          <ElTable
            :data="cacheNames"
            height="calc(100vh - 210px)"
            highlight-current-row
            @row-click="loadCacheKeys"
          >
            <ElTableColumn type="index" label="序号" width="70" />
            <ElTableColumn prop="cacheName" label="缓存名称" min-width="140" show-overflow-tooltip />
            <ElTableColumn prop="remark" label="备注" min-width="120" show-overflow-tooltip />
            <ElTableColumn label="操作" width="80" align="right">
              <template #default="{ row }">
                <ArtButtonTable type="delete" @click.stop="clearCacheName(row)" />
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="8">
        <ElCard class="cache-card" shadow="never" v-loading="keysLoading">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <ArtSvgIcon icon="ri:key-2-line" />
                <span>键名列表</span>
              </div>
              <ElButton text type="primary" @click="refreshCacheKeys">刷新</ElButton>
            </div>
          </template>
          <ElTable
            :data="cacheKeys"
            height="calc(100vh - 210px)"
            highlight-current-row
            @row-click="loadCacheValue"
          >
            <ElTableColumn type="index" label="序号" width="70" />
            <ElTableColumn label="缓存键名" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">{{ row }}</template>
            </ElTableColumn>
            <ElTableColumn label="操作" width="80" align="right">
              <template #default="{ row }">
                <ArtButtonTable type="delete" @click.stop="clearCacheKey(row)" />
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="8">
        <ElCard class="cache-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <ArtSvgIcon icon="ri:file-text-line" />
                <span>缓存内容</span>
              </div>
              <ElButton text type="danger" @click="clearCacheAll">清理全部</ElButton>
            </div>
          </template>
          <ElForm :model="cacheForm" label-width="90px">
            <ElFormItem label="缓存名称">
              <ElInput v-model="cacheForm.cacheName" readonly />
            </ElFormItem>
            <ElFormItem label="缓存键名">
              <ElInput v-model="cacheForm.cacheKey" readonly />
            </ElFormItem>
            <ElFormItem label="缓存内容">
              <ElInput v-model="cacheForm.cacheValue" type="textarea" :rows="10" readonly />
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { ElMessage } from 'element-plus'
  import {
    fetchClearCacheAll,
    fetchClearCacheKey,
    fetchClearCacheName,
    fetchGetCacheValue,
    fetchListCacheKey,
    fetchListCacheName
  } from '@/api/monitor'

  defineOptions({ name: 'CacheList' })

  const loading = ref(false)
  const keysLoading = ref(false)
  const cacheNames = ref<Api.Monitor.SysCache[]>([])
  const cacheKeys = ref<string[]>([])
  const cacheForm = reactive<Api.Monitor.SysCache>({
    cacheName: undefined,
    cacheKey: undefined,
    cacheValue: undefined
  })
  const currentCacheName = ref<string>()

  const loadCacheNames = async () => {
    loading.value = true
    try {
      cacheNames.value = await fetchListCacheName()
    } finally {
      loading.value = false
    }
  }

  const loadCacheKeys = async (row: Api.Monitor.SysCache) => {
    if (!row.cacheName) {
      throw new Error('查询缓存键名时缺少 cacheName')
    }
    keysLoading.value = true
    try {
      currentCacheName.value = row.cacheName
      cacheKeys.value = await fetchListCacheKey(row.cacheName)
    } finally {
      keysLoading.value = false
    }
  }

  const refreshCacheKeys = async () => {
    if (!currentCacheName.value) {
      ElMessage.warning('请先选择缓存名称')
      return
    }
    keysLoading.value = true
    try {
      cacheKeys.value = await fetchListCacheKey(currentCacheName.value)
      ElMessage.success('刷新键名列表成功')
    } finally {
      keysLoading.value = false
    }
  }

  const loadCacheValue = async (cacheKey: string) => {
    if (!currentCacheName.value) {
      throw new Error('查询缓存内容时缺少 cacheName')
    }
    Object.assign(cacheForm, await fetchGetCacheValue(currentCacheName.value, cacheKey))
  }

  const clearCacheName = async (row: Api.Monitor.SysCache) => {
    if (!row.cacheName) {
      throw new Error('清理缓存名称时缺少 cacheName')
    }
    await fetchClearCacheName(row.cacheName)
    ElMessage.success(`清理缓存名称 ${row.cacheName} 成功`)
    await loadCacheNames()
    if (currentCacheName.value === row.cacheName) {
      cacheKeys.value = []
      Object.assign(cacheForm, {
        cacheName: undefined,
        cacheKey: undefined,
        cacheValue: undefined
      })
      currentCacheName.value = undefined
    }
  }

  const clearCacheKey = async (cacheKey: string) => {
    await fetchClearCacheKey(cacheKey)
    ElMessage.success(`清理缓存键名 ${cacheKey} 成功`)
    await refreshCacheKeys()
  }

  const clearCacheAll = async () => {
    await fetchClearCacheAll()
    ElMessage.success('清理全部缓存成功')
    await loadCacheNames()
    cacheKeys.value = []
    Object.assign(cacheForm, {
      cacheName: undefined,
      cacheKey: undefined,
      cacheValue: undefined
    })
    currentCacheName.value = undefined
  }

  loadCacheNames()
</script>

<style scoped>
  .cache-list-page {
    padding: 16px;
  }

  .cache-card {
    height: calc(100vh - 120px);
  }

  .card-header,
  .card-title {
    display: flex;
    align-items: center;
  }

  .card-header {
    justify-content: space-between;
  }

  .card-title {
    gap: 8px;
    font-weight: 600;
  }
</style>
