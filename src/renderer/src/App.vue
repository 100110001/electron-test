<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAppStoreWithOut } from '@renderer/store/modules/app'

const appStore = useAppStoreWithOut()

onMounted(() => {
  window.electronAPI.getConfiguration((value) => {
    appStore.setConfiguration(value)
    if (value.nativeTheme.shouldUseDarkColors) {
      document.body.setAttribute('arco-theme', 'dark')
    } else {
      document.body.removeAttribute('arco-theme')
    }
  })
})
</script>

<style lang="less"></style>
