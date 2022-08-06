<template>
<v-list density="compact" height="100%" v-model:selected="selection">
  <v-list-subheader>
    <span>Photo List ({{photos.length}} item{{photos.length == 1 ? '' : 's'}})</span>
    <v-progress-circular 
      v-if="loadingMetadata" 
      indeterminate 
      color="list-load" 
      :size="15" 
      :width="3" 
      class="ml-2">
    </v-progress-circular>
  </v-list-subheader>
  <batch-processing-launcher v-if="photos.length > 0" :disabled="loadingMetadata"/>
  <v-list-item
    v-for="(photo, i) in photos"
    :key="photo.name"
    :value="i"
    :title="photo.name"
    min-height="32"
    active-color="img-name"
    @click="photoSelected(i)">
    <template v-slot:append v-if="photo.isGeotagged === true">
      <v-icon size="x-small">mdi-earth</v-icon>
    </template>
  </v-list-item>
</v-list>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import BatchProcessingLauncher from '../batch-processing/BatchProcessingLauncher.vue'
import { useDirectoryStore } from '../../stores/directoryStore';
import { useAlertStore } from '../../stores/alertStore';
import { useSelectedPhotoStore } from '../../stores/selectedPhotoStore';
import { usePhotoListStore } from '../../stores/photoListStore';

const photos = ref([]);
const selection = ref([]);
const loadingMetadata = ref(false);
const alertStore = useAlertStore();
const directoryStore = useDirectoryStore();
const selectedPhotoStore = useSelectedPhotoStore();
const photoListStore = usePhotoListStore();

// Update sidenav list when directory changes
directoryStore.$subscribe((mutation, state) => {
  updateList(state.directory);
});

// Refresh list when metadata gets updated
photoListStore.$subscribe(() => {
  photos.value = photoListStore.getFullList();
})

const photoSelected = (index) => {
  const selected = photos.value[index];
  selectedPhotoStore.update({name: selected.name, path: selected.path});
}

const updateList = async (directoryPath) => {
  selection.value = [];
  loadingMetadata.value = true;
  // Get photo list names & paths (fast)
  axios.get('/api/photo?dir='+encodeURI(directoryPath)).then((result) => {
      if (result.data.length === 0) {
        alertStore.alert.send("Directory loaded, but no photos found")
      }
      photos.value = result.data.sort((a, b) => a.name.localeCompare(b.name));
    }).catch((err) => { 
      photoListStore.updateAll([]);
      const alertConfig = (err.response.status === 400) ?
        {timeout: 5000, color: 'primary', message: "Directory not found, make sure to use the full path"} :
        {timeout: 5000, color: 'error', message: "Error loading photo list, is the app still running?"};
      alertStore.alert.send(alertConfig);
    });
  // Get photo list with full metadata (slower)
  axios.get('/api/photo?dir='+encodeURI(directoryPath)+'&metadata=true').then((result) => {
      photoListStore.updateAll(result.data);
      loadingMetadata.value = false;
    }).catch(() => { 
      loadingMetadata.value = false;
    });
}
</script>

<style scoped>
.v-list-item__append > .v-icon {
  margin-inline-start: 0;
}
</style>