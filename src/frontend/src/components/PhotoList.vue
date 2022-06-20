<template>
  <v-navigation-drawer color="primary-darken-3" width="290" permanent>
    <v-list density="compact" height="100%">
      <v-list-subheader>
        Photo List ({{photos.length}} item{{photos.length == 1 ? '' : 's'}})
        <v-progress-circular 
          v-if="loadingMetadata" 
          indeterminate 
          color="primary" 
          :size="15" 
          :width="3" 
          class="ml-2">
        </v-progress-circular>
      </v-list-subheader>
      <v-list-item
        v-for="(photo, i) in photos"
        :key="photo.name"
        :value="i"
        active-color="primary"
        @click="$emit('selectedPhoto', photos[i])">
        <v-list-item-title v-text="photo.name"></v-list-item-title>
        <v-spacer></v-spacer>
        <v-list-item-avatar v-if="photo.isGeotagged === true" class="pa-0 mt-0 mb-0 ml-n2 mr-n1 pr-n2">
          <v-icon size="x-small">mdi-earth</v-icon>
        </v-list-item-avatar>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import axios from 'axios'
import { directoryStore } from '@/stores/directory-path'
import { ref } from 'vue'

export default {
  name: 'PhotoList',
  setup() {
    const directory = directoryStore();
    let photos = ref([]);
    let loadingMetadata = ref(false);

    // Methods
    const updateList = async function (directoryPath) {
      loadingMetadata.value = true;
      // Get photo list (fast)
      axios
        .get('/api/photo?dir='+encodeURI(directoryPath))
        .then((result) => {
          photos.value = result.data.sort((a, b) => a.name.localeCompare(b.name));
        })
        .catch(() => { 
          photos.value = [];
          console.log('error getting list');
        });
      // Get photo metadata list (slow) - used for displaying if photos are already geotagged
      axios
        .get('/api/photo?dir='+encodeURI(directoryPath)+'&metadata=true')
        .then((result) => {
          for (let photo in photos.value) {
            for (let meta in result.data) {
              if (photos.value[photo].name == result.data[meta].name) {
                photos.value[photo].isGeotagged = result.data[meta].isGeotagged;
              }
            }
          }
          loadingMetadata.value = false;
        })
        .catch(() => { 
          loadingMetadata.value = false;
          console.log('error getting list metadata');
        });
    }

    directory.$subscribe((mutation, state) => {
      updateList(state.directory);
    });

    return {
      directory,
      photos,
      loadingMetadata,
      updateList,
    }
  },
}
</script>

<style scoped>
.v-avatar {
  max-height: 32px;
}
</style>