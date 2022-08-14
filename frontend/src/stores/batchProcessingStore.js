import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBatchProcessingStore = defineStore('batchProcessingStore', () => {
  const filteredList = ref([]);

  const setFilteredList = (newList) => {
    filteredList.value = newList;
  }

  return { filteredList, setFilteredList };
}); 
