<template>
  <v-container height="100%">
    <v-row>
        <v-col>
            <MetadataDetails></MetadataDetails>
        </v-col>
    </v-row>
    <v-row class="pt-4 fill-height" justify="center" align="center">
        <v-col>
            <ImageDisplay></ImageDisplay>
        </v-col>
        <v-col>map</v-col>
    </v-row>
  </v-container>
</template>

<script>
import MetadataDetails from './body_content/MetadataDetails.vue';
import ImageDisplay from './body_content/ImageDisplay.vue';

export default {
  name: 'AppBody',
  components: {
    MetadataDetails,
    ImageDisplay,
  }
}
</script>

<style scoped>
</style>