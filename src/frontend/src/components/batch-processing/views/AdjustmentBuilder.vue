<template>
<component v-for="adjustment in adjustments.values()" 
  :key="adjustment.id" 
  :ref="reference => adjustmentRefs.set(adjustment.id, reference)" 
  v-bind:is="adjustment.type" 
  v-bind="adjustment.props" 
  v-on="adjustment.on">
</component>
<v-row id="adjustment-selector" class="pt-2">
  <v-col sm="6" offset-sm="3">
    <v-select density="compact" variant="outlined" single-line 
      v-model="selectedAdjustment"
      :items="adjustmentOptions" 
      label="Add adjustment"
      prepend-icon="mdi-plus"
      @update:modelValue="addAdjustment"/>
  </v-col>
</v-row>
</template>

<script setup>
import { ref, shallowRef, nextTick } from 'vue';
import NumberAdjustment from '../adjustments/NumberAdjustment.vue';
import DatetimeAdjustment from '../adjustments/DatetimeAdjustment.vue';
import TimezoneAdjustment from '../adjustments/TimezoneAdjustment.vue';

const selectedAdjustment = ref('');
const adjustmentRefs = ref(new Map());
const adjustments = ref(new Map());

const addAdjustment = () => {
  if (selectedAdjustment.value === '') return;
  const component = adjustmentComponentTypes.get(selectedAdjustment.value);
  const componentProps = JSON.parse(JSON.stringify(component.props));
  const id = `adjustment-${Math.random().toString(16).slice(2)}`;
  componentProps.id = id;
  componentProps.rules = adjustmentRules.get(selectedAdjustment.value);
  const finalComponent = {type: component.type, on: component.on, props: componentProps, id: id};
  adjustments.value.set(id, finalComponent);
  selectedAdjustment.value = '';
  document.activeElement.blur();
}

const deleteAdjustment = async (id) => {
  adjustments.value.delete(id);
  await nextTick(); 
  adjustmentRefs.value.delete(id);
}

// 1. Get a list of all adjustment objects 
// 2. Return null if any adjustment has a value that fails validation
// 3. Reduce/combine adjustments that affect the same key
// Note on order of precedence in map-reduce:
//  - The first "set" value will always be the value used, even if there are further "set" values
//  - "set" values will always overwrite and take precedence over any "adj" values
//  - Multiple "adj" values will be reduced/combined into one final adjustment amount
const calculateAdjustments = () => {
  const adjustments = Array.from(adjustmentRefs.value.values()).map(ref => ref.getAdjustment());

  if (adjustments.some(item => item.hasError)) {
    return null;
  }       

  return Object.values(adjustments.reduce((reduced, add) => {
    const currentValue = reduced[add.key];
    if (currentValue === undefined || (currentValue.type !== 'set' && add.type === 'set')) {
      delete add.hasError;
      reduced[add.key] = add;
    }
    else if (currentValue.type !== 'set') {
      reduced[add.key].adjustment += add.adjustment;
    }
    return reduced;
  }, {}));
}

// Component definitions the adjustment options
const emits = { update: calculateAdjustments, delete: deleteAdjustment };
const adjustmentOptions = ['Latitude', 'Longitude', 'Elevation', 'Date', 'Time', 'Timezone'];
const adjustmentRules = new Map([
  [adjustmentOptions[0], [v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || '', v => v <= 90 && v >= -90 || '']],
  [adjustmentOptions[1], [v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || '', v => v <= 180 && v >= -180 || '']],
  [adjustmentOptions[2], [v => /^[-]?([0-9]+\.?[0-9]*|\.[0-9]+)?$/.test(v) || '']],
  [adjustmentOptions[3], [v => /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/.test(v) || '']],
  [adjustmentOptions[4], [v => /^(?:(?:([01]?\d|2[0-3]):){1}([0-5]{1}\d{1}):)([0-5]{1}\d{1})$/.test(v) || '']],
  [adjustmentOptions[5], [v => /^[+-]{1}[0-1]{1}[0-9]{1}[0-5]{1}[0-9]{1}$/.test(v) || '']]
]);
const adjustmentComponentTypes = new Map([
  [adjustmentOptions[0], { type: shallowRef(NumberAdjustment),   on: emits, props: {label:'Latitude'}}],
  [adjustmentOptions[1], { type: shallowRef(NumberAdjustment),   on: emits, props: {label:'Longitude'}}],
  [adjustmentOptions[2], { type: shallowRef(NumberAdjustment),   on: emits, props: {label:'Elevation'}}],
  [adjustmentOptions[3], { type: shallowRef(DatetimeAdjustment), on: emits, props: {label:'Date'}}],
  [adjustmentOptions[4], { type: shallowRef(DatetimeAdjustment), on: emits, props: {label:'Time'}}],
  [adjustmentOptions[5], { type: shallowRef(TimezoneAdjustment), on: emits, props: {label:'Timezone'}}]
]);

defineExpose({ calculateAdjustments });
</script>

<style scoped>
:deep(.v-field--active .v-text-field__suffix) {
  opacity: 0.5;
}
</style>