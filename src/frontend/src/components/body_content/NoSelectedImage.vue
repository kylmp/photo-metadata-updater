<template>
  <v-container fill-height fluid>
    <v-row justify="center" align="center" class="text-center">
        <div>
          <span class="text-h6">{{title}}</span>
          <br>
          <span class="text-body-1">{{body}}</span>
        </div>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'NoSelectedImage',
  props: ['type'],
  data: () => ({
    title: '',
    body: '',
  }),
  created() {
    switch (this.$props.type) {
      case 'notfound':
        this.title = 'Image Not Found'
        this.body = 'Was it moved, renamed or deleted? Try refreshing the file list with the fetch button above.'
        break;
      case 'error':
        this.title = 'Error Loading Image'
        this.body = 'Unexpected error loading image, please ensure the backend is running and try again.'
        break;
      default:
        this.title = 'No Image Selected'
        this.body = 'Enter the full path to a directory above, then select an image from the sidebar.'
    }
  },
}
</script>

<style scoped>
.v-row {
  height: calc(100vh - 64px);
}
</style>