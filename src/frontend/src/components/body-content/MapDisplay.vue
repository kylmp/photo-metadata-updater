<template>
  <BingMap v-if="provider === 'BING'" :apikey="apikey"></BingMap>
  <GoogleMap v-if="provider === 'GOOGLE'" :apikey="apikey"></GoogleMap>
  <div v-if="!loaded">Loading...</div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'
import BingMap from './maps/BingMap.vue';
import GoogleMap from './maps/GoogleMap.vue';

export default {
  name: 'MapDisplay',
  components: {
    BingMap,
    GoogleMap,
  },
  setup() {
    const loaded = ref(false);
    const provider = ref('');
    const apikey = ref('');

    axios.get('/api/maps-api-key').then((response) => {
      provider.value = response.data.provider;
      apikey.value = response.data.key;
      loaded.value = true;
    });

    return { loaded, provider, apikey };
  },
}
</script>
