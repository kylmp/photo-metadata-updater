<template>
<v-card id="batch-process-window">
  <v-row id="batch-process-container">
    <v-col sm="3" class="batch-process-col">
      <filtered-list :show-tooltip="showTooltip"/>
    </v-col>
    <v-col sm="9" class="batch-process-col">
      <div id="overflow-container">
        <v-container id="filter-container" class="process-config-view pt-1">
          <batch-processing-label label="Filter Options" closeButton="true" @closed="$emit('closed')"/>
          <filter-builder :key="filterKey"/>
        </v-container>
        <v-divider class="mt-3"></v-divider>
        <v-container id="adjustments-container" class="process-config-view">
          <batch-processing-label label="Metadata Adjustments"/>
          <adjustment-builder :key="adjustmentKey" ref="adjustmentsBuilderComponent"/>
        </v-container>
      </div>
    </v-col>
  </v-row>
  <v-card-actions>
    <v-btn color="img-name" block @click="process">Update Photos</v-btn>
  </v-card-actions>
</v-card>
<v-dialog v-model="showSummary" persistent>
  <batch-processing-summary @close="confirmationClosed"/>
</v-dialog>
</template>

<script setup>
import { ref } from 'vue';
import { useAlertStore } from '../../stores/alertStore'
import BatchProcessingSummary from './BatchProcessingSummary.vue'
import BatchProcessingLabel from './BatchProcessingLabel.vue';
import FilteredList from './views/FilteredList.vue';
import FilterBuilder from './views/FilterBuilder.vue';
import AdjustmentBuilder from './views/AdjustmentBuilder.vue';

const emit = defineEmits(['closed']);

const alertStore = useAlertStore();
const adjustmentsBuilderComponent = ref(null);
const showTooltip = ref(false);
const showSummary = ref(false);
const filterKey = ref(Date.now());
const adjustmentKey = ref(Date.now());

setTimeout(() => showTooltip.value = true, 3000);

const process = () => {
  const adjustments = adjustmentsBuilderComponent.value.calculateAdjustments();
  if (adjustments === null) {
    alertStore.alert.error("Please fix the invalid adjustment fields");
  }
  else if (Object.keys(adjustments).length === 0) {
    alertStore.alert.send("No adjustments to make, add some!");
  }
  else {
    showSummary.value = true;
  }
}

const confirmationClosed = (refresh = false) => {
  showSummary.value = false;
  if (refresh) {
    filterKey.value = Date.now();
    adjustmentKey.value = Date.now();
  }
}
</script>

<style scoped>
#batch-process-window {
  height: calc(100vh - 60px);
  width: calc(100vw - 60px);
  max-width: 1200px;
  min-width: 920px; 
}

#batch-process-container {
  overflow: hidden;
  height: calc(100vh - 84px);
  max-height: calc(100vh - 84px);
  padding: 16px 16px 0 16px;
}

.batch-process-col {
  height: 100%;
  padding-left: 0;
  padding-right: 0;
}

#overflow-container {
  height: 100%;
  overflow-y: auto;
  padding-right: 18px;
  padding-left: 6px;
}

.process-config-view {
  padding-left: 12px;
  padding-right: 0;
}

:deep(.process-config-view .v-row) {
  height: 64px;
}

:deep(.v-input--horizontal) {
  height: 40px;
}

:deep(.v-input.v-select .v-field) {
  padding-right: 4px;
}

:deep(.v-input.v-select .v-field__input) {
  padding-right: 0;
}

:deep(.v-field__clearable) {
  margin: 0;
}
</style>