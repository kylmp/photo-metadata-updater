import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePhotoListStore = defineStore('photoListStore', () => {
  const photoList = ref(new Map());

  const updateAll = (newList) => {
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

  const getByName = (photoName) => {
    return photoList.value.get(photoName);
  }

  const getFullList = () => {
    return Array.from(photoList.value.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  return { photoList, updateAll, updateItem, getByName, getFullList };
}); 
