<template>
<v-list density="compact" height="100%" v-model:selected="selection">
  <v-list-subheader>
    <span>Photo List ({{photoList.size}} item{{photoList.size == 1 ? '' : 's'}})</span>
    <v-progress-circular 
      v-if="loadingMetadata" 
      indeterminate 
      color="list-load" 
      :size="15" 
      :width="3" 
      class="ml-2">
    </v-progress-circular>
  </v-list-subheader>
  <batch-processing-launcher v-if="photoList.size > 0" :disabled="loadingMetadata"/>
  <v-list-item
    v-for="(photo, i) in photoList.values()"
    :key="photo.name"
    :value="i"
    :title="photo.name"
    min-height="32"
    active-color="img-name"
    @click="photoSelected(photo.name)">
    <template v-slot:append v-if="photo.isGeotagged === true">
      <v-icon size="x-small">mdi-earth</v-icon>
    </template>
  </v-list-item>
</v-list>
</template>

<script setup>
import { ref, inject } from 'vue';
import { storeToRefs } from 'pinia'
import SSE from '../../assets/sse';
import BatchProcessingLauncher from '../batch-processing/BatchProcessingLauncher.vue';
import { useDirectoryStore } from '../../stores/directoryStore';
import { useAlertStore } from '../../stores/alertStore';
import { useSelectedPhotoStore } from '../../stores/selectedPhotoStore';
import { usePhotoListStore } from '../../stores/photoListStore';

const axios = inject('axios');
const alertStore = useAlertStore();
const directoryStore = useDirectoryStore();
const selectedPhotoStore = useSelectedPhotoStore();
const photoListStore = usePhotoListStore();
const base = import.meta.env.VITE_BASE_URL || '';

const { photoList } = storeToRefs(photoListStore);
const selection = ref([]);
const loadingMetadata = ref(false);

// Update photoList with new content when directory changes
directoryStore.$subscribe((mutation, state) => {
  updateList(state.directory);
});

// New photo selected, update selected photo store to let rest of app know which is active
const photoSelected = (name) => {
  const selected = photoList.value.get(name);
  selectedPhotoStore.update({name: selected.name});
}

// Get list of photos in selected directory, then stream in metadata for each photo
const updateList = (directoryPath) => {
  selection.value = [];
  loadingMetadata.value = true;
  axios.get('/api/directory?path='+encodeURI(directoryPath)).then((result) => {
      if (result.data.length === 0) {
        alertStore.alert.send("Directory loaded, but no photos found");
      } else {
        photoListStore.updateAll(result.data);
        loadMetadata();
      }
    }).catch((err) => { 
      loadingMetadata.value = false;
      photoListStore.updateAll([]);
      const alertConfig = (err.response && err.response.status === 400) ?
        {timeout: 5000, color: 'primary', message: "Directory not found, make sure to use the full path"} :
        {timeout: 5000, color: 'error', message: "Error loading photo list, is the app still running?"};
      alertStore.alert.send(alertConfig);
    });
}

// SSE request to stream in metadata for each photo in the list
const loadMetadata = () => {
  const loadMetadataRequest = new SSE(`${base}/api/directory`, {
    headers: {'Content-Type': 'application/json'}, 
    payload: JSON.stringify(Array.from(photoList.value.values()))
  });

  loadMetadataRequest.onmessage = (msg) => {
    const { type, status, data } = JSON.parse(msg.data);
    if (type === 'message' && status === 'success') {
      photoListStore.updateItem(data);
    }
    else if (type === 'close') {
      loadingMetadata.value = false;
      loadMetadataRequest.close();
    }
  };

  loadMetadataRequest.stream();
}
</script>

<style scoped>
.v-list-item__append > .v-icon {
  margin-inline-start: 0;
}
</style>