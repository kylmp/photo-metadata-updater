<template>
  <v-snackbar :color="color" :timeout="timeout" v-model="showSnackbar" bottom right>
    {{message}}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'

const defaultColor = 'primary';
const defaultTimeout = 3000;
const defaultMessage = 'Missing message text!';

const showSnackbar = ref(false);
const message = ref(defaultMessage);
const color = ref(defaultColor);
const timeout = ref(defaultTimeout);

const send = (data) => {
  const selectedColor = (typeof data === "string") ? defaultColor : data.color;
  showAlert(data, selectedColor || defaultColor);
}

const success = (data) => {
  showAlert(data, 'success');
}

const error = (data) => {
  showAlert(data, 'error');
}

const clear = () => {
  showSnackbar.value = false;
}

const showAlert = (data, selectedColor) => {
  clear();
  if (typeof data === "string") {
    message.value = data;
  }
  else {
    message.value = data.message || defaultMessage;
    timeout.value = data.timeout || defaultTimeout;
  }
  color.value = selectedColor;
  showSnackbar.value = true;
}

defineExpose({ send, success, error, clear }); // Explicitly expose these functions (private by default)
</script>

<style>
.v-snackbar__content {
  white-space: pre-line;
}
</style>