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
      @update:modelValue="debounceUpdate"/>
  </v-col>
  <template v-if="!matchOption.hasTwoFields">
    <v-col sm="7">
      <v-text-field density="compact" variant="outlined" single-line 
        v-model="matchValue1"
        :label="props.label"
        append-icon="mdi-window-close"
        @update:modelValue="debounceUpdate" 
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
  <template v-if="matchOption.hasTwoFields">
    <v-col sm="3" class="pr-0">
      <v-text-field density="compact" variant="outlined" single-line 
        v-model="matchValue1" 
        label="Lower Bound"
        @update:modelValue="debounceUpdate"/>
    </v-col>
    <v-col sm="4" class="pl-6">
      <v-text-field density="compact" variant="outlined" single-line 
        v-model="matchValue2" 
        label="Upper Bound"
        append-icon="mdi-window-close"
        @update:modelValue="debounceUpdate" 
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
</v-row>
</template>

<script setup>
import { ref } from 'vue';

const emits = defineEmits(['update', 'delete']);
const props = defineProps(['label', 'matchKey', 'id', 'debounce']);

const format = ref(props.matchKey.toUpperCase() === 'CREATEDATE' ? 'YYYY-MM-DD' : 'HH:MM:SS');
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

const matchOption = ref(matchOptions[0]);
const matchValue1 = ref('');
const matchValue2 = ref('');

var debounceTimer;
const debounceDelay = props.debounce || 500;
const debounceUpdate = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emits('update'), debounceDelay);
}

const convertDateTimeToNumber = (datetime) => {
  if (props.matchKey.toUpperCase() === 'CREATEDATE') {
    return new Date(datetime).getTime();
  }
  else if (props.matchKey.toUpperCase() === 'CREATETIME') {
    const parts = datetime.split(':');
    return (Number(parts[0] || 0) * 60 * 60) + (Number(parts[1] || 0) * 60) + Number(parts[2] || 0);
  }
  return -1;
}

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