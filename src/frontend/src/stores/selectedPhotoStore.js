import { defineStore } from 'pinia'

export const useSelectedPhotoStore = defineStore('selectedPhotoStore', {
  state: () => {
    return {
      photo: '',
    }
  },
  actions: {
    update(photo) {
      this.photo = photo;
    }
  }
}) 