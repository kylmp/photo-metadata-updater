<template>
  <v-container fill-height fluid>
    <v-row justify="center" align="center" class="text-center">
        <div>
          <span class="text-h6">{{title}}</span>
          <br>
          <span class="text-body-1">{{body}}</span>
        </div>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['type']);

const title = ref('');
const body = ref('');

watch(() => props.type, () => {
  update(props.type);
});

const update = (type) => {
  switch (type) {
    case 'notfound':
      title.value = 'Image Not Found'
      body.value = 'Was it moved, renamed or deleted? Try refreshing the file list with the fetch button above.'
      break;
    case 'error':
      title.value = 'Error Loading Image'
      body.value = 'Unexpected error loading image, please ensure the backend is running and try again.'
      break;
    case 'demo':
      title.value = 'Demo Mode'
      body.value = 'Enter any value into the directory search bar above, then press enter to load photos'
      break;
    default:
      title.value = 'No Image Selected'
      body.value = 'Enter the full path to a directory above, then select an image from the sidebar.'
  }
}

update(props.type);
</script>

<style scoped>
.v-row {
  height: calc(100vh - 64px);
}
</style>