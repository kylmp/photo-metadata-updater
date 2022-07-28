<template>
<v-list density="compact" height="100%">
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
    active-color="img-name"
    @click="photoSelected(i)">
    <v-list-item-title v-text="photo.name"></v-list-item-title>
    <v-spacer></v-spacer>
    <v-list-item-avatar v-if="photo.isGeotagged === true" class="pa-0 mt-0 mb-0 ml-n2 mr-n1 pr-n2">
      <v-icon size="x-small">mdi-earth</v-icon>
    </v-list-item-avatar>
  </v-list-item>
</v-list>
</template>

<script>
import axios from 'axios'
import { ref } from 'vue'
import { useDirectoryStore } from '../../stores/directoryStore';
import { useAlertStore } from '../../stores/alertStore';
import { useSelectedPhotoStore } from '../../stores/selectedPhotoStore';
import { useGeotaggedPhotoStore } from '../../stores/geotaggedPhotoStore';

export default {
  name: 'PhotoList',
  setup() {
    const photos = ref([]);
    const loadingMetadata = ref(false);
    const directoryStore = useDirectoryStore();
    const alertStore = useAlertStore();
    const selectedPhotoStore = useSelectedPhotoStore();
    const geotaggedPhotoStore = useGeotaggedPhotoStore();

    directoryStore.$subscribe((mutation, state) => {
      updateList(state.directory);
    });

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
      loadingMetadata.value = true;
      // Get photo list names & paths (fast)
      axios
        .get('/api/photo?dir='+encodeURI(directoryPath)).then((result) => {
          if (result.data.length === 0) {
            alertStore.alert.send("Directory loaded, but no photos found")
          }
          photos.value = result.data.sort((a, b) => a.name.localeCompare(b.name));
        }).catch((err) => { 
          photos.value = [];
          const alertConfig = (err.response.status === 400) ?
            {timeout: 5000, color: 'primary', message: "Directory not found, make sure to use the full path"} :
            {timeout: 5000, color: 'error', message: "Error loading photo list, is the backend running?"};
          alertStore.alert.send(alertConfig);
        });
      // Get photo list metadatas (slow - used for displaying if photos already have GPS coordinates)
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

    return { 
      photos,
      loadingMetadata,
      photoSelected
    }
  },
}
</script>

<style scoped>
.v-avatar {
  max-height: 32px;
}
</style>