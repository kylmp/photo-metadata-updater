import { defineStore } from 'pinia'

export const useDirectoryStore = defineStore('directoryStore', {
  state: () => {
    return {
      directory: '',
      time: Date.now(),
    }
  },
  actions: {
    update(dir) {
      this.directory = dir;
      this.time = Date.now();
    }
  }
}) 