<template>
<v-row>
  <v-col cols="12" md="8">
    <div id="details-title" class="text-subtitle-2 mt-1">
      Location and Metadata for 
      <span class="text-primary">IMG_20220530_114358_810_812_HDR.jpg</span>
    </div>
  </v-col>
  <v-col cols="12" md="4" class="text-right">
    <v-btn flat height="32" color="success">Save Metadata</v-btn>
  </v-col>
</v-row>
<v-row>
  <v-col cols="12" md="4" hide-details="true">
    <v-text-field
      label="Camera"
      placeholder="Camera"
      variant="outlined"
      density="compact"
    ></v-text-field>
  </v-col>
  <v-col cols="12" md="4" hide-details="true">
    <v-text-field
      label="Resolution"
      placeholder="Resolution"
      variant="outlined"
      density="compact"
    ></v-text-field>
  </v-col>
  <v-col cols="12" md="4" hide-details="true">
    <v-text-field
      label="File Size"
      placeholder="File Size"
      variant="outlined"
      density="compact"
    ></v-text-field>
  </v-col>
  <v-col cols="12" md="4" hide-details="true">
    <v-text-field
      label="Date Taken"
      placeholder="Date Taken"
      variant="outlined"
      density="compact"
    ></v-text-field>
  </v-col>
  <v-col cols="12" md="4" hide-details="true">
    <v-text-field
      label="Longitude"
      placeholder="Longitude"
      variant="outlined"
      density="compact"
    ></v-text-field>
  </v-col>
  <v-col cols="12" md="4" hide-details="true">
    <v-text-field
      label="Latitude"
      placeholder="Latitude"
      variant="outlined"
      density="compact"
    ></v-text-field>
  </v-col>
</v-row>
</template>

<script>
export default {
  name: 'MetadataDetails',
}
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
</style>