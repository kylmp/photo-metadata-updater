import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('optionsStore', () => {
  const darkTheme = ref(false);
  const saveWarning = ref(true);
  const showTooltip = ref(true);
  
  const setDarkTheme = (theme) => {
    darkTheme.value = theme;
  }
  
  const setSaveWarning = (save) => {
    saveWarning.value = save;
  }
  
  const setTooltip = (tooltip) => {
    showTooltip.value = tooltip;
  }
  
  const toggleDarkTheme = () => {
    darkTheme.value = !darkTheme.value;
  }
  
  const toggleSaveWarning = () => {
    saveWarning.value = !saveWarning.value;
  }
  
  const toggleTooltip = () => {
    showTooltip.value = !showTooltip.value;
  }

  return { 
    darkTheme, setDarkTheme, toggleDarkTheme,
    saveWarning, setSaveWarning, toggleSaveWarning,
    showTooltip, setTooltip, toggleTooltip
  };
});
