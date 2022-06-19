<template>
  <v-app>
    <AppHeader></AppHeader>
    <PhotoList></PhotoList>
    <v-main>
      <AppBody></AppBody>
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
  }
}
</script>

<style>
</style>