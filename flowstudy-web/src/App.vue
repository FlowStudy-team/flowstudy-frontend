<script setup lang="ts">
import { RouterView } from 'vue-router'
import SiteHeader from './components/common/SiteHeader.vue'
</script>

<template>
  <div class="app-root">
    <SiteHeader class="site-global-header" />
    <RouterView />
  </div>
</template>
