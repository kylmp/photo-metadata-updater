import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAlertStore = defineStore('alertStore', () => {
  const alert = ref('');

  const update = (al) => {
    alert.value = al;
  }

  return { alert, update };
}); 
