<template>
  <v-row>
    <v-col sm="8" class="text-no-wrap">
      <div id="details-title" class="text-subtitle-2 mt-1">
        <span>Metadata for </span>
        <span class="text-img-name">{{metadata.name}}</span>
        <span class="text-resolution pl-2">({{metadata.size}}, {{metadata.resolution}})</span>
      </div>
    </v-col>
    <v-col sm="4" class="text-right">
      <v-btn flat height="32" color="background" @click="setFields">Reset</v-btn>
      <v-btn flat height="32" width="72" color="btn-save" v-on="saveWarningEnabled ? { click: warnBeforeSave } : { click: saveMetadata }">
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
        <v-col sm="4">
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
        <v-col sm="4">
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
        <v-col sm="4">
          <v-text-field
            label="Timezone Offset (+/-HH:MM)"
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
        <v-col sm="4">
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
        <v-col sm="4">
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
        <v-col sm="4">
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
import { ref, watch, inject } from 'vue'
import { useCoordinatesStore } from '../../stores/coordinatesStore'
import { useAlertStore } from '../../stores/alertStore'
import { useOptionsStore } from '../../stores/optionsStore'
import { usePhotoListStore } from '../../stores/photoListStore';
import { useSettingsStore } from '../../stores/settingsStore';

const axios = inject('axios');
const props = defineProps(['metadata']);

const coordinatesStore = useCoordinatesStore();
const alertStore = useAlertStore();
const optionsStore = useOptionsStore();
const photoListStore = usePhotoListStore();
const settingsStore = useSettingsStore();
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
  v => settingsStore.getRegex('number').test(v) || 'Elevation must be a +/- decimal number',
]);
const longitude = ref('');
const longitudeRules = ref([
  v => settingsStore.getRegex('number').test(v) || 'Longitude must be a +/- decimal number',
  v => v <= 180 && v >= -180 || 'Longitude should be between -180 to 180',
]);
const latitude = ref('');
const latitudeRules = ref([
  v => settingsStore.getRegex('number').test(v) || 'Latitude must be a +/- decimal number',
  v => v <= 90 && v >= -90 || 'Latitude should be between -90 to 90',
]);
const createDate = ref('');
const createDateRules = ref([
  v => settingsStore.getRegex('date').test(v) || 'Create date format must be YYYY-MM-DD',
]);
const createTime = ref('');
const createTimeRules = ref([
  v => settingsStore.getRegex('time').test(v) || 'Create time format must be HH:MM:SS',
]);
const offset = ref('');
const offsetRules = ref([
  v => settingsStore.getRegex('timezone').test(v) || 'Timezone offset must be in format (+/-)HH:MM\nTIP: click the search icon to calculate timezone offset from coordinates',
]);

const ensureValidCoordinates = () => {
  latitude.value = (latitude.value > 90) ? 90 : latitude.value;
  latitude.value = (latitude.value < -90) ? -90 : latitude.value;
  longitude.value = (longitude.value > 180) ? 180 : longitude.value;
  longitude.value = (longitude.value < -180) ? -180 : longitude.value;
}

// Update coordinates store on coordinates changes (So the map can recieve updates)
const coordinatesUpdate = () => {
  if (settingsStore.getRegex('number').test(latitude.value) && settingsStore.getRegex('number').test(longitude.value)) {
    ensureValidCoordinates();
    coordinatesStore.update(parseFloat(latitude.value), parseFloat(longitude.value));
  }
}

const setFields = () => {
  elevation.value = props.metadata.elevation;
  longitude.value = props.metadata.longitude;
  latitude.value = props.metadata.latitude;
  createDate.value = props.metadata.date;
  createTime.value = props.metadata.time;
  offset.value = props.metadata.timezone;
  coordinatesUpdate();
}

const validateBeforeContinue = async (continueFunction, skipTimezone = false) => {
  const result = await form.value.validate();
  if (result.valid === true ||
      skipTimezone && result.errors.length === 1 && result.errors[0].errorMessages[0].startsWith('Timezone')) {
    continueFunction();
  }
  else {
    const errorString = result.errors.map(err => err.errorMessages[0]).join("\n");
    alertStore.alert.error({message: errorString, timeout: 10000});
  }
}

const warnBeforeSave = () => {
  validateBeforeContinue(() => {
    alertStore.alert.clear();
    dialog.value = true;
  });
}

const saveMetadata = () => {
  validateBeforeContinue(() => {
    dialog.value = false;
    saving.value = true;
    const updatedData = [{
      "name": props.metadata.name,
      "date": createDate.value,
      "time": createTime.value,
      "elevation": elevation.value,
      "latitude": latitude.value,
      "longitude": longitude.value,
      "timezone": offset.value,
    }];
    axios.post('/api/photo', updatedData).then((newMetadata) => {
      saveComplete.value = true;
      photoListStore.updateItem(newMetadata.data[0]);
      setTimeout(() => { saveComplete.value = false; }, 3000);
      alertStore.alert.success({message: "Photo updated", timeout: 3000})
    }).catch(err => {
      alertStore.alert.error(err.response.data);
    }).finally(() => {
      saving.value = false;
    });
  });
}

const calculateTimezone = () => {
  validateBeforeContinue(() => {
    gettingTimezone.value = true;
    const coordinates = `lat=${encodeURI(latitude.value)}&lon=${encodeURI(longitude.value)}`;
    const datetime = `date=${encodeURI(createDate.value)}&time=${encodeURI(createTime.value)}`;
    axios.get(`/api/calculate-timezone?${coordinates}&${datetime}`).then(res => {
      offset.value = res.data;
    }).catch((err) => {
      alertStore.alert.error(err.response.data);
    }).finally(() => {
      gettingTimezone.value = false;
    });
  }, true);
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
.v-col-sm-4 {
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