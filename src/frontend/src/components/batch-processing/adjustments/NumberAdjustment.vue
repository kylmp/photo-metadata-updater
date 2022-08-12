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
  <v-col sm="7">
    <v-text-field :id="inputId" density="compact" variant="outlined" single-line clearable
      v-model="adjustmentValue"
      label="Number"
      placeholder="Number"
      :rules="adjustmentOption.rules"
      append-icon="mdi-window-close"
      clear-icon="mdi-window-close"
      @keypress="isValidChar($event)"
      @click:append="$emit('delete', props.id)"/>
  </v-col>
</v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSettingsStore } from '../../../stores/settingsStore';

const emits = defineEmits(['delete']);
const props = defineProps(['label', 'id', 'rules']);
const settingsStore = useSettingsStore();

const inputId = `input-${props.id}`;
const relativeNumberRules = [v => settingsStore.getRegex('number').test(v) || ''];
const setValueRules = props.rules || relativeNumberRules;
const ADJ = 'adj';
const SET = 'set';
const ADD = 'add';
const SUB = 'sub';
const adjustmentOptions = [
  {label: 'Set to', value: SET, rules: setValueRules, adjustmentType: SET}, 
  {label: 'Add', value: ADD, rules: relativeNumberRules, adjustmentType: ADJ},
  {label: 'Subtract', value: SUB, rules: relativeNumberRules, adjustmentType: ADJ}
];

const adjustmentOption = ref(adjustmentOptions[0]);
const adjustmentValue = ref('');

onMounted(() => document.getElementById(inputId).focus());

const isValidChar = (e) => {
  if (/^[+-\.\d]+$/.test(String.fromCharCode(e.keyCode))) return true;
  e.preventDefault();
}

const typeChange = () => {
  document.getElementById(inputId).focus();
}

const hasError = () => {
  return adjustmentOption.value.rules.some(rule => !rule(adjustmentValue.value));
}

const getAdjustment = () => {
  return {
    key: props.label.toLowerCase(), 
    adjustment: Number(adjustmentValue.value) * (adjustmentOption.value.value === SUB ? -1 : 1),
    type: adjustmentOption.value.adjustmentType,
    hasError: hasError()
  };
}

defineExpose({ getAdjustment });
</script>