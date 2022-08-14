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
    <template v-if="adjustmentOption.value === SET">
    <v-text-field :id="inputId" density="compact" variant="outlined" single-line clearable
      v-model="adjustmentValue"
      label="Timezone Offset"
      placeholder="+HH:MM"
      suffix="+HH:MM"
      :rules="adjustmentOption.rules"
      append-icon="mdi-window-close"
      clear-icon="mdi-window-close"
      @keypress="isValidChar($event)"
      @click:append="$emit('delete', props.id)"/>
    </template>
    <template v-if="adjustmentOption.value === CAL">
    <v-text-field :id="inputId" density="compact" variant="outlined" single-line readonly
      v-model="adjustmentValue"
      append-icon="mdi-window-close"
      @click:append="$emit('delete', props.id)"/>
    </template>
  </v-col>
</v-row>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';

const emits = defineEmits(['delete']);
const props = defineProps(['label', 'id', 'rules']);

const inputId = `input-${props.id}`;
const SET = 'set';
const CAL = 'cal'
const adjustmentOptions = [
  {label: 'Set to', value: SET, rules: props.rules, adjustmentType: SET}, 
  {label: 'Calculate', value: CAL, rules: null, adjustmentType: SET}
];

const adjustmentOption = ref(adjustmentOptions[0]);
const adjustmentValue = ref('');
var setValue = '';

onMounted(() => document.getElementById(inputId).focus());

const isValidChar = (e) => {
  if (/^[+-\d]+$/.test(String.fromCharCode(e.keyCode))) return true;
  e.preventDefault();
}

const typeChange = async () => {
  await nextTick();
  if (adjustmentOption.value.value === CAL) {
    setValue = adjustmentValue.value;
    adjustmentValue.value = 'Calculates timezone from coordinates';
    document.activeElement.blur();
  } else {
    adjustmentValue.value = setValue;
    document.getElementById(inputId).focus();
  }
}

const hasError = () => {
  if (adjustmentOption.value.value === CAL) return false;
  return adjustmentOption.value.rules.some(rule => !rule(adjustmentValue.value));
}

const getAdjustment = () => {
  return {
    key: 'timezone', 
    adjustment: (adjustmentOption.value.value === CAL) ? 'calculate' : adjustmentValue.value,
    type: adjustmentOption.value.adjustmentType,
    hasError: hasError()
  };
}

defineExpose({ getAdjustment });
</script>