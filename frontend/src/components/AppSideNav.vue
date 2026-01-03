<template>
  <v-navigation-drawer class="app-side-nav" color="divider" width="290" permanent>
    <photo-list></photo-list>
  </v-navigation-drawer>
</template>

<script setup>
import PhotoList from './sidenav-content/PhotoList.vue';
</script>

<style scoped>
.app-side-nav :deep(.v-navigation-drawer__content) {
  padding-top: 0;
}
</style>
