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
  <v-col sm="7">
    <v-text-field :id="inputId" density="compact" variant="outlined" single-line clearable
      v-model="matchText"
      label="Match Text"
      placeholder="Match Text"
      append-icon="mdi-window-close"
      clear-icon="mdi-window-close"
      @update:modelValue="debounceUpdate" 
      @click:append="$emit('delete', props.id)"/>
  </v-col>
</v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emits = defineEmits(['update', 'delete']);
const props = defineProps(['label', 'matchKey', 'id', 'debounce']);

const inputId = `input-${props.id}`;
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

const typeChange = () => {
  document.getElementById(inputId).focus();
  debounceUpdate();
}

onMounted(() => document.getElementById(inputId).focus());

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
