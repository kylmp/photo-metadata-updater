<template>
    <v-img :src="'img/' + photoName"></v-img>
</template>

<script>
export default {
  name: 'DefaultImage',
  props: ['photoName'],
}
</script>

<style scoped>
.v-img {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>