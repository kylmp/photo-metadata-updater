import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCoordinatesStore = defineStore('coordinatesStore', () => {
  const coordinates = ref({lat: 0, lon: 0})
  const isNewPhoto = ref(false);
  
  const update = (lat, lon, newPhoto = false) => {
    coordinates.value = {lat: lat, lon: lon};
    isNewPhoto.value = newPhoto;
  }

  return { coordinates, isNewPhoto, update };
});
