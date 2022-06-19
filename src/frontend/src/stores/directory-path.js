import { defineStore } from 'pinia'

export const directoryStore = defineStore('directoryStore', {
  state: () => {
    return {
      directory: '',
    }
  },
})