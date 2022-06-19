import { defineStore } from 'pinia'

export const listStore = defineStore('photoListStore', {
  state: () => {
    return {
      photoList: [],
    }
  },
})