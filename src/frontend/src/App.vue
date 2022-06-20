<template>
  <v-app>
    <AppHeader></AppHeader>
    <PhotoList @selected-photo="onPhotoSelected"></PhotoList>
    <v-main>
      <AppBody :photo="selectedPhoto"></AppBody>
    </v-main>
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import AppBody from './components/AppBody.vue';
import PhotoList from './components/PhotoList.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppBody,
    PhotoList
  },
  methods: {
    onPhotoSelected (value) {
      this.selectedPhoto = value;
    }
  },
  data: () => ({
    selectedPhoto: {},
  }),
}
</script>

<style>
</style>