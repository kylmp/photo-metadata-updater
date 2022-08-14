<template>
<v-list-item class="ma-n1">
  <v-list-item-title class="pa-0 ma-0">
    <v-btn variant="text" block height="32" color="img-name" :disabled="props.disabled" @click="showBatchProcessingMenu = true">
      Batch Update Photos
    </v-btn>
  </v-list-item-title>
</v-list-item>
<v-dialog v-model="showBatchProcessingMenu">
  <batch-image-processor @closed="showBatchProcessingMenu = false"/>
</v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import BatchImageProcessor from './BatchImageProcessor.vue';

const props = defineProps(['disabled']);

const showBatchProcessingMenu = ref(false);
</script>