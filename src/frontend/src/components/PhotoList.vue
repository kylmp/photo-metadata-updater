<template>
  <v-navigation-drawer color="indigo-darken-3" permanent>
    <v-list density="compact" height="100%">
      <v-list-subheader>Photo List ({{items.length}} item{{items.length == 1 ? '' : 's'}})</v-list-subheader>
      <v-list-item
        v-for="item in items"
        :key="item.name"
        :value="item.path"
        active-color="primary"
      >
      <v-list-item-title v-text="item.name"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import axios from 'axios'
import { directoryStore } from '@/stores/directory-path'
import { ref } from 'vue'

export default {
  name: 'PhotoList',
  setup() {
    const directory = directoryStore();
    let items = ref([]);

    // Methods
    const updateList = function (directoryPath) {
      axios
        .get('/api/photo?dir='+encodeURI(directoryPath))
        .then((result) => {
          items.value = result.data;
          console.log('list populated with '+result.data.length+' items');
        })
        .catch(() => { 
          items.value = [];
          console.log('error getting list');
        });
    }

    directory.$subscribe((mutation, state) => {
      updateList(state.directory);
    });

    return {
      directory,
      items,
      updateList,
    }
  },
}
</script>