import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBatchProcessingStore = defineStore('batchProcessingStore', () => {
  const filteredList = ref([]);
  const adjustments = ref({});
  const nonDatetimeAdjustments = ref([]);

  const setFilteredList = (newList) => {
    filteredList.value = newList;
  }

  const setAdjustments = (newAdjustments) => {
    adjustments.value = newAdjustments;
    nonDatetimeAdjustments.value = Object.values(newAdjustments).filter(meta => meta.component !== 'datetime');
  }

  const getAdjustments = () => {
    return adjustments.value;
  }

  const getAdjustedFilteredList = () => {
    return filteredList.value.map(metadata => applyAdjustments({...metadata}));
  }

  const applyAdjustments = (metadata) => {
    for (const adjustment of nonDatetimeAdjustments.value) {
      metadata[adjustment.key] = applyNonDatetimeAdjustment(adjustment, metadata[adjustment.key]);
    }
    return applyDatetimeAdjustment(adjustments.value['date'] || {type: 'none'}, adjustments.value['time'] || {type: 'none'}, metadata);
  }

  const applyNonDatetimeAdjustment = (adjustment, metadataItem) => {
    if (adjustment.type === 'set') {
      return adjustment.adjustment.value;
    }
    return metadataItem + adjustment.adjustment.value;
  }

  const applyDatetimeAdjustment = (dateAdjustment, timeAdjustment, metadata) => {
    if (dateAdjustment.type === 'set') {
      metadata.date = dateAdjustment.adjustment.value;
    }
    if (timeAdjustment.type === 'set') {
      metadata.time = timeAdjustment.adjustment.value;
    }

    let datetime = new Date(`${metadata.date} ${metadata.time}`);

    if (dateAdjustment.type === 'adj') {
      datetime.setFullYear(datetime.getFullYear() + (dateAdjustment.adjustment.year || 0));
      datetime.setMonth(datetime.getMonth() + (dateAdjustment.adjustment.month || 0));
      datetime.setDate(datetime.getDate() + (dateAdjustment.adjustment.day || 0));
    }
    if (timeAdjustment.type === 'adj') {
      datetime.setHours(datetime.getHours() + (timeAdjustment.adjustment.hour || 0));
      datetime.setMinutes(datetime.getMinutes() + (timeAdjustment.adjustment.minute || 0));
      datetime.setSeconds(datetime.getSeconds() + (timeAdjustment.adjustment.second || 0));
    }

    metadata.date = `${padNumber(datetime.getFullYear(), 4)}-${padNumber(datetime.getMonth() + 1)}-${padNumber(datetime.getDate())}`;
    metadata.time = `${padNumber(datetime.getHours())}:${padNumber(datetime.getMinutes())}:${padNumber(datetime.getSeconds())}`;
    return metadata;
  }

  const padNumber = (num, amount = 2) => {
    return String(num).padStart(amount, '0');
  }

  return { filteredList, setFilteredList, setAdjustments, getAdjustments, getAdjustedFilteredList };
}); 
