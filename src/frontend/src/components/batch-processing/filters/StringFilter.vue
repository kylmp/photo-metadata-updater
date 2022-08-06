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
  <v-col sm="7">
    <v-text-field density="compact" variant="outlined" single-line 
      v-model="matchText"
      label="Match Text"
      append-icon="mdi-window-close"
      @update:modelValue="debounceUpdate" 
      @click:append="$emit('delete', props.id)"/>
  </v-col>
</v-row>
</template>

<script setup>
import { ref } from 'vue';

const emits = defineEmits(['update', 'delete']);
const props = defineProps(['label', 'matchKey', 'id', 'debounce']);

const START = 'start';
const END = 'end';
const CONTAIN = 'contain';
const matchOptions = [
  {label: 'Contains', value: CONTAIN}, 
  {label: 'Starts With', value: START},
  {label: 'Ends With', value: END}
];

const matchOption = ref(matchOptions[0]);
const matchText = ref('');

var debounceTimer;
const debounceDelay = props.debounce || 500;
const debounceUpdate = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emits('update'), debounceDelay);
}

const predicate = (metadata) => {
  if (matchText.value === '') return true;
  const subject = metadata[props.matchKey];
  switch (matchOption.value.value) {
    case CONTAIN:
      return subject.includes(matchText.value);
    case START:
      return subject.startsWith(matchText.value);
    case END:
      return subject.endsWith(matchText.value);
  }
}

defineExpose({ predicate });
</script>