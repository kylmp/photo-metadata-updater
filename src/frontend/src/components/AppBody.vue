<template>
  <v-container height="100%">
    <v-row>
        <v-col>
            <MetadataDetails></MetadataDetails>
        </v-col>
    </v-row>
    <v-row class="pt-4 fill-height" justify="center">
        <v-col class="pr-0 mr-0">
            <ImageDisplay></ImageDisplay>
        </v-col>
        <v-col>
            <BingMap></BingMap>
        </v-col>
    </v-row>
  </v-container>
  <NoSelectedImage v-if="false"></NoSelectedImage>
</template>

<script>
import MetadataDetails from './body_content/MetadataDetails.vue';
import ImageDisplay from './body_content/ImageDisplay.vue';
import BingMap from './body_content/BingMap.vue';
import NoSelectedImage from './body_content/NoSelectedImage.vue';

export default {
  name: 'AppBody',
  components: {
    MetadataDetails,
    ImageDisplay,
    BingMap,
    NoSelectedImage
  }
}
</script>

<style scoped>
</style>