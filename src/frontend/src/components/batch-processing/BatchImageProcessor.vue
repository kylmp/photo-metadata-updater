<template>
<v-card>
  <div class="batch-process-container">
    <v-row class="batch-process-row">
      <v-col sm="3" class="batch-process-col pl-0">
        <filtered-list :show-tooltip="showTooltip" :filtered-list="filteredItems"/>
      </v-col>
      <v-col sm="9" class="batch-process-col">
        <v-row class="pt-4 pb-5">
          <v-col id="filter-container" ref="parentref">
            <v-row id="filter-label"><span class="text-subtitle-1 text-img-name">Filter Options</span></v-row>
            <component v-for="filter in filters.values()" 
              :key="filter.id" 
              :ref="reference => filterRefs.set(filter.id, reference)" 
              v-bind:is="filter.type" 
              v-bind="filter.props" 
              v-on="filter.on"/>
            <v-row class="pl-12 pr-12 pt-2">
              <v-col sm="3"></v-col>
              <v-col sm="6">
                <v-select density="compact" variant="outlined" single-line 
                  v-model="selectedFilter"
                  :items="filterOptions" 
                  label="Add a filter"
                  prepend-icon="mdi-plus"
                  @update:modelValue="addFilter"/>
              </v-col>
              <v-col sm="3"></v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row class="pt-7">
          <span class="text-subtitle-1 text-img-name">Metadata Adjustments</span>
        </v-row>
      </v-col>
    </v-row>
  </div>
  <v-card-actions>
    <v-btn color="img-name" block @click="process">Update Photos</v-btn>
  </v-card-actions>
</v-card>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import { usePhotoListStore } from '../../stores/photoListStore';
import FilteredList from './views/FilteredList.vue';
import StringFilter from './filters/StringFilter.vue';
import NumberFilter from './filters/NumberFilter.vue';
import DatetimeFilter from './filters/DatetimeFilter.vue';
import MatcherFilter from './filters/MatcherFilter.vue';

const emit = defineEmits(['closed']);

// Static
const photoListStore = usePhotoListStore();
const fullList = photoListStore.getFullList();
const fileTypes = [... new Set(fullList.map(metadata => metadata.type))];
const imageProjections = [... new Set(fullList.map(metadata => metadata.projection))];
const tzOffsets = [... new Set(fullList.map(metadata => metadata.tzOffset))];

// Dynamic
const filteredItems = ref(fullList);
const selectedFilter = ref('');
const filterRefs = ref(new Map());
const filters = ref(new Map());
const showTooltip = ref(false);

setTimeout(() => showTooltip.value = true, 3000);

const process = () => {
  emit('closed');
}

const addFilter = () => {
  if (selectedFilter.value === '') return;
  const id = `filter-${Math.random().toString(16).slice(2)}`;
  const component = filterComponentTypes.get(selectedFilter.value);
  const componentProps = JSON.parse(JSON.stringify(component.props));
  componentProps.id = id;
  componentProps.debounce = updateDebounceTime;
  const finalComponent = {type: component.type, on: component.on, props: componentProps, id: id};
  filters.value.set(id, finalComponent);
  selectedFilter.value = '';
  document.activeElement.blur();
}

const deleteFilter = (id) => {
  filterRefs.value.delete(id); // bug: for some reason it does not delete even tho it exists and returns true (value gets set to null)
  filters.value.delete(id);
  filterList();
}

const filterList = () => {
  const predicates = Array.from(filterRefs.value.values())
                          .filter(filter => filter != null) 
                          .map(filter => filter.predicate);
  filteredItems.value = fullList.filter(metadata => predicates.every(predicate => predicate(metadata)));
}

/*
  Defines the different filter component options to dynamically inject if selected
*/
const emits = { update: filterList, delete: deleteFilter };
const updateDebounceTime = 500;
const filterOptions = ['File Name', 'File Type', 'Latitude', 'Longitude', 'Elevation', 'Projection', 'Date', 'Time', 'Timezone'];
const filterComponentTypes = new Map([
  [filterOptions[0], { type: shallowRef(StringFilter),   on: emits, props: {label:'File Name', matchKey:'name'}}],
  [filterOptions[1], { type: shallowRef(MatcherFilter),  on: emits, props: {label:'File Type', matchKey:'type', options: fileTypes, optionsLabel: 'File Types'}}],
  [filterOptions[2], { type: shallowRef(NumberFilter),   on: emits, props: {label:'Latitude', matchKey:'coordinates.latitude'}}],
  [filterOptions[3], { type: shallowRef(NumberFilter),   on: emits, props: {label:'Longitude', matchKey:'coordinates.longitude'}}],
  [filterOptions[4], { type: shallowRef(NumberFilter),   on: emits, props: {label:'Elevation', matchKey:'elevation'}}],
  [filterOptions[5], { type: shallowRef(MatcherFilter),  on: emits, props: {label:'Projection', matchKey:'projection', options: imageProjections, optionsLabel: 'Projections'}}],
  [filterOptions[6], { type: shallowRef(DatetimeFilter), on: emits, props: {label:'Date', matchKey:'createDate'}}],
  [filterOptions[7], { type: shallowRef(DatetimeFilter), on: emits, props: {label:'Time', matchKey:'createTime'}}],
  [filterOptions[8], { type: shallowRef(MatcherFilter),  on: emits, props: {label:'Timezone', matchKey:'tzOffset', options: tzOffsets, optionsLabel: 'Timezones'}}]
]);
</script>

<style scoped>
.v-card {
  width: calc(100vw - 60px);
  max-width: 1200px;
  min-width: 904px; 
  height: calc(100vh - 60px);
  overflow: hidden; 
}

.v-dialog .v-overlay__content > .v-card {
  overflow-y: hidden;
}

.batch-process-container {
  height: calc(100vh - 112px);
  padding-right: 16px;
  padding-left: 16px;
  padding-top: 16px;
  padding-bottom: 0;
}

.batch-process-row {
  height: calc(100% + 12px);
}

.batch-process-col {
  height: 100%;
  padding-bottom: 0;
  overflow-y: auto;
}

#filter-label {
  height: 40px!important;
}

:deep(#filter-container .v-row) {
  height: 64px;
}

:deep(.v-input.v-select .v-field) {
  padding-right: 4px;
}

:deep(.v-input.v-select .v-field__input) {
  padding-right: 0;
}

:deep(.v-field__clearable) {
  margin: 0;
}
</style>