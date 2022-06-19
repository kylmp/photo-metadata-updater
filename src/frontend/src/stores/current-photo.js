import { defineStore } from 'pinia'

export const photoStore = defineStore('currentItemsStore', {
  state: () => {
    return {
      photoMetaData: {},
    }
  },
})