<template>
<v-row no-gutters class="mb-n8 ml-n3">
  <span class="text-subtitle-1 text-img-name">{{props.label}}</span>
  <v-spacer></v-spacer>
  <v-icon v-if="props.closeButton === 'true'" icon="mdi-window-close" @click="$emit('closed')"></v-icon>
</v-row>
</template>

<script setup>
const props = defineProps(['label', 'closeButton']);
defineEmits(['closed']);
</script>

<style scoped>
.v-icon {
  opacity: 0.6;
}
</style>