<template>
  <v-img :src="source"></v-img>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['photoName']);
const base = import.meta.env.VITE_BASE_URL || '';
const source = ref(`${base}/img/${props.photoName}`);

watch(() => props.photoName, (newPhoto) => {
  source.value = `${base}/img/${newPhoto}`;
});
</script>

<style scoped>
.v-img {
  height: calc(100vh - 256px);
  max-height: calc(100vh - 256px);
}
</style>
