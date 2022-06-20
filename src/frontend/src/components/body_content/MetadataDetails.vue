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
      <v-text-field
        label="Date Taken"
        placeholder="YYYY-MM-DD"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Time Taken"
        placeholder="HH:MM:SS"
        variant="outlined"
        density="compact"
      ></v-text-field>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-select
        :items="timezones"
        label="Timezone"
        variant="outlined"
        density="compact">
      </v-select>
    </v-col>
    <v-col cols="12" md="4" hide-details="true">
      <v-text-field
        label="Elevation"
        placeholder="Elevation"
        variant="outlined"
        density="compact"
      ></v-text-field>
      <!-- TODO: Update to use date picker when released in vuetify v3.1 -->
      <!-- <v-menu
        v-model="menu2"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto">
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="date"
            label="Date"
            variant="outlined"
            density="compact"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker v-model="date" @input="menu2 = false"></v-date-picker>
      </v-menu> -->
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
  props: ['metadata'],
  data: () => ({
    date: '2022-05-26',
    menu2: false,
    timezones: [
      'UTC+00 (UK, Ghana, Spain)',
      'UTC+01 (Germany, France, Nigeria)',
      'UTC+02 (Finland, South Africa, Ukraine)',
      'UTC+03 (Russia/Moscow, Kenya, Turkey)',
      'UTC+03:30 (Iran)',
      'UTC+04 (UAE, Armenia)',
      'UTC+04:30 (Afghanistan)',
      'UTC+05 (Pakistan, Maldives)',
      'UTC+05:30 (India, Sri Lanka)',
      'UTC+05:45 (Nepal)',
      'UTC+06 (Bangladesh, Kazakhstan)',
      'UTC+06:30 (Myanmar)',
      'UTC+07 (Thailand, Vietnam)',
      'UTC+08 (China, Singapore, Australia AWST)',
      'UTC+08:45 (Australia ACWST)',
      'UTC+09 (Japan, South Korea)',
      'UTC+09:30 (Australia ACST)',
      'UTC+10 (Australia AEST, Guam)',
      'UTC+10:30 (Lord Howe Island)',
      'UTC+11 (Solomon Islands, Vanuatu)',
      'UTC+12 (New Zealand, Fiji)',
      'UTC+12:45 (Chatham Islands)',
      'UTC+13 (Tonga, Samoa)',
      'UTC+14 (Kiribati Line Islands)',
      'UTC-12 (Baker Island, Howland Island)',
      'UTC-11 (Samoa, Niue)',
      'UTC-10 (Hawaii, Cook Islands)',
      'UTC-09:30 (Marquesas Islands)',
      'UTC-09 (Alaska)',
      'UTC-08 (Pacific PST)',
      'UTC-07 (Mountain MST)',
      'UTC-06 (Central CST, Mexico)',
      'UTC-05 (Eastern EST, Bahamas, Peru)',
      'UTC-04 (Atlantic, Carribean Islands)',
      'UTC-03:30 (Newfoundland)',
      'UTC-03 (Argentina, Brazil, Chile)',
      'UTC-02 (South Sandwich Islands)',
      'UTC-01 (Cape Verde, Ittoqqortoormiit)'
    ]
  }),
}
</script>

<style scoped>
.v-col-md-4 {
    height: 58px;
}
</style>