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
        label="Number"
        append-icon="mdi-window-close"
        @keypress="isValidChar($event)"
        @update:modelValue="debounceUpdate" 
        @click:append="$emit('delete', props.id)"/>
    </v-col>
  </template>
  <template v-if="matchOption.hasTwoFields">
    <v-col sm="3" class="pr-0">
      <v-text-field density="compact" variant="outlined" single-line 
        v-model="matchValue1" 
        label="Lower Bound"
        @keypress="isValidChar($event)"
        @update:modelValue="debounceUpdate"/>
    </v-col>
    <v-col sm="4" class="pl-6">
      <v-text-field density="compact" variant="outlined" single-line 
        v-model="matchValue2" 
        label="Upper Bound"
        append-icon="mdi-window-close"
        @keypress="isValidChar($event)"
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

const EQ = 'equals';
const NE = 'notequals';
const GT = 'greaterthan';
const LT = 'lessthan';
const BT = 'between';
const matchOptions = [
  {label: 'Equals', value: EQ, hasTwoFields: false}, 
  {label: 'Not Equals', value: NE, hasTwoFields: false},
  {label: 'Greater Than', value: GT, hasTwoFields: false},
  {label: 'Less Than', value: LT, hasTwoFields: false},
  {label: 'Between', value: BT, hasTwoFields: true}
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

const isValidChar = (e) => {
  if (/^[+-\.0-9]+$/.test(String.fromCharCode(e.keyCode))) return true;
  e.preventDefault();
}

const predicate = (metadata) => {
  // todo remove hardcoded exception to nested key
  const subject = (props.matchKey.startsWith('coordinates')) ? metadata['coordinates'][props.matchKey.split('\.')[1]] : metadata[props.matchKey];
  if (matchValue1.value === '' && matchValue2.value !== '') return subject <= matchValue2.value;
  if (matchValue1.value === '') return true;
  switch (matchOption.value.value) {
    case EQ:
      return subject == matchValue1.value;
    case NE:
      return subject != matchValue1.value;
    case GT:
      return subject > matchValue1.value;
    case LT: 
      return subject < matchValue1.value;
    case BT: 
      if (matchValue2.value === '') return subject >= matchValue1.value;
      return subject >= matchValue1.value && subject <= matchValue2.value;
  }
}

defineExpose({ predicate });
</script>

<style scoped>

</style>