<template>
    <DefaultImage 
      v-if="isAvailable && projection !== 'equirectangular'"
      :photoName="photoName">
    </DefaultImage>
    <EquirectangularImage 
      v-if="isAvailable && projection === 'equirectangular'"
      :photoName="photoName">
    </EquirectangularImage>
    <div v-if="!isAvailable">Loading...</div>
</template>

<script>
import { ref, watch } from 'vue'
import EquirectangularImage from './image-projections/EquirectangularProjection.vue';
import DefaultImage from './image-projections/DefaultProjection.vue';
import axios from 'axios';

export default {
  name: 'ImageDisplay',
  props: ['projection', 'name'],
  components: {
    EquirectangularImage,
    DefaultImage,
  },
  setup(props) {
    const pollInterval = ref(100);
    const timeout = ref(30000);
    const isAvailable = ref(false);
    const photoName = ref('');

    const loadPhoto = async () => {
      isAvailable.value = false;
      photoName.value = '';
      const start = Date.now();
      while (isAvailable.value === false || (Date.now() - start) >= timeout.value) {
        isAvailable.value = await axios.get('/api/photo-available?name='+props.name);
        await wait();
      }
      photoName.value = props.name;
    }

    loadPhoto();

    watch(() => props.name, () => {
      loadPhoto();
    });

    const wait = () => {
      return new Promise(resolve => {
        setTimeout(resolve, pollInterval.value);
      });
    }

    return { isAvailable, photoName };
  },
}
</script>