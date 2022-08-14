<template>
<component v-for="filter in filters.values()" 
  :key="filter.id" 
  :ref="reference => filterRefs.set(filter.id, reference)" 
  v-bind:is="filter.type" 
  v-bind="filter.props" 
  v-on="filter.on">
</component>
<v-row id="filter-selector" class="pt-2">
  <v-col sm="6" offset-sm="3">
    <v-select density="compact" variant="outlined" single-line 
      v-model="selectedFilter"
      :items="filterOptions" 
      label="Add filter"
      prepend-icon="mdi-plus"
      @update:modelValue="addFilter"/>
  </v-col>
</v-row>
</template>

<script setup>
import { ref, shallowRef, nextTick } from 'vue';
import { usePhotoListStore } from '../../../stores/photoListStore';
import { useBatchProcessingStore } from '../../../stores/batchProcessingStore';
import StringFilter from '../filters/StringFilter.vue';
import NumberFilter from '../filters/NumberFilter.vue';
import DatetimeFilter from '../filters/DatetimeFilter.vue';
import MatcherFilter from '../filters/MatcherFilter.vue';

// Static
const batchProcessingStore = useBatchProcessingStore();
const photoListStore = usePhotoListStore();
const fullList = photoListStore.getFullList();
const fileTypes = [... new Set(fullList.map(metadata => metadata.type))];
const imageProjections = [... new Set(fullList.map(metadata => metadata.projection))];
const tzOffsets = [... new Set(fullList.map(metadata => metadata.tzOffset))];
batchProcessingStore.setFilteredList(fullList);

// Dynamic
const selectedFilter = ref('');
const filterRefs = ref(new Map());
const filters = ref(new Map());

const addFilter = () => {
  if (selectedFilter.value === '') return;
  const component = filterComponentTypes.get(selectedFilter.value);
  const componentProps = JSON.parse(JSON.stringify(component.props));
  const id = `filter-${Math.random().toString(16).slice(2)}`;
  componentProps.id = id;
  componentProps.debounce = updateDebounceTime;
  const finalComponent = {type: component.type, on: component.on, props: componentProps, id: id};
  filters.value.set(id, finalComponent);
  selectedFilter.value = '';
  document.activeElement.blur();
}

const deleteFilter = async (id) => {
  filters.value.delete(id);
  await nextTick(); 
  filterRefs.value.delete(id);
  filterList();
}

// 1. Get list of all predicate functions from filters
// 2. Filter out images with metadata that does not pass every predicate function
const filterList = () => {
  const predicates = Array.from(filterRefs.value.values()).map(filter => filter.predicate);
  batchProcessingStore.setFilteredList(
    fullList.filter(metadata => predicates.every(predicate => predicate(metadata)))
  );
}

// Component definitions the filter options
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