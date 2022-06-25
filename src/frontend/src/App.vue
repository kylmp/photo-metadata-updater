<template>
  <v-app>
    <AppHeader></AppHeader>
    <AppSideNav></AppSideNav>
    <AppBody></AppBody>
    <GlobalAlert ref="alert"></GlobalAlert>
  </v-app>
</template>

<script>
import AppHeader from './components/AppHeader.vue';
import AppBody from './components/AppBody.vue';
import AppSideNav from './components/AppSideNav.vue';
import GlobalAlert from './components/global-components/Alert.vue';
import { useAlertStore } from './stores/alertStore';

export default {
  name: 'App',
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