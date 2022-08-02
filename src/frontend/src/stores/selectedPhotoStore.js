import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSelectedPhotoStore = defineStore('selectedPhotoStore', () => {
  const photo = ref('');
  
  const update = (ph) => {
    photo.value = ph;
  }

  return { photo, update };
});
