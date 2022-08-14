import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useDirectoryStore = defineStore('directoryStore', () => {
  const directory = ref('');
  const time =  ref(Date.now());
  
  const update = (dir) => {
    directory.value = dir;
    time.value = Date.now();
  }

  return { directory, time, update };
});
