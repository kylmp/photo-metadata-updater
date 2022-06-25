import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alertStore', {
  state: () => {
    return {
      alert: '',
    }
  },
  actions: {
    update(al) {
      this.alert = al;
    }
  }
}) 