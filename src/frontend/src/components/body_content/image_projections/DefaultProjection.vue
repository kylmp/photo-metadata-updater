<template>
    <v-img :src="source"></v-img>
</template>

<script>
export default {
  name: 'DefaultImage',
  props: ['photoName'],
  watch: { 
    photoName: function(newPhoto) {
      this.source = `img/${newPhoto}`
    }
  },
  data: () => ({
    source: '',
  })
}
</script>

<style scoped>
.v-img {
    height: calc(100vh - 256px);
    max-height: calc(100vh - 256px);
}
</style>