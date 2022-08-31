<template>
  <v-text-field 
    class="mt-9"
    density="compact" 
    label="Photo directory full path" 
    placeholder="Photo directory full path" 
    v-model="directory"
    variant="outlined"
    @keydown.enter.prevent="updateDirectory">
  </v-text-field>
  <v-btn @click="updateDirectory">Fetch</v-btn>
</template>

<script setup>
import { ref } from 'vue'
import { useDirectoryStore } from '../../stores/directoryStore';

const directoryStore = useDirectoryStore();
const directory = ref('');

const updateDirectory = () => {
  directoryStore.update(directory.value);
}
</script>
