<template>
  <v-navigation-drawer color="divider" width="290" permanent>
    <photo-list></photo-list>
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