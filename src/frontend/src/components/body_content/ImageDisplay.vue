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
import EquirectangularImage from './image_projections/EquirectangularProjection.vue';
import DefaultImage from './image_projections/DefaultProjection.vue';
import axios from 'axios';

export default {
  name: 'ImageDisplay',
  props: ['projection', 'name'],
  components: {
    EquirectangularImage,
    DefaultImage,
  },
  data: () => ({
    isAvailable: false,
    photoName: ''
  }),
  methods: {
    wait (ms = 500) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }
  },
  watch: { 
    name: async function(newPhoto) { 
      this.isAvailable = false;
      this.photoName = '';
      let start = Date.now();
      while (this.isAvailable === false || (Date.now() - start) >= 30000) {
        this.isAvailable = await axios.get('/api/photo-available?name='+newPhoto);
        await this.wait(200);
      }
      this.photoName = newPhoto;
    }
  }
}
</script>

<style scoped>
</style>