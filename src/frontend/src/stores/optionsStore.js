import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('optionsStore', {
  state: () => {
    return {
      darkTheme: false,
      saveWarning: true,
      showTooltip: true,
    }
  },
  actions: {
    setDarkTheme(theme) {
      this.darkTheme = theme;
    },
    setSaveWarning(save) {
      this.saveWarning = save;
    },
    setTooltip(tooltip) {
      this.showTooltip = tooltip;
    },
    toggleDarkTheme() {
      this.darkTheme = !this.darkTheme;
    },
    toggleSaveWarning() {
      this.saveWarning = !this.saveWarning;
    },
    toggleTooltip() {
      this.showTooltip = !this.showTooltip;
    }
  }
}) 