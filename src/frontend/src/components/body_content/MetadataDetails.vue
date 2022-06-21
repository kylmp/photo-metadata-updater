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
      <v-btn flat height="32" color="white" @click="resetFields">Reset</v-btn>
      <v-btn flat height="32" color="success">Save</v-btn>
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
        label="Latitude"
        placeholder="Latitude"
        v-model="latitude"
        variant="outlined"
        density="compact"
        @input="coordinatesUpdate"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Longitude"
        placeholder="Longitude"
        v-model="longitude"
        variant="outlined"
        density="compact"
        @input="coordinatesUpdate"
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'MetadataDetails',
  props: ['metadata'],
  emits: ["coordinates"],
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
  methods: {
    coordinatesUpdate () {
      this.ensureValidCoordinates();
      this.$emit('coordinates', {"latitude": this.latitude, "longitude": this.longitude});
    },
    ensureValidCoordinates() {
      this.latitude = (this.latitude > 90) ? 90 : this.latitude;
      this.latitude = (this.latitude < -90) ? -90 : this.latitude;
      this.longitude = (this.longitude > 180) ? 180 : this.longitude;
      this.longitude = (this.longitude < -180) ? -180 : this.longitude;
    },
    isGeotagged() {
      return this.longitude !== 0 || this.latitude !== 0;
    },
    resetFields() {
      this.elevation = this.$props.metadata.elevation;
      this.longitude = this.$props.metadata.coordinates.longitude;
      this.latitude = this.$props.metadata.coordinates.latitude;
      this.createDate = this.$props.metadata.createDate;
      this.createTime = this.$props.metadata.createTime;
      this.camera = this.$props.metadata.camera;
      this.coordinatesUpdate();
    }
  }
}
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
</style>