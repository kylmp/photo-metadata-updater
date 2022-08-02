<template>
  <v-app>
    <app-header></app-header>
    <app-side-nav></app-side-nav>
    <app-body></app-body>
    <global-alert ref="alert"></global-alert>
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import AppBody from './components/AppBody.vue';
import AppSideNav from './components/AppSideNav.vue';
import GlobalAlert from './components/global-components/Alert.vue';
import { useAlertStore } from './stores/alertStore';

export default {
  name: 'PhotoMetadataUpdater',
  components: {
    AppHeader,
    AppBody,
    AppSideNav,
    GlobalAlert
  },
  setup() {
    const alertStore = useAlertStore();
    return { alertStore };
  },
  mounted() {
    this.alertStore.update(this.$refs.alert);
  },
}
</script>