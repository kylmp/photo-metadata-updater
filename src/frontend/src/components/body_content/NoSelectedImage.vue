<template>
  <v-container fill-height fluid>
    <v-row justify="center" align="center" class="text-center">
        <div>
          <span class="text-h6">No Image Selected</span>
          <br>
          <span class="text-body-1">Enter the full path to a directory above, then select an image from the sidebar.</span>
        </div>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NoSelectedImage',
}
</script>

<style scoped>
.v-row {
  height: calc(100vh - 64px);
}
</style>