import { defineStore } from 'pinia'

export const useCoordinatesStore = defineStore('coordinatesStore', {
  state: () => {
    return {
      coordinates: {lat: 0, lon: 0},
    }
  },
  actions: {
    update(lat, lon) {
      this.coordinates = {lat: lat, lon: lon};
    },
  }
}) 