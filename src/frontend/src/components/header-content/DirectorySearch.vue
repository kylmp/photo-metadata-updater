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
import { useAlertStore } from '../../stores/alertStore';
import { useDirectoryStore } from '../../stores/directoryStore';

const directoryStore = useDirectoryStore();
const alertStore = useAlertStore();
const directory = ref('');

const updateDirectory = () => {
  if (!directory.value) {
    alertStore.alert.error("Directory path required!");
    return;
  }
  directoryStore.update(directory.value);
}
</script>