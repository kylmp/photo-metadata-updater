<template>
  <v-app>
    <app-header/>
    <app-side-nav/>
    <app-body/>
    <global-alert ref="alert"/>
  </v-app>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue';
import AppHeader from './components/AppHeader.vue';
import AppBody from './components/AppBody.vue';
import AppSideNav from './components/AppSideNav.vue';
import GlobalAlert from './components/global-components/Alert.vue';
import { useAlertStore } from './stores/alertStore';
import { useSettingsStore } from './stores/settingsStore';

const axios = inject('axios');
const settingsStore = useSettingsStore();
const alertStore = useAlertStore();
const alert = ref(null);

axios.get('/api/settings').then(res => {
  settingsStore.update(res.data);
})

onMounted(() => {
  alertStore.update(alert.value);
});
</script>

<style>
.v-overlay--active.v-tooltip > .v-overlay__content {
  opacity: 0.95!important;
  background: rgb(var(--v-theme-primary))!important;
  transition: none!important;
  color: #eee;
}

.false-leave-active.false-leave-to {
  transition: none!important;
}
</style>
