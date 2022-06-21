<template>
  <v-container v-if="Object.keys(photo).length !== 0" height="100%">
    <v-row>
      <v-col>
        <MetadataDetails :metadata="metadata" v-model:coordinates="coordinates"></MetadataDetails>
      </v-col>
    </v-row>
    <v-row class="pt-4 fill-height" justify="center">
      <v-col class="pr-0 mr-0">
        <ImageDisplay :projection="metadata.projection" :name="metadata.name"></ImageDisplay>
      </v-col>
      <v-col>
        <BingMap v-model:coordinates="coordinates"></BingMap>
      </v-col>
    </v-row>
  </v-container>
  <NoSelectedImage v-if="Object.keys(photo).length === 0"></NoSelectedImage>
</template>

<script>
import axios from 'axios'
import MetadataDetails from './body_content/MetadataDetails.vue';
import ImageDisplay from './body_content/ImageDisplay.vue';
import BingMap from './body_content/BingMap.vue';
import NoSelectedImage from './body_content/NoSelectedImage.vue';

export default {
  name: 'AppBody',
  props: ['photo'],
  components: {
    MetadataDetails,
    ImageDisplay,
    BingMap,
    NoSelectedImage
  },
  data: () => ({
    metadata: {},
    coordinates: {"latitude": 0, "longitude": 0},
  }),
  watch: { 
    photo: function(newPhoto) { 
      axios.get('/api/photo?file='+encodeURI(newPhoto.path)).then(res => {
        this.metadata = res.data;
        this.coordinates = res.data.coordinates;
      })
      .catch(() => { 
        console.log('error getting photo metadata');
      });
    },
    coordinates: function(c) {
      this.coordinates = c;
    }
  },
  methods: {
    coordinatesUpdated (coords) {
      this.coordinates = coords;
    }
  }
}
</script>

<style scoped>
</style>