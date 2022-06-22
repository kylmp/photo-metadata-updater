<template>
  <v-container v-if="!noImage">
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
  <NoSelectedImage v-if="noImage" :type="noImageType"></NoSelectedImage>
</template>

<script>
import axios from 'axios'
import MetadataDetails from './body_content/MetadataDetails.vue';
import ImageDisplay from './body_content/ImageDisplay.vue';
import BingMap from './body_content/BingMap.vue';
import NoSelectedImage from './body_content/NoSelectedImage.vue';

export default {
  name: 'AppBody',
  props: ['photo', 'directory'],
  components: {
    MetadataDetails,
    ImageDisplay,
    BingMap,
    NoSelectedImage
  },
  data: () => ({
    metadata: {},
    coordinates: {"latitude": 0, "longitude": 0},
    noImage: true,
    noImageType: 'unselected'
  }),
  watch: { 
    photo: function(newPhoto) {
      this.loadImage(newPhoto);
    },
    coordinates: function(newCoordinates) {
      this.coordinates = newCoordinates;
    },
    directory: { 
      handler() {
        this.noImage = true;
        this.noImageType = 'unselected';
      },
      deep: true
    }
  },
  methods: {
    loadImage (newPhoto) {
      axios.get('/api/photo?file='+encodeURI(newPhoto.path)).then(res => {
        this.metadata = res.data;
        this.coordinates = res.data.coordinates;
        this.noImage = false;
      })
      .catch((err) => { 
        this.noImage = true;
        this.noImageType = (err.response.status === 400) ? 'notfound' : 'error';
      });
    }
  }
}
</script>

<style scoped>
</style>