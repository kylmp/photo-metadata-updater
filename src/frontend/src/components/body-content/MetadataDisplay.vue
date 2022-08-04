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
      <v-btn flat height="32" width="72" color="btn-save" v-on="saveWarningEnabled ? { click: () => { dialog = true } } : { click: saveMetadata }">
        <span v-if="!saving && !saveComplete">Save</span>
        <v-progress-circular 
          v-if="saving && !saveComplete" 
          indeterminate 
          color="green-lighten-4" 
          :size="15" 
          :width="3">
        </v-progress-circular>
        <v-icon v-if="!saving && saveComplete" size="large" color="green-lighten-4">mdi-check-bold</v-icon>
        <v-dialog v-model="dialog" v-if="saveWarningEnabled">
          <v-card title="Confirm Save">
            <v-card-text>
              <b>Saving metadata cannot be undone</b><br>
              It's recommended to make a backup of the photo before saving
            </v-card-text>
            <v-card-actions>
              <v-btn flat @click="dialog = false">Exit</v-btn>
              <v-btn color="primary" flat @click="saveMetadata">Confirm</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-btn>
    </v-col>
  </v-row>
  <v-form ref="form" v-model="valid" lazy-validation>
    <v-container class="pa-0 ma-0">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            label="Local Date (YYYY-MM-DD)"
            placeholder="YYYY-MM-DD"
            v-model="createDate"
            :rules="createDateRules"
            variant="outlined"
            density="compact"
            hide-details="true"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            label="Local Time (HH:MM:SS)"
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
            label="Timezone Offset (+/-HHMM)"
            placeholder="+0000"
            v-model="offset"
            :rules="offsetRules"
            variant="outlined"
            density="compact"
            hide-details="true"
          >
          <template v-slot:append>
            <div class="tooltip" v-if="!gettingTimezone">
              <v-icon @click="calculateTimezone">mdi-magnify</v-icon>
              <span v-if="tooltipEnabled" class="tooltiptext">Calculate timezone from coordinates</span>
            </div>
            <v-progress-circular 
              v-if="gettingTimezone" indeterminate class="mr-1 ml-1 mt-1" :size="16" :width="3">
            </v-progress-circular>
          </template>
          </v-text-field>
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
            suffix="m"
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

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { useCoordinatesStore } from '../../stores/coordinatesStore'
import { useAlertStore } from '../../stores/alertStore'
import { useOptionsStore } from '../../stores/optionsStore'
import { useGeotaggedPhotoStore } from '../../stores/geotaggedPhotoStore'

const props = defineProps(['metadata']);

const geotaggedPhotoStore = useGeotaggedPhotoStore();
const coordinatesStore = useCoordinatesStore();
const alertStore = useAlertStore();
const optionsStore = useOptionsStore();
const form = ref(null);
const saving = ref(false);
const saveComplete = ref(false);
const gettingTimezone = ref(false);
const tooltipEnabled = ref(optionsStore.showTooltip);
const saveWarningEnabled = ref(optionsStore.saveWarning);
const dialog = ref(false);
const valid = ref(true);
const elevation = ref('');
const elevationRules = ref([
  v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || 'Elevation must be a +/- decimal number',
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
const offset = ref('');
const offsetRules = ref([
  v => /^[+-]{1}[0-1]{1}[0-9]{1}[0-5]{1}[0-9]{1}$/.test(v) || 'Offset must be in format (+/-)HHMM\nTIP: click the search icon to calculate timezone offset from coordinates',
]);

const ensureValidCoordinates = () => {
  latitude.value = (latitude.value > 90) ? 90 : latitude.value;
  latitude.value = (latitude.value < -90) ? -90 : latitude.value;
  longitude.value = (longitude.value > 180) ? 180 : longitude.value;
  longitude.value = (longitude.value < -180) ? -180 : longitude.value;
}

// Update coordinates store on coordinates changes (So the map can recieve updates)
const coordinatesUpdate = () => {
  ensureValidCoordinates();
  coordinatesStore.update(parseFloat(latitude.value), parseFloat(longitude.value));
}

const geotagPhoto = (name, lat, lon) => {
  if (lat != '0' || lon != '0') {
    geotaggedPhotoStore.update(name);
  }
}

const setFields = () => {
  elevation.value = props.metadata.elevation;
  longitude.value = props.metadata.coordinates.longitude;
  latitude.value = props.metadata.coordinates.latitude;
  createDate.value = props.metadata.createDate;
  createTime.value = props.metadata.createTime;
  offset.value = props.metadata.tzOffset;
  coordinatesUpdate();
}

const saveMetadata = async () => {
  dialog.value = false;
  saving.value = true;
  const result = await form.value.validate();
  if (result.valid === true) {
    const updatedData = {
      "file": props.metadata.path,
      "date": createDate.value,
      "time": createTime.value,
      "elevation": elevation.value,
      "latitude": latitude.value,
      "longitude": longitude.value,
      "tzOffset": offset.value,
    }
    axios.post('/api/photo', updatedData).then(() => {
      saving.value = false;
      saveComplete.value = true;
      if (!props.metadata.isGeotagged) {
        geotagPhoto(props.metadata.name, latitude.value, longitude.value);
      }
      setTimeout(() => { saveComplete.value = false; }, 3000);
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

const calculateTimezone = () => {
  gettingTimezone.value = true;
  const coordinates = `lat=${encodeURI(latitude.value)}&lon=${encodeURI(longitude.value)}`;
  const datetime = `date=${encodeURI(createDate.value)}&time=${encodeURI(createTime.value)}`;
  axios.get(`/api/calculate-timezone?${coordinates}&${datetime}`).then(res => {
    offset.value = res.data;
    gettingTimezone.value = false;
  }).catch((err) => {
    alertStore.alert.error(err.response.data);
    gettingTimezone.value = false;
  });
}

setFields();

// Listen to metadata changes to load new values (when a new photo is selected)
watch(() => props.metadata, () => {
  setFields();
});

// Listen to coordinates store to update coordinates fields (i.e. from user clicking on the map)
coordinatesStore.$subscribe((mutation, state) => {
  latitude.value = state.coordinates.lat;
  longitude.value = state.coordinates.lon;
  ensureValidCoordinates();
});

// Listen to options store for enabling/disabling save warning and/or calculate tz tooltip
optionsStore.$subscribe((mutation, state) => {
  tooltipEnabled.value = state.showTooltip;
  saveWarningEnabled.value = state.saveWarning;
});
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
:deep(.v-input--horizontal .v-input__append) {
  margin-left: 6px;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 150px;
  background-color: #1f1f23bb;
  color: #ddd;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: -5px;
  right: 120%;
  margin-left: -60px;
}

.tooltip:hover .tooltiptext {
  visibility: visible;
}
</style>