<template>
  <v-app>
    <app-header/>
    <app-side-nav/>
    <app-body/>
    <global-alert ref="alert"/>
  </v-app>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue';
import AppBody from './components/AppBody.vue';
import AppSideNav from './components/AppSideNav.vue';
import GlobalAlert from './components/global-components/Alert.vue';
import { useAlertStore } from './stores/alertStore';
import { ref, onMounted } from 'vue';

const alertStore = useAlertStore();
const alert = ref(null);

onMounted(() => {
  alertStore.update(alert.value);
});
</script>