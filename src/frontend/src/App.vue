<template>
  <v-app>
    <AppHeader @directory="directoryUpdated"></AppHeader>
    <PhotoList :directory="directory" @selected-photo="onPhotoSelected"></PhotoList>
    <v-main>
      <AppBody :photo="selectedPhoto"></AppBody>
    </v-main>
    <AlertBox ref="alert"></AlertBox>
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import AppBody from './components/AppBody.vue';
import PhotoList from './components/PhotoList.vue';
import AlertBox from './components/Alert.vue';

export default {
  name: 'App',
  components: {
    AppHeader,
    AppBody,
    PhotoList,
    AlertBox
  },
  mounted() {
    this.$root.alert = this.$refs.alert
  },
  methods: {
    onPhotoSelected (value) {
      this.selectedPhoto = value;
    },
    directoryUpdated (dir) {
      this.directory = dir;
    }
  },
  data: () => ({
    selectedPhoto: {},
    directory: '',
  }),
}
</script>

<style>
</style>