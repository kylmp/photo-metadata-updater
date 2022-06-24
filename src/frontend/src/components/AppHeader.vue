<template>
  <v-app-bar height="56" elevation="1" color="header" class="pr-1">
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
      <v-menu activator="#menu-activator" location="bottom" :close-on-content-click="close" transition="slide-y-transition">
        <v-card width="375" max-width="375" style="margin-left: -340px" class="pl-4">
          <v-switch 
            v-for="toggle in options.values()" v-bind:key="toggle.label"
            v-model="toggle.state" 
            @click="toggle.click" 
            :label="toggle.label" 
            color="img-name"
            hide-details>
          </v-switch>
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
    // Set theme state from local storage
    const themeOption = localStorage.getItem("photo-metadata-theme") === "dark";
    this.options.set('theme', {...this.options.get('theme'), state: themeOption})
    this.theme.global.name = themeOption ? 'darkTheme' : 'lightTheme';

    // Set show save warning state from local storage
    const saveOption = localStorage.getItem("photo-metadata-warning") === "false" ? false : true;
    this.options.set('save', {...this.options.get('save'), state: saveOption})

    // Set show exit warning state from local storage
    const exitOption = localStorage.getItem("photo-metadata-exit") === "false" ? false : true;
    this.options.set('exit', {...this.options.get('exit'), state: exitOption})
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
      this.theme.global.name = this.options.get('theme').state ? 'lightTheme' : 'darkTheme';
      localStorage.setItem("photo-metadata-theme", this.options.get('theme').state ? "light" : "dark");
    },
    toggleSaveWarning: function() {
      localStorage.setItem("photo-metadata-warning", this.options.get('save').state ? "false" : "true")
    },
    toggleExitWarning: function() {
      localStorage.setItem("photo-metadata-exit", this.options.get('exit').state ? "false" : "true")
    }
  },
  data () {
    return {
      theme: useTheme(),
      directory: '',
      close: false,
      options: new Map([
        ['theme', {label: "Dark mode", click: this.toggleTheme, state: false}],
        ['save', {label: "Show warning before saving", click: this.toggleSaveWarning, state: true}],
        ['exit', {label: "Leaving page with unsaved data warning", click: this.toggleExitWarning, state: true}],
      ])
    }
  }
}
</script>