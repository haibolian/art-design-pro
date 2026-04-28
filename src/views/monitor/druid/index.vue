<template>
  <div class="druid-page">
    <iframe :src="druidUrl" title="Druid Monitor" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'Druid' })

  const druidUrl = `${import.meta.env.VITE_API_URL}/druid/index.html`
</script>

<style scoped>
  .druid-page {
    height: 100%;
    padding: 16px;
  }

  iframe {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 130px);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    background: var(--el-bg-color);
  }
</style>
