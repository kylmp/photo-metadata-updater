<template>
  <v-navigation-drawer color="divider" width="290" permanent>
    <PhotoList></PhotoList>
  </v-navigation-drawer>
</template>

<script>
import PhotoList from './sidenav-content/PhotoList.vue';

export default {
  name: 'AppSideNav',
  components: {
    PhotoList,
  }
}
</script>