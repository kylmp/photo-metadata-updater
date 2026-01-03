<template>
<v-list density="compact" height="100%" v-model:selected="selection" class="photo-list">
  <div class="photo-list-header">
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
  </div>
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
const updateList = (directory) => {
  photoListStore.updateAll([]);
  selection.value = [];
  loadingMetadata.value = true;
  axios.put('/api/directory', {directory: directory}).then((result) => {
    loadingMetadata.value = false;
    if (result.data.length === 0) {
      alertStore.alert.send("Directory loaded, but no photos found");
    } else {
      photoListStore.updateAll(result.data);
    }
  }).catch((err) => { 
    loadingMetadata.value = false;

    let alertConfig;
    if (err.response && err.response.status === 400) {
      alertConfig = err.response.data === 'directory required' ? 
        {timeout: 5000, color: 'primary', message: "Directory path required!"} :
        {timeout: 5000, color: 'primary', message: "Directory not found, make sure to use the full path"};
    }
    else {
      alertConfig = {timeout: 5000, color: 'error', message: "Error loading photo list, is the app still running?"}
    }
    alertStore.alert.send(alertConfig);
  });
}
</script>

<style scoped>
.photo-list {
  overflow-y: auto;
  padding-top: 0;
}

.photo-list :deep(.v-list-subheader) {
  padding-top: 0;
  margin-top: 0;
}

.photo-list-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgb(var(--v-theme-surface));
  padding-bottom: 4px;
}

.v-list-item__append > .v-icon {
  margin-inline-start: 0;
}
</style>
