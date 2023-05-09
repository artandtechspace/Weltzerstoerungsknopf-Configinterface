/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from '@/views/AppView.vue'

// Composables
import { createApp } from 'vue'

// Plugins
import vuetify from './vuetify'
import { createPinia } from 'pinia'

const app = createApp(App)
    .use(vuetify)
    .use(createPinia())

app.mount('#app')
