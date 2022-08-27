<template>
  <v-main>
    <v-container v-if="!noImage">
      <v-row>
        <v-col>
          <metadata-display :metadata="metadata"></metadata-display>
        </v-col>
      </v-row>
      <v-row class="pt-4 fill-height" justify="center">
        <v-col class="pr-0 mr-0">
          <image-display :projection="metadata.projection" :name="metadata.name"></image-display>
        </v-col>
        <v-col>
          <map-display/>
        </v-col>
      </v-row>
    </v-container>
    <no-image-display v-if="noImage" :type="noImageType"></no-image-display>
  </v-main>
</template>

<script setup>
import { ref, inject } from 'vue'
import MetadataDisplay from './body-content/MetadataDisplay.vue';
import ImageDisplay from './body-content/ImageDisplay.vue';
import MapDisplay from './body-content/MapDisplay.vue';
import NoImageDisplay from './body-content/NoImageDisplay.vue';
import { useSettingsStore } from '../stores/settingsStore';
import { useSelectedPhotoStore } from '../stores/selectedPhotoStore';
import { useDirectoryStore } from '../stores/directoryStore';
import { useCoordinatesStore } from '../stores/coordinatesStore';

const axios = inject('axios');
const selectedPhotoStore = useSelectedPhotoStore();
const directoryStore = useDirectoryStore();
const coordinatesStore = useCoordinatesStore();
const settingsStore = useSettingsStore();
const metadata = ref({});
const noImage = ref(true);
const noImageType = ref('unselected');

// When directory changes, clear app body to unselect previous image
directoryStore.$subscribe(() => {
  noImage.value = true;
  noImageType.value = 'unselected';
});

// Update to demo mode view if enabled
settingsStore.$subscribe((mutation, state) => {
  if (state.demo) {
    noImageType.value = 'demo';
  }
});

// Fetch photo metadata when selected image changes
selectedPhotoStore.$subscribe((mutation, state) => {
  axios.get('/api/metadata?name='+encodeURI(state.photo.name)).then(res => {
    metadata.value = res.data;
    noImage.value = false;
    coordinatesStore.update(res.data.latitude, res.data.longitude, true);
  })
  .catch((err) => { 
    noImage.value = true;
    noImageType.value = (err.response.status === 400) ? 'notfound' : 'error';
  });
});
</script>
