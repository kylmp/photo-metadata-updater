<template>
  <v-row>
    <v-col cols="12" md="8">
      <div id="details-title" class="text-subtitle-2 mt-1">
        <span>Metadata for </span>
        <span class="text-img-name">{{metadata.name}}</span>
        <span class="text-resolution pl-2">({{metadata.size}}, {{metadata.resolution}})</span>
      </div>
    </v-col>
    <v-col cols="12" md="4" class="text-right">
      <v-btn flat height="32" color="background" @click="setFields">Reset</v-btn>
      <v-btn flat height="32" width="72" color="btn-save" @click="saveMetadata">
        <span v-if="!saving && !saved">Save</span>
        <v-progress-circular 
          v-if="saving && !saved" 
          indeterminate 
          color="green-lighten-4" 
          :size="15" 
          :width="3">
        </v-progress-circular>
        <v-icon v-if="!saving && saved" size="large" color="green-lighten-4">mdi-check-bold</v-icon>
      </v-btn>
    </v-col>
  </v-row>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container class="pa-0 ma-0">
      <v-row>
        <v-col cols="12" md="4">
          <!-- TODO: Update to use date picker when released in vuetify v3.1 -->
          <v-text-field
            label="Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            v-model="createDate"
            :rules="createDateRules"
            variant="outlined"
            density="compact"
            hide-details="true"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <!-- TODO: Update to use time picker when released in vuetify v3.1 -->
          <v-text-field
            label="Time (HH:MM:SS)"
            placeholder="HH:MM:SS"
            v-model="createTime"
            :rules="createTimeRules"
            variant="outlined"
            density="compact"
            hide-details="true"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="Camera Model"
            placeholder="Camera Model"
            v-model="camera"
            :rules="cameraRules"
            variant="outlined"
            density="compact"
            hide-details="true"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="Elevation (Meters)"
            placeholder="Elevation"
            v-model="elevation"
            :rules="elevationRules"
            variant="outlined"
            density="compact"
            hide-details="true"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="Latitude"
            placeholder="Latitude"
            v-model="latitude"
            :rules="latitudeRules"
            variant="outlined"
            density="compact"
            hide-details="true"
            @input="coordinatesUpdate"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="Longitude"
            placeholder="Longitude"
            v-model="longitude"
            :rules="longitudeRules"
            variant="outlined"
            density="compact"
            hide-details="true"
            @input="coordinatesUpdate"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import axios from 'axios'

export default {
  name: 'MetadataDetails',
  props: ['metadata', 'coordinates'],
  created() {
    this.setFields();
  },
  watch: { 
    metadata: function() { 
      this.setFields();
    },
    coordinates: function(newCoordinates) { 
      this.latitude = newCoordinates.latitude;
      this.longitude = newCoordinates.longitude;
      this.ensureValidCoordinates();
    }
  },
  data: () => ({
    saving: false,
    saved: false,
    valid: true,
    elevation: '',
    elevationRules: [
      v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)[Mm]?$/.test(v) || 'Elevation must be a +/- decimal number',
    ],
    longitude: '',
    longitudeRules: [
      v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || 'Longitude must be a +/- decimal number',
    ],
    latitude: '',
    latitudeRules: [
      v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || 'Latitude must be a +/- decimal number',
    ],
    createDate: '',
    createDateRules: [
      v => /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(v) || 'Create date format must be YYYY-MM-DD',
    ],
    createTime: '',
    createTimeRules: [
      v => /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/.test(v) || 'Create time format must be HH:MM:SS',
    ],
    camera: '',
    cameraRules: [
      v => !!v || 'Camera is required',
      v => (v && v.length <= 100) || 'Camera must be less than 100 characters',
    ],
  }),
  methods: {
    coordinatesUpdate () {
      this.ensureValidCoordinates();
      this.$emit('update:coordinates', {"latitude": this.latitude, "longitude": this.longitude});
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
    setFields() {
      this.elevation = this.$props.metadata.elevation;
      this.longitude = this.$props.metadata.coordinates.longitude;
      this.latitude = this.$props.metadata.coordinates.latitude;
      this.createDate = this.$props.metadata.createDate;
      this.createTime = this.$props.metadata.createTime;
      this.camera = this.$props.metadata.camera;
      this.coordinatesUpdate();
    },
    async saveMetadata() {
      this.saving = true;
      const result = await this.$refs.form.validate();
      if (result.valid === true) {
        const updatedData = {
          "file": this.$props.metadata.path,
          "date": this.createDate,
          "time": this.createTime,
          "camera": this.camera,
          "elevation": this.elevation,
          "latitude": this.latitude,
          "longitude": this.longitude
        }
        axios.post('/api/photo', updatedData).then(() => {
          this.saving = false;
          this.saved = true;
          setTimeout(() => { this.saved = false; }, 3000);
          this.$root.alert.success({message: "Photo updated", timeout: 3000})
        }).catch(err => {
          this.$root.alert.error(err);
          this.saving = false;
        })
      }
      else {
        this.saving = false;
        const errorString = result.errors.map(err => err.errorMessages[0]).join("\n");
        this.$root.alert.error({message: errorString, timeout: 10000});
      }
    }
  }
}
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
</style>