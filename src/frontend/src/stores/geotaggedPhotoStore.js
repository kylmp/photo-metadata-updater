import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useGeotaggedPhotoStore = defineStore('geotaggedPhotoStore', () => {
  const name = ref('');
  
  const update = (name) => {
    name.value = name;
  }

  return { name, update };
});
