<template>
  <v-snackbar :color="color" :timeout="timeout" v-model="showSnackbar" bottom right>
    {{message}}
  </v-snackbar>
</template>

<script>
import { ref } from 'vue'

export default {
  name: "GlobalAlert",
  setup() {
    const showSnackbar = ref(false);
    const message = ref('');
    const color = ref('primary');
    const timeout = ref(3000);
    const defaultTimeout = ref(3000);
    const defaultMessage = ref('Missing message text!');

    const send = (data) => {
      clear();
      if (typeof data === "string") {
        message.value = data;
        color.value = 'primary';
      }
      else {
        message.value = data.message || defaultMessage.value
        color.value = data.color || 'primary'
        timeout.value = data.timeout || defaultTimeout.value
      }
      showSnackbar.value = true
    }

    const success = (data) => {
      clear();
      if (typeof data === "string") {
        message.value = data;
      }
      else {
        message.value = data.message || defaultMessage.value
        timeout.value = data.timeout || defaultTimeout.value
      }
      color.value = 'success'
      showSnackbar.value = true
    }

    const error = (data) => {
      clear();
      if (typeof data === "string") {
        message.value = data;
      }
      else {
        message.value = data.message || defaultMessage.value
        timeout.value = data.timeout || defaultTimeout.value
      }
      color.value = 'error'
      showSnackbar.value = true
    }

    const clear = () => {
      showSnackbar.value = false;
    }

    return { color, timeout, showSnackbar, message, send, success, error, clear };
  },
}
</script>

<style>
.v-snackbar__content {
  white-space: pre-line;
}
</style>