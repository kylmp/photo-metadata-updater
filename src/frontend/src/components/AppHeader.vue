<template>
  <v-app-bar height="56" elevation="1" color="primary" class="pr-1">
    <v-app-bar-title>Photo Metadata Updater</v-app-bar-title>
    <v-text-field 
      class="mt-9"
      density="compact" 
      label="Photo directory full path" 
      placeholder="Photo directory full path" 
      v-model="directory"
      variant="outlined"
      @keydown.enter.prevent="updateDirectory">
    </v-text-field>
    <v-btn @click="updateDirectory">Fetch</v-btn>
    <template v-slot:append>
      <v-btn id="menu-activator" icon="mdi-dots-vertical"></v-btn>
      <v-menu activator="#menu-activator" location="bottom" :close-on-content-click="close">
        <v-card width="250" max-width="250" style="margin-left: -210px">
          <v-list class="pa-0">
            <v-list-item>
              <v-switch 
                v-model="themeSwitch" 
                @click="toggleTheme" 
                color="img-name" 
                label="Dark Theme" 
                hide-details>
              </v-switch>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script>
import { useTheme } from 'vuetify'
export default {
  name: 'AppHeader',
  emits: ["directory"],
  created() {
    const theme = localStorage.getItem("photo-metadata-theme");
    this.themeSwitch = theme === 'dark';
    this.theme.global.name = this.themeSwitch ? 'darkTheme' : 'lightTheme';
  },
  methods: {
    updateDirectory: function() {
      if (!this.directory) {
        this.$root.alert.error("Directory path required!");
        return;
      }
      this.$emit('directory', this.directory);
    },
    toggleTheme: function() {
      this.theme.global.name = this.themeSwitch ? 'lightTheme' : 'darkTheme';
      localStorage.setItem("photo-metadata-theme", this.themeSwitch ? "light" : "dark");
    }
  },
  data () {
    return {
      directory: '',
      close: false,
      themeSwitch: false,
      theme: useTheme()
    }
  }
}
</script>