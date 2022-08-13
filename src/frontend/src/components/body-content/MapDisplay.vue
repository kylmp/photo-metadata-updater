<template>
  <bing-map v-if="provider === 'BING'" :apikey="apikey"></bing-map>
  <google-map v-if="provider === 'GOOGLE'" :apikey="apikey"></google-map>
  <div v-if="apikey === ''">Loading...</div>
</template>

<script setup>
import { ref, inject } from 'vue'
import BingMap from './maps/BingMap.vue';
import GoogleMap from './maps/GoogleMap.vue';

const axios = inject('axios');
const provider = ref('');
const apikey = ref('');

axios.get('/api/maps-api-key').then((response) => {
  provider.value = response.data.provider;
  apikey.value = response.data.key;
}).catch(() => {
  provider.value = 'BING';
  apikey.value = 'NO-API-KEY';
})
</script>
