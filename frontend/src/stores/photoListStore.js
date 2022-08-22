import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePhotoListStore = defineStore('photoListStore', () => {
  const photoList = ref(new Map());

  const updateAll = (newList) => {
    newList = newList.sort((a, b) => a.name.localeCompare(b.name))
    photoList.value = new Map();
    for (const metadata of newList) {
      photoList.value.set(metadata.name, metadata);
    }
  }

  const updateItem = (newMetadata) => {
    if (photoList.value.has(newMetadata.name)) {
      photoList.value.set(newMetadata.name, newMetadata);
    }
  }

  const getFullList = () => {
    return Array.from(photoList.value.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  return { photoList, updateAll, updateItem, getFullList };
}); 
