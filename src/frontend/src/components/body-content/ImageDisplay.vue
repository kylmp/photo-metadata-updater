<template>
  <default-image v-if="type !== 'equirectangular'" :photoName="photoName"></default-image>
  <equirectangular-image v-if="type === 'equirectangular'" :photoName="photoName"></equirectangular-image>
</template>

<script>
import { ref, watch } from 'vue'
import EquirectangularImage from './image-projections/EquirectangularProjection.vue';
import DefaultImage from './image-projections/DefaultProjection.vue';

export default {
  name: 'ImageDisplay',
  props: ['projection', 'name'],
  components: {
    EquirectangularImage,
    DefaultImage,
  },
  setup(props) {
    const photoName = ref(props.name);
    const type = ref(props.projection);

    watch(() => props.name, () => {
      photoName.value = props.name;
      type.value = props.projection;
    });

    return { photoName, type };
  }
}
</script>