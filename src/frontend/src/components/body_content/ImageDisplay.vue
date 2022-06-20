<template>
    <DefaultImage></DefaultImage>
    <EquirectangularImage v-if="false"></EquirectangularImage>
</template>

<script>
import EquirectangularImage from './image_projections/EquirectangularProjection.vue';
import DefaultImage from './image_projections/DefaultProjection.vue';

export default {
  name: 'ImageDisplay',
  components: {
    EquirectangularImage,
    DefaultImage,
  }
}
</script>

<style scoped>
</style>