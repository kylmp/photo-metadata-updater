<template>
<v-card width="650" height="400">
  <v-container id="confirmation-container">
    <v-row id="confirmation-header">
      <span class="text-h6">{{title}}</span>
      <v-spacer></v-spacer>
      <v-icon size="large" v-if="processing.status === 'unprocessed'" @click="closeWindow(false)" style="opacity: 0.5">mdi-window-close</v-icon>
    </v-row>
    <v-row v-if="processing.status === 'unprocessed'">
      <v-list density="compact" class="mb-n4">
        <v-list-subheader>Updating {{total}} Photo{{total === 1 ? '' : 's'}}</v-list-subheader>
        <v-list-item v-for="item in summaryItems" :key="item.key">
          <template v-slot:prepend><v-icon :icon="item.icon"></v-icon></template>
          <v-list-item-title>{{item.text}}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-row>
    <v-row v-if="processing.status === 'processing'">
      <v-row justify="center" align="center" class="text-center" style="height: 300px">
        <v-progress-circular :model-value="processing.percent" color="primary" width="10" size="120">
          {{processing.count.processed}}/{{total}}
        </v-progress-circular>
      </v-row>
    </v-row>
    <v-row v-if="processing.status === 'processed'">
      <v-row id="results-container" justify="center" align="center" class="text-center pt-4">
        <v-icon v-if="result.icon !== ''" :icon="result.icon" class="pr-8"></v-icon>
        <span>
          <span class="text-h6">{{result.text}}</span>
          <span v-if="result.subtext !== ''">{{result.subtext}}</span>
        </span>
      </v-row>
    </v-row>
  </v-container>
  <v-card-actions>
    <v-btn v-if="processing.status === 'unprocessed'" block color="img-name" @click="process">Confirm and Process Photos</v-btn>
    <v-btn v-if="processing.status === 'processing'" block color="error" @click="cancel">Cancel</v-btn>
    <v-btn v-if="processing.status === 'processed' && !canRevert" plain width="100%" @click="closeWindow(false)">Close</v-btn>
    <v-btn v-if="processing.status === 'processed' && canRevert" plain width="50%" @click="revert">Revert Changes</v-btn>
    <v-btn v-if="processing.status === 'processed' && canRevert" plain width="50%" color="img-name" @click="confirm">Confirm Changes</v-btn>
  </v-card-actions>
</v-card>
</template> 

<script setup>
import { ref, inject } from 'vue';
import { useBatchProcessingStore } from '../../stores/batchProcessingStore'
import { usePhotoListStore } from '../../stores/photoListStore'
import { useAlertStore } from '../../stores/alertStore';
import SSE from '../../assets/sse';

const emit = defineEmits(['close']);
const axios = inject('axios');

const batchProcessingStore = useBatchProcessingStore();
const photoListStore = usePhotoListStore();
const alertStore = useAlertStore();

var batchUpdateRequest;
const base = import.meta.env.VITE_BASE_URL || '';
const total = batchProcessingStore.filteredList.length;
const batchUpdateResults = [];

const canRevert = ref(false);
const summaryItems = ref([]);
const title = ref('Batch Update Summary');
const result = ref({text: '', subtext: '', icon: ''});
const processing = ref({status: 'unprocessed'});

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
  title.value = 'Processing...';
  processing.value = {
    status: 'processing', 
    count: {processed: 0, success: 0, error: 0},
    percent: 0, 
    step: 100/total,
    errors: []
  };

  batchUpdateRequest = new SSE(`${base}/api/metadata`, {
    headers: {'Content-Type': 'application/json'}, 
    payload: JSON.stringify(batchProcessingStore.getAdjustedFilteredList())
  });
  batchUpdateRequest.onmessage = batchUpdateMessageHandler;
  batchUpdateRequest.onerror500 = handle500Error;
  batchUpdateRequest.stream();
}

const handle500Error = () => {
  processing.value.status = 'processed';
  title.value = 'Error';
  result.value.text = 'Error connecting to server';
  result.value.icon = 'mdi-close-thick';
}

const batchUpdateMessageHandler = (msg) => {
  const { type, status, data } = JSON.parse(msg.data);
  if (type === 'message') {
    handlePhotoUpdated(status, data);
  }
  else if (type === 'close') {
    handleRequestCompletion(status);
  }
};

const handlePhotoUpdated = (status, data) => {
  if (status === 'success') {
    processing.value.count.success++;
    batchUpdateResults.push(data);
  } else {
    processing.value.count.error++;
    processing.value.errors.push(data);
  }
  processing.value.count.processed++;
  processing.value.percent += processing.value.step;
}

const handleRequestCompletion = (status) => {
  processing.value.status = 'processed';
  title.value = '';

  if (status === 'success') {
    processing.value.count.unprocessed = total - processing.value.count.processed;
    const {success, error, unprocessed} = processing.value.count;
    const state = (success === total) ? 'success' : (error === total) ? 'error' : (unprocessed === total) ? 'unprocessed' : 'partial';
    switch(state) {
      case 'success':
        title.value = 'Success';
        result.value.text = `Updated ${success} photo${success === 1 ? '' : 's'}`;
        result.value.icon = 'mdi-check-bold';
        canRevert.value = true;
        break;
      case 'partial':
        title.value = `Partial Update`;
        let resultText = `${success} photo${success === 1 ? '' : 's'} updated`;
        resultText += (unprocessed > 0) ? `\n${unprocessed} photo${unprocessed === 1 ? '' : 's'} were not processed` : '';
        resultText += (error > 0) ? `\n${error} photo${error === 1 ? '' : 's'} failed to update` : '';
        result.value.text = resultText;
        result.value.subtext = (error > 0) ? getErrorSubtext() : '';
        canRevert.value = true;
        break;
      case 'unprocessed':
        title.value = 'Unprocessed';
        result.value.text = `All ${total} photo${total === 1 ? '' : 's'} were not processed`;
        result.value.icon = 'mdi-alert-circle';
        canRevert.value = false;
        break;
      case 'error':
        title.value = 'Error';
        result.value.text = `All ${total} photo${total === 1 ? '' : 's'} failed to update!`;
        result.value.subtext = getErrorSubtext();
        canRevert.value = false;
        break;
    }
  } else {
    title.value = 'Error';
    result.value.text = 'Unexpected error processing photos';
    result.value.icon = 'mdi-close-thick';
  }

  batchUpdateRequest.close();
}

const getErrorSubtext = () => {
  // reduced = map<key: error text, value: array of photo names with that error>
  const reduced = processing.value.errors.reduce((reduced, add) => {
    const currentValue = reduced[add.error];
    if (currentValue === undefined) {
      reduced[add.error] = [];
    }
    reduced[add.error].push(add.name);
    return reduced;
  }, {});

  let subtext = '\n\nErrors:';
  for (let error of Object.keys(reduced)) {
    const amountWithError = reduced[error].length;
    subtext += `\n${error} (${amountWithError} photo${amountWithError === 1 ? '' : 's'})`;
  }
  return subtext;
}

const cancel = () => {
  axios.get('/api/metadata/cancel-batch-update');
}

const revert = () => {
  axios.get('/api/metadata/backup').then(() => {
    alertStore.alert.send("Batch update changes were reverted")
  });
  closeWindow(false);
}

const confirm = () => {
  axios.delete('/api/metadata/backup');
  for (const updatedMetadata of batchUpdateResults) {
    photoListStore.updateItem(updatedMetadata);
  }
  closeWindow(true);
}

const closeWindow = (refresh) => {
  emit('close', refresh);
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

#results-container {
  height: 300px; 
  white-space: pre-line; 
  overflow-y: auto;
}
</style>
