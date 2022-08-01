<template>
    <v-img :src="source"></v-img>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'DefaultImage',
  props: ['photoName'],
  setup(props) {
    const source = ref(`img/${props.photoName}`);

    watch(() => props.photoName, (newPhoto) => {
      source.value = `img/${newPhoto}`;
    });

    return { source };
  },
}
</script>

<style scoped>
.v-img {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>