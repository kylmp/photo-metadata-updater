<template>
<v-list density="compact" height="100%" class="pb-0 pt-0">
  <v-list-subheader>Filtered Photos ({{filteredList.length}} item{{filteredList.length == 1 ? '' : 's'}})</v-list-subheader>
  <v-list-item v-for="(photo, i) in filteredList"
    :title="photo.name"
    min-height="28">
    <v-tooltip activator="parent" location="end" v-if="showTooltip" transition="false">
      <table>
        <tr>
          <td><b>Created:</b></td>
          <td>{{photo.date}} {{photo.time}}</td>
        </tr>
        <tr>
          <td><b>Timezone:</b></td>
          <td>{{photo.timezone}}</td>
        </tr>
        <tr>
          <td><b>Coordinates:&nbsp;&nbsp;</b></td>
          <td>({{photo.latitude.toFixed(4)}}, {{photo.longitude.toFixed(4)}})</td>
        </tr>
        <tr>
          <td><b>Elevation:</b></td>
          <td>{{photo.elevation}}m</td>
        </tr>
        <tr>
          <td><b>Projection:</b></td>
          <td>{{photo.projection}}</td>
        </tr>
      </table>
    </v-tooltip>
  </v-list-item>
</v-list>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useBatchProcessingStore } from '../../../stores/batchProcessingStore';

defineProps(['showTooltip']);

const batchProcessingStore = useBatchProcessingStore();
const { filteredList } = storeToRefs(batchProcessingStore);
</script>

<style scoped>
.v-list-item:hover {
  color: rgb(var(--v-theme-img-name));
  cursor: default;
}
</style>
