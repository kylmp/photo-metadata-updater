import { defineStore } from 'pinia'

export const useCoordinatesStore = defineStore('coordinatesStore', {
  state: () => {
    return {
      coordinates: {lat: 0, lon: 0},
      isNewPhoto: false
    }
  },
  actions: {
    update(lat, lon, newPhoto = false) {
      this.coordinates = {lat: lat, lon: lon};
      this.isNewPhoto = newPhoto;
    },
  }
}) 