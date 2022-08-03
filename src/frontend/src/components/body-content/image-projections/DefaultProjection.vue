<template>
  <v-img :src="source"></v-img>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['photoName']);

const source = ref(`img/${props.photoName}`);

watch(() => props.photoName, (newPhoto) => {
  source.value = `img/${newPhoto}`;
});
</script>

<style scoped>
.v-img {
  height: calc(100vh - 256px);
  max-height: calc(100vh - 256px);
}
</style>