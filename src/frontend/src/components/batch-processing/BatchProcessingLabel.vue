<template>
<v-row no-gutters class="mb-n8 ml-n3">
  <span class="text-subtitle-1 text-img-name">{{props.label}}</span>
</v-row>
</template>

<script setup>
const props = defineProps(['label']);
</script>