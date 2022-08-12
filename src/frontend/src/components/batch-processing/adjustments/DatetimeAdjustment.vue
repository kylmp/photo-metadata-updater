<template>
<v-row>
  <v-col sm="2" class="pt-5"><span>{{props.label}}</span></v-col>
  <v-col sm="3">
    <v-select density="compact" variant="outlined" single-line return-object 
      v-model="adjustmentOption"
      :items="adjustmentOptions" 
      item-title="label"
      item-value="value"
      label="Adjustment Type" 
      @update:modelValue="typeChange"/>
  </v-col>
  <template v-if="!adjustmentOption.showUnits">
    <v-col sm="7">
      <v-text-field :id="inputId" density="compact" variant="outlined" single-line 
        v-model="adjustmentValue"
        :label="placeholder"
        :placeholder="placeholder"
        :suffix="placeholder"
        :rules="adjustmentOption.rules"
        append-icon="mdi-window-close"
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
  <template v-if="adjustmentOption.showUnits">
    <v-col sm="3">
      <v-text-field :id="inputId" density="compact" variant="outlined" single-line
        v-model="adjustmentValue"
        :label="placeholder"
        :placeholder="placeholder"
        :rules="adjustmentOption.rules"/>
    </v-col>
    <v-col sm="4">
      <v-select density="compact" variant="outlined" single-line return-object 
        v-model="unitOption"
        :items="unitOptions" 
        item-title="label"
        label="Unit"
        append-icon="mdi-window-close"
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
</v-row>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const emits = defineEmits(['delete']);
const props = defineProps(['label', 'id', 'rules']);

const inputId = `input-${props.id}`;
const relativeNumberRules = [v => /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/.test(v) || ''];
const setValueRules = props.rules || relativeNumberRules;
const ADJ = 'adj';
const SET = 'set';
const ADD = 'add';
const SUB = 'sub';
const adjustmentOptions = [
  {label: 'Set to', value: SET, rules: setValueRules, adjustmentType: SET, showUnits: false}, 
  {label: 'Add', value: ADD, rules: relativeNumberRules, adjustmentType: ADJ, showUnits: true},
  {label: 'Subtract', value: SUB, rules: relativeNumberRules, adjustmentType: ADJ, showUnits: true}
];
const timeOptions = [
  {label: 'Hours', multiplier: 3600},
  {label: 'Minutes', multiplier: 60},
  {label: 'Seconds', multiplier: 1}
];
const dateOptions = [
  {label: 'Days', multiplier: 86400}
];
const unitOptions = props.label.toUpperCase() === 'DATE' ? dateOptions : timeOptions;
const format = props.label.toUpperCase() === 'DATE' ? 'YYYY-MM-DD' : 'HH:MM:SS';

const adjustmentOption = ref(adjustmentOptions[0]);
const adjustmentValue = ref('');
const unitOption = ref(unitOptions[0]);
const placeholder = ref(format);

onMounted(() => document.getElementById(inputId).focus());

const typeChange = async () => {
  placeholder.value = (adjustmentOption.value.adjustmentType === SET) ? format : 'Number';
  await nextTick();
  document.getElementById(inputId).focus();
}

const getRelativeAdjustment = () => {
  return Number(adjustmentValue.value) * (adjustmentOption.value.value === SUB ? -1 : 1) * unitOption.value.multiplier;
}

const hasError = () => {
  return adjustmentOption.value.rules.some(rule => !rule(adjustmentValue.value));
}

const getAdjustment = () => {
  const response = {
    key: 'datetime', 
    adjustment: 0,
    type: adjustmentOption.value.adjustmentType,
    hasError: hasError()
  };
  if (!response.hasError) {
    response.adjustment = (response.type === SET) ? adjustmentValue.value : getRelativeAdjustment();
  }
  return response;
}

defineExpose({ getAdjustment });
</script>