import { defineStore } from 'pinia'

export const useOptionsStore = defineStore('optionsStore', {
  state: () => {
    return {
      darkTheme: false,
      saveWarning: true,
      exitWarning: true,
    }
  },
  actions: {
    setDarkTheme(theme) {
      this.darkTheme = theme;
    },
    setSaveWarning(save) {
      this.saveWarning = save;
    },
    setExitWarning(exit) {
      this.exitWarning = exit;
    },
    toggleDarkTheme() {
      this.darkTheme = !this.darkTheme;
    },
    toggleSaveWarning() {
      this.saveWarning = !this.saveWarning;
    },
    toggleExitWarning() {
      this.exitWarning = !this.exitWarning;
    }
  }
}) 