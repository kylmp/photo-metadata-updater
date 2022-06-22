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
        @click="itemClicked(i)">
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

export default {
  name: 'PhotoList',
  props: ['directory'],
  data: () => ({
    photos: [],
    loadingMetadata: false,
    selection: []
  }),
  methods: {
    async updateList (directoryPath) {
      this.loadingMetadata = true;
      // Get photo list (fast)
      axios
        .get('/api/photo?dir='+encodeURI(directoryPath)).then((result) => {
          if (result.data.length === 0) {
            this.$root.alert.send("Directory loaded, but no photos found")
          }
          this.photos = result.data.sort((a, b) => a.name.localeCompare(b.name));
        }).catch((err) => { 
          this.photos = [];
          const alertConfig = (err.response.status === 400) ?
            {timeout: 5000, color: 'primary', message: "Directory not found, make sure to use the full path"} :
            {timeout: 5000, color: 'error', message: "Error loading photo list, is the backend running?"};
          this.$root.alert.send(alertConfig);
        });
      // Get photo metadata list (slow) - used for displaying if photos are already geotagged
      axios.get('/api/photo?dir='+encodeURI(directoryPath)+'&metadata=true').then((result) => {
          for (let photo in this.photos) {
            for (let meta in result.data) {
              if (this.photos[photo].name == result.data[meta].name) {
                this.photos[photo].isGeotagged = result.data[meta].isGeotagged;
              }
            }
          }
          this.loadingMetadata = false;
        }).catch(() => { 
          this.loadingMetadata = false;
        });
    },
    itemClicked (index) {
      this.$emit('selectedPhoto', this.photos[index])
    }
  },
  watch: { 
    directory: {
      handler(newDir) {
        this.updateList(newDir.dir);
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.v-avatar {
  max-height: 32px;
}
</style>