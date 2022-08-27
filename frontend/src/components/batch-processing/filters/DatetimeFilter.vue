<template>
<v-row>
  <v-col sm="2" class="pt-5"><span>{{props.label}}</span></v-col>
  <v-col sm="3">
    <v-select density="compact" variant="outlined" single-line return-object 
      v-model="matchOption"
      :items="matchOptions" 
      item-title="label"
      item-value="value"
      label="Match Type"
      @update:modelValue="typeChange"/>
  </v-col>
  <template v-if="!matchOption.hasTwoFields">
    <v-col sm="7">
      <v-text-field :id="inputId" density="compact" variant="outlined" single-line clearable
        v-model="matchValue1"
        :label="props.label"
        :placeholder="format"
        append-icon="mdi-window-close"
        clear-icon="mdi-window-close"
        @keypress="isValidChar($event)"
        @update:modelValue="debounceUpdate" 
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
  <template v-if="matchOption.hasTwoFields">
    <v-col sm="3" class="pr-0">
      <v-text-field :id="inputId" density="compact" variant="outlined" single-line clearable
        v-model="matchValue1" 
        label="Lower Bound"
        :placeholder="format"
        clear-icon="mdi-window-close"
        @keypress="isValidChar($event)"
        @update:modelValue="debounceUpdate"/>
    </v-col>
    <v-col sm="4" class="pl-6">
      <v-text-field density="compact" variant="outlined" single-line clearable
        v-model="matchValue2" 
        label="Upper Bound"
        :placeholder="format"
        append-icon="mdi-window-close"
        clear-icon="mdi-window-close"
        @keypress="isValidChar($event)"
        @update:modelValue="debounceUpdate" 
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
</v-row>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';

const emits = defineEmits(['update', 'delete']);
const props = defineProps(['label', 'matchKey', 'id', 'debounce']);

const inputId = `input-${props.id}`;
const EQUALS = 'equals'
const BEFORE = 'before';
const AFTER = 'after';
const BETWEEN = 'between';
const matchOptions = [
  {label: 'Before', value: BEFORE, hasTwoFields: false}, 
  {label: 'After', value: AFTER, hasTwoFields: false},
  {label: 'Equals', value: EQUALS, hasTwoFields: false},
  {label: 'Between', value: BETWEEN, hasTwoFields: true}
];

const format = ref(props.matchKey.toUpperCase() === 'DATE' ? 'YYYY-MM-DD' : 'HH:MM:SS');
const matchOption = ref(matchOptions[0]);
const matchValue1 = ref('');
const matchValue2 = ref('');

var debounceTimer;
const debounceDelay = props.debounce || 500;
const debounceUpdate = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emits('update'), debounceDelay);
}

const typeChange = async () => {
  await nextTick();
  document.getElementById(inputId).focus();
  debounceUpdate();
}

const isValidChar = (e) => {
  if (/^[-:0-9]+$/.test(String.fromCharCode(e.keyCode))) return true;
  e.preventDefault();
}

const convertDateTimeToNumber = (datetime) => {
  if (props.matchKey.toUpperCase() === 'DATE') {
    return new Date(datetime).getTime();
  }
  else if (props.matchKey.toUpperCase() === 'TIME') {
    const parts = datetime.split(':');
    return (Number(parts[0] || 0) * 60 * 60) + (Number(parts[1] || 0) * 60) + Number(parts[2] || 0);
  }
  return -1;
}

onMounted(() => document.getElementById(inputId).focus());

const predicate = (metadata) => {
  const subject = convertDateTimeToNumber(metadata[props.matchKey]);
  if (matchValue1.value === '' && matchValue2.value !== '') return subject <= convertDateTimeToNumber(matchValue2.value);
  if (matchValue1.value === '') return true;
  switch (matchOption.value.value) {
    case EQUALS:
      return subject == convertDateTimeToNumber(matchValue1.value);
    case BEFORE:
      return subject < convertDateTimeToNumber(matchValue1.value);
    case AFTER:
      return subject > convertDateTimeToNumber(matchValue1.value);
    case BETWEEN:
      if (matchValue2.value === '') return subject >= convertDateTimeToNumber(matchValue1.value);
      return subject >= convertDateTimeToNumber(matchValue1.value) && subject <= convertDateTimeToNumber(matchValue2.value);
  }
}

defineExpose({ predicate });
</script>
