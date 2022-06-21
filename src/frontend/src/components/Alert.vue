<template>
  <v-snackbar
      :color="color"
      :timeout="timeout"
      v-model="showSnackbar"
      bottom
      right>
    {{message}}
  </v-snackbar>
</template>

<script>
export default {
  name: "AlertBox",
  data() {
    return{
      showSnackbar: false,
      message: '',
      color: 'primary',
      timeout: 3000,
      defaultTimeout: 3000,
      defaultMessage: 'Missing message text!'
    }
  },
  methods:{
    send(data) {
      if (typeof data === "string") {
        this.message = data;
        this.color = 'primary';
      }
      else {
        this.message = data.message || this.defaultMessage
        this.color = data.color || 'primary'
        this.timeout = data.timeout || this.defaultTimeout
      }
      this.showSnackbar = true
    },
    success(data) {
      if (typeof data === "string") {
        this.message = data;
      }
      else {
        this.message = data.message || this.defaultMessage
        this.timeout = data.timeout || this.defaultTimeout
      }
      this.color = 'success'
      this.showSnackbar = true
    },
    error(data) {
      if (typeof data === "string") {
        this.message = data;
      }
      else {
        this.message = data.message || this.defaultMessage
        this.timeout = data.timeout || this.defaultTimeout
      }
      this.color = 'error'
      this.showSnackbar = true
    }
  }
}
</script>