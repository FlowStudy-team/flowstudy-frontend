<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <RouterLink to="/admin" class="admin-brand">FlowStudy Admin</RouterLink>
      <RouterLink to="/admin/users">用户管理</RouterLink>
      <RouterLink to="/admin/content/blogs">博客审核</RouterLink>
      <RouterLink to="/admin/content/tutorials">教程审核</RouterLink>
      <RouterLink to="/admin/content/problems">题目管理</RouterLink>
      <RouterLink to="/admin/store/products">会员商品</RouterLink>
      <RouterLink to="/admin/store/coupons">优惠券</RouterLink>
      <RouterLink to="/admin/orders">订单管理</RouterLink>
      <RouterLink to="/admin/audit-logs">操作审计</RouterLink>
      <RouterLink to="/">返回学习端</RouterLink>
    </aside>
    <main class="admin-main"><RouterView /></main>
  </div>
</template>
