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
        label="Number"
        placeholder="Number"
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
        placeholder="Lower Bound"
        clear-icon="mdi-window-close"
        @keypress="isValidChar($event)"
        @update:modelValue="debounceUpdate"/>
    </v-col>
    <v-col sm="4" class="pl-6">
      <v-text-field density="compact" variant="outlined" single-line clearable
        v-model="matchValue2" 
        label="Upper Bound"
        placeholder="Upper Bound"
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

const typeChange = async () => {
  await nextTick();
  document.getElementById(inputId).focus();
  debounceUpdate();
}

const isValidChar = (e) => {
  if (/^[+-\.0-9]+$/.test(String.fromCharCode(e.keyCode))) return true;
  e.preventDefault();
}

onMounted(() => document.getElementById(inputId).focus());

const predicate = (metadata) => {
  const subject = Number(metadata[props.matchKey]);
  if (matchValue1.value === '' && matchValue2.value !== '') return subject <= Number(matchValue2.value);
  if (matchValue1.value === '') return true;
  const match1 = Number(matchValue1.value);
  switch (matchOption.value.value) {
    case EQ:
      return subject == match1;
    case NE:
      return subject != match1;
    case GT:
      return subject > match1;
    case LT: 
      return subject < match1;
    case BT: 
      if (matchValue2.value === '') return subject >= match1;
      return subject >= match1 && subject <= Number(matchValue2.value);
  }
}

defineExpose({ predicate });
</script>

<style scoped>

</style>