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
    <v-select :id="inputId" density="compact" variant="outlined" single-line 
      v-model="selectedOptions" 
      :items="props.options" 
      :label="props.optionsLabel" 
      chips 
      multiple
      append-icon="mdi-window-close"
      @update:modelValue="debounceUpdate" 
      @click:append="$emit('delete', props.id)"/>
  </v-col>
</v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emits = defineEmits(['update', 'delete']);
const props = defineProps(['label', 'matchKey', 'id', 'debounce', 'options', 'optionsLabel']);

const inputId = `input-${props.id}`;
const ONE = 'one';
const NONE = 'none';
const matchOptions = [
  {label: 'Is One Of', value: ONE},
  {label: 'Is None Of', value: NONE}
];

const matchOption = ref(matchOptions[0]);
const selectedOptions = ref([]);

var debounceTimer;
const debounceDelay = props.debounce || 500;
const debounceUpdate = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emits('update'), debounceDelay);
}

const typeChange = () => {
  document.activeElement.blur();
  debounceUpdate();
}

onMounted(() => document.getElementById(inputId).click());

const predicate = (metadata) => {
  if (selectedOptions.value.length === 0) return true;
  const subject = metadata[props.matchKey];
  for (let selected of selectedOptions.value) {
    if (subject == selected) {
      return (matchOption.value.value === ONE) ? true : false;
    }
  }
  return (matchOption.value.value === ONE) ? false : true;
}

defineExpose({ predicate });
</script>
