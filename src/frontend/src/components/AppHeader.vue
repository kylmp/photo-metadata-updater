<template>
  <v-app-bar height="56" elevation="1" color="header" class="pr-1">
    <v-app-bar-title>Photo Metadata Updater</v-app-bar-title>
    <DirectorySearch></DirectorySearch>
    <OptionsMenu></OptionsMenu>
  </v-app-bar>
</template>

<script>
import DirectorySearch from './header-content/DirectorySearch.vue'
import OptionsMenu from './header-content/OptionsMenu.vue'

export default {
  name: 'AppHeader',
  components: {
    DirectorySearch,
    OptionsMenu
  },
}
</script>