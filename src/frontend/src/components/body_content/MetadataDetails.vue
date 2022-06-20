<template>
  <v-row>
    <v-col cols="12" md="8">
      <div id="details-title" class="text-subtitle-2 mt-1">
        <span>Metadata for </span>
        <span class="text-primary">{{metadata.name}}</span>
        <span class="text-grey-darken-1 pl-2">({{metadata.size}}, {{metadata.resolution}})</span>
      </div>
    </v-col>
    <v-col cols="12" md="4" class="text-right">
      <v-btn flat height="32" color="success">Save Metadata</v-btn>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12" md="4" hide-details="true">
      <!-- TODO: Update to use date picker when released in vuetify v3.1 -->
      <v-text-field
        label="Date (YYYY-MM-DD)"
        placeholder="YYYY-MM-DD"
        v-model="createDate"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <!-- TODO: Update to use time picker when released in vuetify v3.1 -->
      <v-text-field
        label="Time (HH:MM:SS)"
        placeholder="HH:MM:SS"
        v-model="createTime"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Camera Model"
        placeholder="Camera Model"
        v-model="camera"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Elevation (Meters)"
        placeholder="Elevation"
        v-model="elevation"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Longitude"
        placeholder="Longitude"
        v-model="longitude"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Latitude"
        placeholder="Latitude"
        v-model="latitude"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'MetadataDetails',
  props: ['metadata'],
  watch: { 
    metadata: async function(newData) { 
      this.elevation = newData.elevation;
      this.longitude = newData.coordinates.longitude;
      this.latitude = newData.coordinates.latitude;
      this.createDate = newData.createDate;
      this.createTime = newData.createTime;
      this.camera = newData.camera;
    }
  },
  data: () => ({
    elevation: '',
    longitude: '',
    latitude: '',
    createDate: '',
    createTime: '',
    camera: ''
  }),
}
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
</style>