<template>
<v-list density="compact" height="100%" class="pb-0 pt-0">
  <v-list-subheader>Filtered Photos ({{filteredList.length}} items)</v-list-subheader>
  <v-list-item v-for="(photo, i) in filteredList"
    :title="photo.name"
    min-height="28">
    <v-tooltip activator="parent" location="end" v-if="showTooltip" transition="false">
      <table>
        <tr>
          <td><b>Created:</b></td>
          <td>{{photo.createDate}} {{photo.createTime}}</td>
        </tr>
        <tr>
          <td><b>Timezone:</b></td>
          <td>{{photo.tzOffset}}</td>
        </tr>
        <tr>
          <td><b>Coordinates:&nbsp;&nbsp;</b></td>
          <td>({{photo.coordinates.latitude.toFixed(4)}}, {{photo.coordinates.longitude.toFixed(4)}})</td>
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
defineProps(['filteredList', 'showTooltip']);
</script>

<style scoped>
.v-list-item:hover {
  color: rgb(var(--v-theme-img-name));
  cursor: default;
}
</style>