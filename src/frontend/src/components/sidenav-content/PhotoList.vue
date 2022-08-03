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
import { useDirectoryStore } from '../../stores/directoryStore';
import { useAlertStore } from '../../stores/alertStore';
import { useSelectedPhotoStore } from '../../stores/selectedPhotoStore';
import { useGeotaggedPhotoStore } from '../../stores/geotaggedPhotoStore';

const photos = ref([]);
const selection = ref([]);
const loadingMetadata = ref(false);
const alertStore = useAlertStore();
const directoryStore = useDirectoryStore();
const selectedPhotoStore = useSelectedPhotoStore();
const geotaggedPhotoStore = useGeotaggedPhotoStore();

// Update sidenav list when directory changes
directoryStore.$subscribe((mutation, state) => {
  updateList(state.directory);
});

// Add the globe icon to a photo when it gets geotagged
geotaggedPhotoStore.$subscribe((mutation, state) => {
  let updateIndex = -1;
  for (let i = 0; i < photos.value.length; i++) {
    if (photos.value[i].name === state.name) {
      updateIndex = i;
      break;
    }
  }
  if (updateIndex >= 0) {
    photos.value[updateIndex].isGeotagged = true;
  }
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
      photos.value = [];
      const alertConfig = (err.response.status === 400) ?
        {timeout: 5000, color: 'primary', message: "Directory not found, make sure to use the full path"} :
        {timeout: 5000, color: 'error', message: "Error loading photo list, is the app still running?"};
      alertStore.alert.send(alertConfig);
    });
  // Get photo list metadatas (slow - used for getting isGeotagged metadata to add globe icon)
  axios.get('/api/photo?dir='+encodeURI(directoryPath)+'&metadata=true').then((result) => {
      for (let photo in photos.value) {
        for (let meta in result.data) {
          if (photos.value[photo].name == result.data[meta].name) {
            photos.value[photo].isGeotagged = result.data[meta].isGeotagged;
          }
        }
      }
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