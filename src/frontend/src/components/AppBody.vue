<template>
  <v-main>
    <v-container v-if="!noImage">
      <v-row>
        <v-col>
          <MetadataDisplay :metadata="metadata"></MetadataDisplay>
        </v-col>
      </v-row>
      <v-row class="pt-4 fill-height" justify="center">
        <v-col class="pr-0 mr-0">
          <ImageDisplay :projection="metadata.projection" :name="metadata.name" @error="imageLoadError"></ImageDisplay>
        </v-col>
        <v-col>
          <MapDisplay></MapDisplay>
        </v-col>
      </v-row>
    </v-container>
    <NoImageDisplay v-if="noImage" :type="noImageType"></NoImageDisplay>
  </v-main>
</template>

<script>
import axios from 'axios'
import { ref } from 'vue'
import MetadataDisplay from './body-content/MetadataDisplay.vue';
import ImageDisplay from './body-content/ImageDisplay.vue';
import MapDisplay from './body-content/MapDisplay.vue';
import NoImageDisplay from './body-content/NoImageDisplay.vue';
import { useSelectedPhotoStore } from '../stores/selectedPhotoStore';
import { useDirectoryStore } from '../stores/directoryStore';
import { useCoordinatesStore } from '../stores/coordinatesStore';

export default {
  name: 'AppBody',
  components: {
    MetadataDisplay,
    ImageDisplay,
    MapDisplay,
    NoImageDisplay
  },
  setup() {
    const selectedPhotoStore = useSelectedPhotoStore();
    const directoryStore = useDirectoryStore();
    const coordinatesStore = useCoordinatesStore();
    const metadata = ref({});
    const noImage = ref(true);
    const noImageType = ref('unselected');

    const imageLoadError = () => {
      noImage.value = true;
      noImageType.value = 'error';
    }

    // When directory changes, clear app body to unselect previous image
    directoryStore.$subscribe(() => {
      noImage.value = true;
      noImageType.value = 'unselected';
    });

    // Fetch photo metadata when selected image changes
    selectedPhotoStore.$subscribe((mutation, state) => {
      axios.get('/api/photo?file='+encodeURI(state.photo.path)).then(res => {
        metadata.value = res.data;
        noImage.value = false;
        coordinatesStore.update(res.data.coordinates.latitude, res.data.coordinates.longitude);
      })
      .catch((err) => { 
        noImage.value = true;
        noImageType.value = (err.response.status === 400) ? 'notfound' : 'error';
      });
    });

    return { metadata, noImage, noImageType, imageLoadError };
  },
}
</script>