import { createApp } from 'vue'
import { vuetifyConfig } from './plugins/vuetify-config'
import { createVuetify } from 'vuetify'
import { loadFonts } from './plugins/webfontloader'
import { createPinia } from 'pinia'
import PhotoMetadataUpdater from './PhotoMetadataUpdater.vue'

loadFonts();
const pinia = createPinia();
const vuetify = createVuetify(vuetifyConfig);

const photoMetadataUpdaterApp = createApp(PhotoMetadataUpdater);
photoMetadataUpdaterApp.use(pinia);
photoMetadataUpdaterApp.use(vuetify);

photoMetadataUpdaterApp.mount('#photo-metadata-updater-app');
