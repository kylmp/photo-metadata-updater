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
import { ref, watch } from 'vue'
import axios from 'axios'
import { useCoordinatesStore } from '../../stores/coordinatesStore'
import { useAlertStore } from '../../stores/alertStore'

export default {
  name: 'MetadataDisplay',
  props: ['metadata'],
  setup(props) {
    const coordinatesStore = useCoordinatesStore();
    const alertStore = useAlertStore();
    const form = ref(null);
    const saving = ref(false);
    const saved = ref(false);
    const valid = ref(true);
    const elevation = ref('');
    const elevationRules = ref([
      v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)[Mm]?$/.test(v) || 'Elevation must be a +/- decimal number',
    ]);
    const longitude = ref('');
    const longitudeRules = ref([
      v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || 'Longitude must be a +/- decimal number',
      v => v <= 180 && v >= -180 || 'Longitude should be between -180 to 180',
    ]);
    const latitude = ref('');
    const latitudeRules = ref([
      v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || 'Latitude must be a +/- decimal number',
      v => v <= 90 && v >= -90 || 'Latitude should be between -90 to 90',
    ]);
    const createDate = ref('');
    const createDateRules = ref([
      v => /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(v) || 'Create date format must be YYYY-MM-DD',
    ]);
    const createTime = ref('');
    const createTimeRules = ref([
      v => /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/.test(v) || 'Create time format must be HH:MM:SS',
    ]);
    const camera = ref('');
    const cameraRules = ref([
      v => !!v || 'Camera is required',
      v => (v && v.length <= 100) || 'Camera must be less than 100 characters',
    ]);

    const ensureValidCoordinates = () => {
      latitude.value = (latitude.value > 90) ? 90 : latitude.value;
      latitude.value = (latitude.value < -90) ? -90 : latitude.value;
      longitude.value = (longitude.value > 180) ? 180 : longitude.value;
      longitude.value = (longitude.value < -180) ? -180 : longitude.value;
    }

    const coordinatesUpdate = () => {
      ensureValidCoordinates();
      coordinatesStore.update(parseFloat(latitude.value), parseFloat(longitude.value));
    }

    const setFields = () => {
      elevation.value = props.metadata.elevation;
      longitude.value = props.metadata.coordinates.longitude;
      latitude.value = props.metadata.coordinates.latitude;
      createDate.value = props.metadata.createDate;
      createTime.value = props.metadata.createTime;
      camera.value = props.metadata.camera;
      coordinatesUpdate();
    }

    const saveMetadata = async () => {
      saving.value = true;
      const result = await form.value.validate();
      if (result.valid === true) {
        const updatedData = {
          "file": props.metadata.path,
          "date": createDate.value,
          "time": createTime.value,
          "camera": camera.value,
          "elevation": elevation.value,
          "latitude": latitude.value,
          "longitude": longitude.value
        }
        axios.post('/api/photo', updatedData).then(() => {
          saving.value = false;
          saved.value = true;
          setTimeout(() => { saved.value = false; }, 3000);
          alertStore.alert.success({message: "Photo updated", timeout: 3000})
        }).catch(err => {
          alertStore.alert.error(err);
          saving.value = false;
        })
      }
      else {
        saving.value = false;
        const errorString = result.errors.map(err => err.errorMessages[0]).join("\n");
        alertStore.alert.error({message: errorString, timeout: 10000});
      }
    }

    setFields();

    watch(() => props.metadata, () => {
      setFields();
    });

    coordinatesStore.$subscribe((mutation, state) => {
      latitude.value = state.coordinates.lat;
      longitude.value = state.coordinates.lon;
      ensureValidCoordinates();
    });

    return {
      form, valid, saved, saving, 
      elevation, elevationRules, latitude, latitudeRules, longitude, longitudeRules, 
      camera, cameraRules, createDate, createDateRules, createTime, createTimeRules, 
      coordinatesUpdate, setFields, saveMetadata
    }
  },
}
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
</style>