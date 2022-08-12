import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settingsStore', () => {
  const name = ref('Photo Metadata Updater');
  const port = ref(8000);
  const regex = ref({});
  
  const update = (settings) => {
    name.value = settings.name;
    port.value = settings.port;
    for (let reg of Object.keys(settings.regex)) {
      regex.value[reg] = new RegExp(settings.regex[reg])
    }
  }

  const getRegex = (key) => {
    return regex.value[key];
  }

  return { name, port, regex, update, getRegex };
});