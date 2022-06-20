<template>
    <v-img src="img/vert.jpg"></v-img>
</template>

<script>
export default {
  name: 'ImageDisplay',
}
</script>

<style scoped>
.v-img {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>