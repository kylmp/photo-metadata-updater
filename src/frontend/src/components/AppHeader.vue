<template>
  <v-app-bar height="56" elevation="1" color="header" class="pr-1">
    <v-app-bar-title>Photo Metadata Updater</v-app-bar-title>
    <directory-search/>
    <options-menu/>
  </v-app-bar>
</template>

<script setup>
import DirectorySearch from './header-content/DirectorySearch.vue'
import OptionsMenu from './header-content/OptionsMenu.vue'
</script>