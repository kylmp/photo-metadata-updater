<template>
  <v-app-bar height="56" elevation="1" color="primary">
    <v-app-bar-title>Photo Metadata Updater</v-app-bar-title>
    <v-text-field 
      class="mt-9"
      density="compact" 
      label="Photo directory full path" 
      placeholder="Photo directory full path" 
      v-model="directory"
      variant="outlined">
    </v-text-field>
    <v-btn @click="updateDirectory">Fetch</v-btn>
  </v-app-bar>
</template>

<script>
import { directoryStore } from '@/stores/directory-path'

export default {
  name: 'AppHeader',
  methods: {
    updateDirectory: function () {
      directoryStore().$state = {'directory':this.directory};
    }
  },
  data () {
    return {
      directory: '',
    }
  }
}
</script>