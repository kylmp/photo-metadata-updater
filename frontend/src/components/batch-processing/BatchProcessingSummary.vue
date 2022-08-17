<template>
<v-card width="650" height="400">
  <v-container id="confirmation-container">
    <v-row id="confirmation-header">
      <span class="text-h6">{{title}}</span>
      <v-spacer></v-spacer>
      <v-icon size="large" @click="closeWindow" style="opacity: 0.5">mdi-window-close</v-icon>
    </v-row>
    <v-row v-if="!processing && !result.hasResult">
      <v-list density="compact" class="mb-n4">
        <v-list-subheader>Updating {{numberAffected}} Photo{{numberAffected === 1 ? '' : 's'}}</v-list-subheader>
        <v-list-item v-for="item in summaryItems" :key="item.key">
          <template v-slot:prepend><v-icon :icon="item.icon"></v-icon></template>
          <v-list-item-title>{{item.text}}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-row>
    <v-row v-if="processing">
      <v-row justify="center" align="center" class="text-center" style="height: 300px">
        <v-progress-circular indeterminate color="primary" width="10" size="120"></v-progress-circular>
      </v-row>
    </v-row>
    <v-row v-if="result.hasResult">
      <v-row justify="center" align="center" class="text-center" style="height: 300px">
        <v-icon :icon="result.icon"></v-icon>
        <span class="text-h6">&nbsp;&nbsp;&nbsp;{{result.text}}</span>
      </v-row>
    </v-row>
  </v-container>
  <v-card-actions>
    <v-btn block color="img-name" @click="process" :disabled="processing || result.hasResult">
      Confirm and Process Photos
    </v-btn>
  </v-card-actions>
</v-card>
</template> 

<script setup>
import { ref, inject } from 'vue';
import { useBatchProcessingStore } from '../../stores/batchProcessingStore'
import { usePhotoListStore } from '../../stores/photoListStore'

const axios = inject('axios');
const emit = defineEmits(['close']);

const batchProcessingStore = useBatchProcessingStore();
const photoListStore = usePhotoListStore();

const numberAffected = batchProcessingStore.filteredList.length;
const summaryItems = ref([]);
const title = ref('Batch Update Summary');
const processing = ref(false);
const result = ref({hasResult: false, text: '', icon: ''});

const populateSummaryText = () => {
  for (let adjustment of Object.values(batchProcessingStore.getAdjustments())) {
    let text;
    if (adjustment.type === 'set') {
      text = (adjustment.adjustment.value === 'calculate') ? 
        'Calculate timezone from coordinates' :
        `Set ${adjustment.key} to ${adjustment.adjustment.value}`;
    }
    else {
      text = (adjustment.component !== 'datetime') ?
        `Adjust ${adjustment.key} by ${adjustment.adjustment.value > 0 ? '+' : ''}${adjustment.adjustment.value}` :
        `Adjust ${adjustment.key} by ${generateDatetimeAdjustmentText(adjustment.adjustment)}`;
    }
    const metadataIcons = {
      date: 'mdi-calendar',
      time: 'mdi-clock',
      latitude: 'mdi-latitude',
      longitude: 'mdi-longitude',
      elevation: 'mdi-elevation-rise',
      timezone: 'mdi-map-clock',
    }
    summaryItems.value.push({key: adjustment.key, text: text, icon: metadataIcons[adjustment.key] || 'mdi-clock'});
  }
}

const generateDatetimeAdjustmentText = (adjustment) => {
  let units = [];
  for (let unit of Object.keys(adjustment)) {
    units.push(`${adjustment[unit] > 0 ? '+' : ''}${adjustment[unit]} ${unit}${adjustment[unit] >= 0 ? 's' : ''}`);
  }
  return units.join(', ');
}

const process = () => {
  processing.value = true;
  title.value = 'Processing...';
  axios.post('/api/photo', batchProcessingStore.getAdjustedFilteredList()).then(res => {
    photoListStore.updateItems(res.data);
    title.value = 'Success';
    result.value.text = `Updated ${res.data.length} photo${res.data.length === 1 ? '' : 's'}`;
    result.value.icon = 'mdi-check-bold';
  }).catch(err => {
    title.value = 'Error';
    result.value.text = (err.response.status === 400) ? `${err.response.data}` : 'Unexpected error processing photos'
    result.value.icon = 'mdi-close-thick';
  }).finally(() => {
    processing.value = false;
    result.value.hasResult = true;
    setTimeout(() => closeWindow(), (title.value === 'Success') ? 3000 : 6000);
  })
}

const closeWindow = () => {
  emit('close', title.value === 'Success');
}

populateSummaryText();
</script>

<style scoped>
#confirmation-header {
  height: 48px;
}

#confirmation-container {
  padding: 28px;
  height: 400px;
}
</style>