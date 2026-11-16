import './styles/tokens.css'
import './styles/base.css'

import { createApp } from 'vue'

import App from './App.vue'
import { createAdminRouter } from './router'

createApp(App).use(createAdminRouter()).mount('#app')
