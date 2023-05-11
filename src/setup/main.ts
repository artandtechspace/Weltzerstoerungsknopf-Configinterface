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

const app = createApp(App)
    .use(vuetify)

app.mount('#app')
