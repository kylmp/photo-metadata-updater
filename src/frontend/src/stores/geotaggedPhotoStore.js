import { defineStore } from 'pinia'

export const useGeotaggedPhotoStore = defineStore('geotaggedPhotoStore', {
  state: () => {
    return {
      name: '',
    }
  },
  actions: {
    update(name) {
      this.name = name;
    }
  }
}) 