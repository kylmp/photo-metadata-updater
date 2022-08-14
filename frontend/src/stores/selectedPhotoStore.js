import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSelectedPhotoStore = defineStore('selectedPhotoStore', () => {
  const photo = ref('');
  
  const update = (selected) => {
    photo.value = selected;
  }

  return { photo, update };
});
