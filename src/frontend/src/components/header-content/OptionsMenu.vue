<template>
  <v-btn @click="optionsButtonClicked" id="menu-activator" icon="mdi-dots-vertical"></v-btn>
  <v-menu 
    v-model="menu" 
    :close-on-content-click="close" 
    activator="#menu-activator" 
    location="bottom" 
    transition="slide-y-transition">
    <v-card 
      width="375"
      max-width="375"  
      @mouseenter="menuEntered" 
      @mouseleave="menuExited" 
      style="margin-left: -330px" 
      class="pl-4">
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

<script>
import { ref } from 'vue'
import { useTheme } from 'vuetify'
import { useOptionsStore } from '../../stores/optionsStore';
import { useAlertStore } from '../../stores/alertStore';

export default {
  name: 'OptionsMenu',
  setup() {
    const menuExitTimeoutBeforeCloseInMs = 600;
    const menu = ref(false);
    const close = ref(false);
    const theme = useTheme();
    const optionsStore = useOptionsStore();
    const alertStore = useAlertStore();
    const closeMenuTimeout = ref(null);

    const optionsButtonClicked = () => {
      alertStore.alert.clear()
    }

    const menuEntered = () => {
      clearTimeout(closeMenuTimeout.value);
    }

    const menuExited = () => {
      closeMenuTimeout.value = setTimeout(() => menu.value = false, menuExitTimeoutBeforeCloseInMs);
    }

    const toggleTheme = () => {
      theme.global.name.value = options.value.get('theme').state ? 'lightTheme' : 'darkTheme';
      localStorage.setItem("photo-metadata-theme", options.value.get('theme').state ? "light" : "dark");
      optionsStore.toggleDarkTheme();
    };

    const toggleSaveWarning = () => {
      localStorage.setItem("photo-metadata-warning", options.value.get('save').state ? "false" : "true")
      optionsStore.toggleSaveWarning();
    }

    const toggleTooltip = () => {
      localStorage.setItem("photo-metadata-tooltip", options.value.get('tooltip').state ? "false" : "true")
      optionsStore.toggleTooltip();
    }

    const options = ref(new Map([
      ['theme', {label: "Dark mode", click: toggleTheme, state: false}],
      ['save', {label: "Show warning before saving a photo", click: toggleSaveWarning, state: true}],
      ['tooltip', {label: "Show calculate timezone tooltip", click: toggleTooltip, state: true}],
    ]));

    // Set theme state from local storage
    const themeOption = localStorage.getItem("photo-metadata-theme") === "dark";
    options.value.set('theme', {...options.value.get('theme'), state: themeOption})
    theme.global.name.value = themeOption ? 'darkTheme' : 'lightTheme';
    optionsStore.setDarkTheme(themeOption);

    // Set save warning state from local storage
    const saveOption = localStorage.getItem("photo-metadata-warning") === "false" ? false : true;
    options.value.set('save', {...options.value.get('save'), state: saveOption});
    optionsStore.setSaveWarning(saveOption);

    // Set tooltip enabled state from local storage
    const tooltipOption = localStorage.getItem("photo-metadata-tooltip") === "false" ? false : true;
    options.value.set('tooltip', {...options.value.get('tooltip'), state: tooltipOption});
    optionsStore.setTooltip(tooltipOption);

    return { menu, options, close, optionsButtonClicked, menuEntered, menuExited }
  }
}
</script>